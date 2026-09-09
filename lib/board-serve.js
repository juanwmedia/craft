// board-serve: zero-dependency dev server for the Craft living docs + dashboard.
//   node board-serve.js --root <docs/craft> --repo <repo-for-diffs> [--port 7331]
//   node board-serve.js --url  [--port 7331]                        prints the URL if a board is already up, exit 1 if not
//   node board-serve.js --stop [--port 7331]                        stops the server it started on that port
// Routes:
//   /                     → dashboard (scans every <root>/*/data.json + decisions.md)
//   /dashboard.json       → the aggregated scan
//   /f/<slug>/            → that feature's living board (shared template)
//   /f/<slug>/data.json   → that feature's truth
//   /f/<slug>/<asset>     → that feature's files (how-it-works.svg, artboards, images, …)
//   /diff?file=<path>     → real `git diff` against --repo
//   /events               → SSE live-reload (watches the whole root)
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(arg('--root', process.cwd()));
const REPO = path.resolve(arg('--repo', ROOT));
const PORT = parseInt(arg('--port', '7331'), 10);
const LIB = __dirname;
const PID_FILE = path.join(os.tmpdir(), `board-serve-${PORT}.pid`);
const clients = new Set();

function stop() {
  let pid = null;
  try { pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10); } catch (e) { /* no record of starting one */ }
  if (!pid) {
    return execFile('lsof', ['-ti', `:${PORT}`], (err, out) => {
      const held = (out || '').trim().split('\n').filter(Boolean).join(', ');
      console.log(held
        ? `Craft: port ${PORT} is held by pid ${held}, which the board server has no record of starting. Left running.`
        : `Craft: nothing is running on port ${PORT}.`);
    });
  }
  try { process.kill(pid, 'SIGTERM'); console.log(`Craft: stopped the board on port ${PORT} (pid ${pid})`); }
  catch (e) { console.log(`Craft: the board on port ${PORT} (pid ${pid}) was already gone`); }
  try { fs.unlinkSync(PID_FILE); } catch (e) { /* already gone */ }
}

const BOARD_URL = `http://localhost:${PORT}/`;

if (process.argv.includes('--url')) {
  return http.get(BOARD_URL, (r) => { if (r.statusCode === 200) console.log(BOARD_URL); process.exit(r.statusCode === 200 ? 0 : 1); })
    .on('error', () => process.exit(1));
}

if (process.argv.includes('--stop')) return stop();

const send = (res, code, ct, body) => { res.writeHead(code, { 'Content-Type': ct + '; charset=utf-8' }); res.end(body); };
const pipe = (res, file, ct) => { res.writeHead(200, { 'Content-Type': ct + '; charset=utf-8' }); fs.createReadStream(file).pipe(res); };
const CT = { '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };

function gitDiff(file, cb) {
  const abs = path.resolve(REPO, file);
  if (!abs.startsWith(REPO + path.sep)) return cb('-- path not allowed --');
  execFile('git', ['-C', REPO, 'diff', 'HEAD', '--', file], { maxBuffer: 8 * 1024 * 1024 }, (e, out) => {
    if (out && out.trim()) return cb(out);
    execFile('git', ['-C', REPO, 'diff', '--no-index', '/dev/null', file], { maxBuffer: 8 * 1024 * 1024 }, (e2, out2) =>
      cb(out2 && out2.trim() ? out2 : '-- no diff found --'));
  });
}

function scanDashboard() {
  const out = { features: [], decisions: '' };
  for (const slug of fs.readdirSync(ROOT)) {
    const dj = path.join(ROOT, slug, 'data.json');
    if (!fs.existsSync(dj)) continue;
    try {
      const d = JSON.parse(fs.readFileSync(dj, 'utf8'));
      const tasks = d.tasks || [], what = d.what || [], phases = d.phases || [];
      const tdone = tasks.filter(t => t.status === 'done').length;
      const allDone = phases.length && phases.every(p => p.state === 'done');
      const anyProgress = phases.some(p => p.state !== 'todo') || tdone > 0;
      out.features.push({
        slug, feature: d.feature, tagline: d.tagline,
        phases: phases.map(p => ({ id: p.id, label: p.label, state: p.state })),
        tasks: { done: tdone, total: tasks.length },
        acs: { done: what.filter(a => a.done).length, total: what.length },
        dependsOn: d.dependsOn || [],
        status: allDone ? 'done' : anyProgress ? 'in-progress' : 'draft',
      });
    } catch (e) { /* skip malformed */ }
  }
  const dm = path.join(ROOT, 'decisions.md');
  if (fs.existsSync(dm)) out.decisions = fs.readFileSync(dm, 'utf8');
  return out;
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const p = u.pathname;
  if (p === '/') return pipe(res, path.join(LIB, 'dashboard-template.html'), 'text/html');
  if (p === '/dashboard.json') return send(res, 200, 'application/json', JSON.stringify(scanDashboard()));
  if (p === '/diff') return gitDiff(u.searchParams.get('file') || '', (out) => send(res, 200, 'text/plain', out));
  if (p === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }
  const m = p.match(/^\/f\/([^/]+)(\/.*)?$/);
  if (m) {
    const slug = m[1], rest = (m[2] || '/').replace(/^\//, '');
    if (rest === '') return pipe(res, path.join(LIB, 'doc-template.html'), 'text/html');
    if (rest === 'support.js') return send(res, 200, 'application/javascript', '');
    const fp = path.join(ROOT, slug, decodeURIComponent(rest));
    if (fp.startsWith(path.join(ROOT, slug) + path.sep) && fs.existsSync(fp) && fs.statSync(fp).isFile())
      return pipe(res, fp, CT[path.extname(fp)] || 'application/octet-stream');
  }
  send(res, 404, 'text/plain', 'not found');
});

server.on('error', (e) => {
  console.error(e.code === 'EADDRINUSE'
    ? `Craft: port ${PORT} is already in use. \`--url\` says whether it is a board, \`--stop\` ends one started here.`
    : String(e));
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  fs.writeFileSync(PID_FILE, String(process.pid));
  console.log(`Craft ${BOARD_URL}   (root: ${ROOT})`);
});

const bye = () => { try { fs.unlinkSync(PID_FILE); } catch (e) { /* already gone */ } process.exit(0); };
process.on('SIGINT', bye);
process.on('SIGTERM', bye);

// Any data.json/asset change under the root pushes a reload to whatever page is open.
let timer = null;
try { fs.watch(ROOT, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => { for (const c of clients) c.write('data: reload\n\n'); }, 150); }); } catch (e) { /* recursive watch unsupported */ }
