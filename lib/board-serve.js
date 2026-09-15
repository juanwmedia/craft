// board-serve: zero-dependency dev server for the Craft living docs + dashboard.
//   node board-serve.js --add <tree> [--port 7331]   registers the repo of <tree> (starting the
//                                                      server if none is up yet, over HTTP if one is)
//   node board-serve.js --url  [--port 7331]          prints the dashboard URL if a board is already up, exit 1 if not
//   node board-serve.js --stop [--port 7331]          stops the server it started on that port
// Routes:
//   /                            → the global dashboard, every registered repo grouped, owner rule applied
//   /dashboard.json              → the aggregated scan behind it: { repos: [...] }
//   /register?tree=<path>        → registers <path>'s repo (used by --add against a running server)
//   /t/<name>/                   → that tree's own raw dashboard: every board in it, no owner rule
//   /t/<name>/dashboard.json     → the raw scan behind it
//   /t/<name>/f/<slug>/          → that feature's living board on that tree (shared template)
//   /t/<name>/f/<slug>/data.json → that feature's truth, on that tree
//   /t/<name>/f/<slug>/meta.json → { repo, tree, branch, worktree } for that tree
//   /t/<name>/f/<slug>/diff      → real `git diff` against that tree
//   /t/<name>/f/<slug>/<asset>   → that feature's files on that tree (how-it-works.svg, artboards, images, …)
//   /events                      → SSE live-reload (watches every registered tree)
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile, execFileSync } = require('child_process');

const DOCS_CRAFT = 'docs/craft';
const DATA_JSON = 'data.json';
const DECISIONS_MD = 'decisions.md';
const RELOAD_EVENT = 'data: reload\n\n';
const ORDER = { 'in-progress': 0, draft: 1, done: 2 };
const CT = { '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png' };

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const PORT = parseInt(arg('--port', '7331'), 10);
const LIB = __dirname;
const PID_FILE = path.join(os.tmpdir(), `board-serve-${PORT}.pid`);
const REG_FILE = path.join(os.tmpdir(), `board-serve-${PORT}.repos.json`);
const BOARD_URL = `http://localhost:${PORT}/`;
const DOCS_CRAFT_RE = new RegExp(`^${DOCS_CRAFT.replace('/', '\\/')}\\/([^/]+)\\/`);

function realpath(p) { try { return fs.realpathSync(p); } catch (e) { return path.resolve(p); } }

