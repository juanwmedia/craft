// craft-serve — zero-dependency dev server for the Craft living docs + dashboard.
//   node craft-serve.js --root <docs/specs> --repo <repo-for-diffs> [--port 7331]
// Routes:
//   /                     → dashboard (scans every <root>/*/data.json + decisions.md)
//   /dashboard.json       → the aggregated scan
//   /f/<slug>/            → that feature's living board (shared template)
//   /f/<slug>/data.json   → that feature's truth
//   /f/<slug>/<asset>     → that feature's files (mockup.html, svg, …)
//   /diff?file=<path>     → real `git diff` against --repo
//   /events               → SSE live-reload (watches the whole root)
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(arg('--root', process.cwd()));
const REPO = path.resolve(arg('--repo', ROOT));
const PORT = parseInt(arg('--port', '7331'), 10);
const LIB = __dirname;
const clients = new Set();

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

// Minimal line-based read of the registry (zero-dep). Feature entries are at 2-space indent;
// phases/depends-on are deeper and ignored. Only name/title/status are needed for the dashboard.
function parseRegistry() {
  const f = path.join(ROOT, 'index.yaml');
  if (!fs.existsSync(f)) return [];
  const out = []; let cur = null;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const mn = line.match(/^  - name:\s*(.+?)\s*$/);
    if (mn) { if (cur) out.push(cur); cur = { name: mn[1], title: mn[1], status: 'unknown' }; continue; }
    if (!cur) continue;
    const mt = line.match(/^    title:\s*(.+?)\s*$/); if (mt) { cur.title = mt[1]; continue; }
    const ms = line.match(/^    status:\s*(.+?)\s*$/); if (ms) { cur.status = ms[1]; continue; }
  }
  if (cur) out.push(cur);
  return out;
}

function scanDashboard() {
  const out = { features: [], registry: parseRegistry(), decisions: '' };
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

http.createServer((req, res) => {
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
    const fp = path.join(ROOT, slug, decodeURIComponent(rest));
    if (fp.startsWith(path.join(ROOT, slug) + path.sep) && fs.existsSync(fp) && fs.statSync(fp).isFile())
      return pipe(res, fp, CT[path.extname(fp)] || 'application/octet-stream');
  }
  send(res, 404, 'text/plain', 'not found');
}).listen(PORT, '127.0.0.1', () => console.log(`Craft → http://localhost:${PORT}   (root: ${ROOT})`));

// Any data.json/asset change under the root pushes a reload to whatever page is open.
let timer = null;
try { fs.watch(ROOT, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => { for (const c of clients) c.write('data: reload\n\n'); }, 150); }); } catch (e) { /* recursive watch unsupported */ }