function git(cwd, args) {
  try { return execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch (e) { return (e.stdout || '').toString().trim(); }
}

function mainTreeOf(treePath) {
  const out = git(treePath, ['worktree', 'list', '--porcelain']);
  const m = out.match(/^worktree (.+)$/m);
  return m ? realpath(m[1]) : null;
}

function treeRootOf(treePath) {
  const out = git(treePath, ['rev-parse', '--show-toplevel']);
  return out ? realpath(out) : treePath;
}

function treesOf(main) {
  const out = git(main, ['worktree', 'list', '--porcelain']);
  const trees = [];
  for (const block of out.split('\n\n')) {
    const p = (block.match(/^worktree (.+)$/m) || [])[1];
    if (!p) continue;
    const branch = (block.match(/^branch refs\/heads\/(.+)$/m) || [])[1] || 'detached';
    trees.push({ path: realpath(p), branch, main: trees.length === 0 });
  }
  return trees;
}

// The owner rule (D2): a linked tree owns the slugs its branch changed under docs/craft
// since it diverged from the main tree, plus whatever it holds there untracked.
function ownerSlugs(treePath, mainBranch) {
  const base = git(treePath, ['merge-base', mainBranch, 'HEAD']);
  const slugs = new Set();
  if (!base) return slugs;
  const changed = git(treePath, ['diff', '--name-only', base, '--', DOCS_CRAFT]);
  const untracked = git(treePath, ['ls-files', '--others', '--exclude-standard', '--', DOCS_CRAFT]);
  for (const f of (changed + '\n' + untracked).split('\n')) {
    const m = f.match(DOCS_CRAFT_RE);
    if (m) slugs.add(m[1]);
  }
  return slugs;
}

module.exports = { ownerSlugs, treesOf, mainTreeOf, watchTargetOf, DOCS_CRAFT };

let server = null;

function runCli() {
  if (process.argv.includes('--stop')) return stop();
  if (process.argv.includes('--url')) return checkUrl();
  const add = arg('--add', null);
  if (add) return addTree(treeRootOf(realpath(path.resolve(add))));
  console.log('Usage: board-serve.js --add <tree> | --url | --stop  [--port 7331]');
  process.exit(1);
}

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

function checkUrl() {
  http.get(BOARD_URL, (r) => { if (r.statusCode === 200) console.log(BOARD_URL); process.exit(r.statusCode === 200 ? 0 : 1); })
    .on('error', () => process.exit(1));
}

function printAdded(info) {
  console.log(`Craft ${(info && info.dashboard) || BOARD_URL}`);
  if (info && info.tree) console.log(`Tree  ${info.tree}`);
}
function safeParse(s) { try { return JSON.parse(s); } catch (e) { return {}; } }

function addTree(treePath) {
  http.get(BOARD_URL + 'dashboard.json', (r) => {
    if (r.statusCode !== 200) return becomeServer(treePath);
    http.get(BOARD_URL + 'register?tree=' + encodeURIComponent(treePath), (r2) => {
      let body = ''; r2.on('data', c => body += c); r2.on('end', () => {
        if (r2.statusCode !== 200) { console.error(`Craft: ${treePath} is not a git tree.`); process.exit(1); }
        printAdded(safeParse(body)); process.exit(0);
      });
    }).on('error', () => becomeServer(treePath));
  }).on('error', () => becomeServer(treePath));
}

function becomeServer(treePath) {
  const main = register(treePath);
  if (!main) { console.error(`Craft: ${treePath} is not a git tree.`); process.exit(1); }
  server.listen(PORT, '127.0.0.1', () => {
    fs.writeFileSync(PID_FILE, String(process.pid));
    refreshTrees();
    printAdded({ dashboard: BOARD_URL, tree: treeUrlFor(treePath) });
  });
}

function treeUrlFor(treePath) {
  const hit = Object.entries(lastScan.treeIndex).find(([, v]) => v.tree.path === treePath);
  return hit ? `${BOARD_URL}t/${encodeURIComponent(hit[0])}/` : null;
}

function readRegistry() { try { return JSON.parse(fs.readFileSync(REG_FILE, 'utf8')); } catch (e) { return []; } }
function writeRegistry(list) { fs.writeFileSync(REG_FILE, JSON.stringify([...new Set(list)], null, 2)); }
function pruneRegistry() { const alive = readRegistry().filter(p => fs.existsSync(p)); writeRegistry(alive); return alive; }
function register(treePath) {
  const main = mainTreeOf(treePath);
  if (!main) return null;
  writeRegistry([...readRegistry(), main]);
  return main;
}

let lastScan = { repos: [], treeIndex: {} };
const watched = new Map();

function watchTargetOf(p) {
  const root = path.join(p, DOCS_CRAFT);
  if (fs.existsSync(root)) return { dir: root, recursive: true };
  const docs = path.dirname(root);
  if (fs.existsSync(docs)) return { dir: docs, recursive: false };
  return { dir: p, recursive: false };
}

function ensureWatch(p) {
  if (watched.has(p)) return;
  const { dir, recursive } = watchTargetOf(p);
  try {
    const w = fs.watch(dir, { recursive }, () => {
      if (!recursive) { try { w.close(); } catch (e) { /* already gone */ } watched.delete(p); ensureWatch(p); }
      scheduleReload();
    });
    w.on('error', () => { try { w.close(); } catch (e) { /* already gone */ } watched.delete(p); });
    watched.set(p, w);
  } catch (e) { /* recursive watch unsupported */ }
}
function pruneWatchers(validPaths) {
  for (const [p, w] of watched) if (!validPaths.has(p)) { try { w.close(); } catch (e) { /* already gone */ } watched.delete(p); }
}

function refreshTrees() {
  const names = new Set();
  const treeIndex = {};
  const repos = [];
  const validPaths = new Set();
  for (const main of pruneRegistry()) {
    const trees = treesOf(main).filter(t => fs.existsSync(t.path));
    if (!trees.length) continue;
    const repo = { name: path.basename(main), path: main, trees: [] };
    for (const t of trees) {
      let n = path.basename(t.path), i = 2;
      while (names.has(n)) n = `${path.basename(t.path)}-${i++}`;
      names.add(n); t.name = n;
      treeIndex[n] = { tree: t, repo };
      repo.trees.push(t);
      validPaths.add(t.path);
      ensureWatch(t.path);
    }
    repos.push(repo);
  }
  pruneWatchers(validPaths);
  lastScan = { repos, treeIndex };
  return lastScan;
}

function resolveTreeByName(name) {
  if (!lastScan.treeIndex[name]) refreshTrees();
  return lastScan.treeIndex[name] || null;
}

function slugsIn(treePath) {
  const root = path.join(treePath, DOCS_CRAFT);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).filter(s => fs.existsSync(path.join(root, s, DATA_JSON)));
}

function ago(ms) {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function featureOf(tree, slug, repo) {
  const dj = path.join(tree.path, DOCS_CRAFT, slug, DATA_JSON);
  let d, stat;
  try { d = JSON.parse(fs.readFileSync(dj, 'utf8')); stat = fs.statSync(dj); } catch (e) { return null; }
  const tasks = d.tasks || [], what = d.what || [], phases = d.phases || [];
  const tdone = tasks.filter(t => t.status === 'done').length;
  const allDone = phases.length && phases.every(p => p.state === 'done');
  const anyProgress = phases.some(p => p.state !== 'todo') || tdone > 0;
  return {
    slug, feature: d.feature, tagline: d.tagline, tree: tree.name, branch: tree.branch,
    worktree: tree.main ? null : path.relative(repo.path, tree.path),
    phases: phases.map(p => ({ id: p.id, label: p.label, state: p.state })),
    tasks: { done: tdone, total: tasks.length },
    acs: { done: what.filter(a => a.done).length, total: what.length },
    dependsOn: d.dependsOn || [],
    status: allDone ? 'done' : anyProgress ? 'in-progress' : 'draft',
    touched: ago(stat.mtimeMs), touchedMs: stat.mtimeMs,
  };
}

function readDecisionsMd(mainPath) {
  const dm = path.join(mainPath, DOCS_CRAFT, DECISIONS_MD);
  return fs.existsSync(dm) ? fs.readFileSync(dm, 'utf8') : '';
}

function scanRepos() {
  const { repos } = refreshTrees();
  for (const repo of repos) {
    const trees = repo.trees, mainTree = trees[0];
    const claimed = new Set();
    const features = [];
    for (const t of trees.slice(1)) {
      const owned = ownerSlugs(t.path, mainTree.branch);
      for (const s of slugsIn(t.path)) if (owned.has(s)) { claimed.add(s); const f = featureOf(t, s, repo); if (f) features.push(f); }
    }
    for (const s of slugsIn(mainTree.path)) if (!claimed.has(s)) { const f = featureOf(mainTree, s, repo); if (f) features.push(f); }
    features.sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9) || b.touchedMs - a.touchedMs);
    repo.decisions = readDecisionsMd(mainTree.path);
    repo.features = features;
  }
  return { repos: repos.map(r => ({ name: r.name, path: r.path, trees: r.trees.map(t => ({ name: t.name, branch: t.branch, main: t.main })), features: r.features, decisions: r.decisions })) };
}

function rawTreeDashboard(name) {
  const hit = resolveTreeByName(name);
  if (!hit) return null;
  const { tree, repo } = hit;
  const features = slugsIn(tree.path).map(s => featureOf(tree, s, repo)).filter(Boolean);
  return { repos: [{ name: tree.name, path: tree.path, trees: [], features, decisions: '' }] };
}

function metaOf(hit) {
  const { tree, repo } = hit;
  return { repo: repo.name, tree: tree.name, branch: tree.branch, worktree: tree.main ? null : path.relative(repo.path, tree.path) };
}

function gitDiff(treePath, file, cb) {
  const abs = path.resolve(treePath, file);
  if (!abs.startsWith(treePath + path.sep)) return cb('-- path not allowed --');
  execFile('git', ['-C', treePath, 'diff', 'HEAD', '--', file], { maxBuffer: 8 * 1024 * 1024 }, (e, out) => {
    if (out && out.trim()) return cb(out);
    execFile('git', ['-C', treePath, 'diff', '--no-index', '/dev/null', file], { maxBuffer: 8 * 1024 * 1024 }, (e2, out2) =>
      cb(out2 && out2.trim() ? out2 : '-- no diff found --'));
  });
}

const send = (res, code, ct, body) => { res.writeHead(code, { 'Content-Type': ct + '; charset=utf-8' }); res.end(body); };
const pipe = (res, file, ct) => { res.writeHead(200, { 'Content-Type': ct + '; charset=utf-8' }); fs.createReadStream(file).pipe(res); };
const redirect = (res, to) => { res.writeHead(301, { Location: to }); res.end(); };

const clients = new Set();
let reloadTimer = null;
function scheduleReload() {
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => { for (const c of clients) c.write(RELOAD_EVENT); }, 150);
}

function handleRegister(res, u) {
  const treeArg = u.searchParams.get('tree') || '';
  const resolved = treeRootOf(realpath(path.resolve(treeArg)));
  const main = register(resolved);
  if (!main) return send(res, 400, 'text/plain', 'not a git tree');
  refreshTrees();
  scheduleReload();
  send(res, 200, 'application/json', JSON.stringify({ dashboard: BOARD_URL, tree: treeUrlFor(resolved) }));
}

const DASHBOARD_TEMPLATE = path.join(LIB, 'dashboard-template.html');
const DOC_TEMPLATE = path.join(LIB, 'doc-template.html');

function requestHandler(req, res) {
  try {
    return route(req, res);
  } catch (e) {
    console.error(e);
    send(res, 400, 'text/plain', 'bad request');
  }
}

function route(req, res) {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const p = u.pathname;

  if (p === '/') return pipe(res, DASHBOARD_TEMPLATE, 'text/html');
  if (p === '/dashboard.json') return send(res, 200, 'application/json', JSON.stringify(scanRepos()));
  if (p === '/register') return handleRegister(res, u);
  if (p === '/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
  }

  const rawJson = p.match(/^\/t\/([^/]+)\/dashboard\.json$/);
  if (rawJson) {
    const d = rawTreeDashboard(decodeURIComponent(rawJson[1]));
    return d ? send(res, 200, 'application/json', JSON.stringify(d)) : send(res, 404, 'text/plain', 'no such tree');
  }

  const bareTree = p.match(/^\/t\/([^/]+)$/);
  if (bareTree) return redirect(res, p + '/');

  const rawTree = p.match(/^\/t\/([^/]+)\/$/);
  if (rawTree) {
    if (!resolveTreeByName(decodeURIComponent(rawTree[1]))) return send(res, 404, 'text/plain', 'no such tree');
    return pipe(res, DASHBOARD_TEMPLATE, 'text/html');
  }

  const feat = p.match(/^\/t\/([^/]+)\/f\/([^/]+)(\/.*)?$/);
  if (feat) {
    const [, tname, slug, rawRest] = feat;
    if (!rawRest) return redirect(res, p + '/');
    const hit = resolveTreeByName(decodeURIComponent(tname));
    if (!hit) return send(res, 404, 'text/plain', 'no such tree');
    const rest = rawRest.replace(/^\//, '');
    const craftRoot = path.join(hit.tree.path, DOCS_CRAFT);
    const featRoot = path.resolve(craftRoot, decodeURIComponent(slug));
    if (!featRoot.startsWith(craftRoot + path.sep)) return send(res, 404, 'text/plain', 'no such feature');
    if (rest === '') return pipe(res, DOC_TEMPLATE, 'text/html');
    if (rest === 'support.js') return send(res, 200, 'application/javascript', '');
    if (rest === 'meta.json') return send(res, 200, 'application/json', JSON.stringify(metaOf(hit)));
    if (rest === 'diff') return gitDiff(hit.tree.path, u.searchParams.get('file') || '', (out) => send(res, 200, 'text/plain', out));
    const fp = path.resolve(featRoot, decodeURIComponent(rest));
    if (fp.startsWith(featRoot + path.sep) && fs.existsSync(fp) && fs.statSync(fp).isFile())
      return pipe(res, fp, CT[path.extname(fp)] || 'application/octet-stream');
  }

  send(res, 404, 'text/plain', 'not found');
}

if (require.main === module) {
  server = http.createServer(requestHandler);
  server.on('error', (e) => {
    console.error(e.code === 'EADDRINUSE'
      ? `Craft: port ${PORT} is already in use. \`--url\` says whether it is a board, \`--stop\` ends one started here.`
      : String(e));
    process.exit(1);
  });
  const bye = () => { try { fs.unlinkSync(PID_FILE); } catch (e) { /* already gone */ } process.exit(0); };
  process.on('SIGINT', bye);
  process.on('SIGTERM', bye);
  runCli();
}
