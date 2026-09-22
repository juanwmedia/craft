const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const LIB = __dirname;
const { git } = require('./test-util.js');
const TOOLS = fs.readFileSync(path.join(LIB, '..', 'references', 'tools.md'), 'utf8');
const env = (extra, home) => ({ ...process.env, PATH: (extra ? extra + ':' : '') + process.env.PATH, ...(home ? { HOME: home } : {}) });
const run = (script, cwd, payload, extraPath, home) => execFileSync('bash', [script.includes('/') ? script : path.join(LIB, script)], {
  cwd, encoding: 'utf8', input: JSON.stringify({ session_id: 's', transcript_path: '/tmp/t.jsonl', cwd, ...payload }), stdio: ['pipe', 'pipe', 'pipe'], env: env(extraPath, home),
});
const create = (cwd, name, extraPath, script, home) => run(script || 'worktree-create.sh', cwd, { hook_event_name: 'WorktreeCreate', name }, extraPath, home).trim();
const remove = (cwd, worktree_path, extraPath, script, home) => run(script || 'worktree-remove.sh', cwd, { hook_event_name: 'WorktreeRemove', worktree_path }, extraPath, home);
const snippet = (tag) => TOOLS.match(new RegExp('```bash ' + tag + '\\n([\\s\\S]*?)```'))[1];
function withTool(script, tag, before) {
  const src = fs.readFileSync(path.join(LIB, script), 'utf8');
  assert.ok(src.includes(before));
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'craft-tool-')), script);
  fs.writeFileSync(file, src.replace(before, snippet(tag) + before));
  return file;
}
function herdSites(home) {
  const sites = path.join(home, 'Library', 'Application Support', 'Herd', 'config', 'valet', 'Sites');
  fs.mkdirSync(sites, { recursive: true });
  return sites;
}
function herdStub(served = []) {
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-bin-'));
  const marker = path.join(bin, 'calls.txt');
  const table = served.map((p) => `| mainsite |  X  | https://mainsite.test | ${p} | 8.4 |`).join('\n');
  fs.writeFileSync(path.join(bin, 'herd'), `#!/bin/bash\necho "$@" >> ${marker}\nif [ "$1" = links ] || [ "$1" = parked ]; then echo "${table}"; fi\n`, { mode: 0o755 });
  return { bin, marker };
}
const herdActs = (marker) => (fs.existsSync(marker) ? fs.readFileSync(marker, 'utf8') : '').split('\n').filter((l) => l.startsWith('link ') || l.startsWith('unlink '));

function repo(bare) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-hook-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@craft');
  git(dir, 'config', 'user.name', 'craft');
  fs.writeFileSync(path.join(dir, 'README.md'), 'x');
  fs.writeFileSync(path.join(dir, '.gitignore'), '.env\ndatabase/*.sqlite\n');
  if (!bare) {
    fs.mkdirSync(path.join(dir, 'database'));
    fs.writeFileSync(path.join(dir, 'database', 'database.sqlite'), 'db');
    fs.writeFileSync(path.join(dir, '.env'), ENV);
  }
  git(dir, 'add', '-A');
  git(dir, 'commit', '-qm', 'init');
  git(dir, 'checkout', '-qb', 'work');
  fs.writeFileSync(path.join(dir, 'README.md'), 'y');
  git(dir, 'commit', '-qam', 'on work');
  return fs.realpathSync(dir);
}
const treeOf = (dir, name) => path.join(dir, '.claude', 'worktrees', name);
const ENV = 'APP_ENV=local';
const BRANCH_X = 'worktree-x';

test('create hook: the tree lands at .claude/worktrees/<name> on worktree-<name>, from HEAD, env and sqlite copied, stdout is the absolute path', () => {
  const dir = repo();
  const out = create(dir, 'x');
  const wt = treeOf(dir, 'x');
  assert.strictEqual(out, wt);
  assert.strictEqual(git(wt, 'branch', '--show-current'), BRANCH_X);
  assert.strictEqual(git(wt, 'rev-parse', 'HEAD'), git(dir, 'rev-parse', 'work'));
  assert.strictEqual(fs.readFileSync(path.join(wt, '.env'), 'utf8'), ENV);
  assert.strictEqual(fs.readFileSync(path.join(wt, 'database', 'database.sqlite'), 'utf8'), 'db');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('remove hook: given worktree_path, the tree is gone and git no longer lists it', () => {
  const dir = repo();
  const wt = create(dir, 'x');
  remove(dir, wt);
  assert.ok(!fs.existsSync(wt));
  assert.ok(!git(dir, 'worktree', 'list', '--porcelain').includes(wt));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('create hook on a static project: the bare tree, from HEAD, nothing copied', () => {
  const dir = repo(true);
  const wt = create(dir, 'x');
  assert.strictEqual(wt, treeOf(dir, 'x'));
  assert.strictEqual(git(wt, 'rev-parse', 'HEAD'), git(dir, 'rev-parse', 'work'));
  assert.ok(!fs.existsSync(path.join(wt, '.env')));
  assert.ok(!fs.existsSync(path.join(wt, 'database')));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('create hook: a failing install leaves no tree, no branch, empty stdout', () => {
  const dir = repo(true);
  fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-qm', 'lockfile');
  const bin = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-bin-'));
  fs.writeFileSync(path.join(bin, 'npm'), '#!/bin/bash\nexit 1\n', { mode: 0o755 });
  assert.throws(() => create(dir, 'x', bin), (e) => { assert.strictEqual(e.stdout, ''); assert.match(e.stderr, /preparation failed/); return true; });
  assert.ok(!fs.existsSync(treeOf(dir, 'x')));
  assert.ok(!git(dir, 'branch', '--list', BRANCH_X));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(bin, { recursive: true, force: true });
});

test('create hook: an existing tree with work in it survives a second create', () => {
  const dir = repo(true);
  const wt = create(dir, 'x');
  fs.writeFileSync(path.join(wt, 'WIP.txt'), 'unsaved');
  assert.throws(() => create(dir, 'x'));
  assert.strictEqual(fs.readFileSync(path.join(wt, 'WIP.txt'), 'utf8'), 'unsaved');
  assert.strictEqual(git(wt, 'branch', '--show-current'), BRANCH_X);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('create hook run from inside another worktree lands under the main tree and copies the main tree env', () => {
  const dir = repo();
  const a = create(dir, 'a');
  fs.writeFileSync(path.join(a, '.env'), 'A_ENV=1');
  const b = create(a, 'b');
  assert.strictEqual(b, treeOf(dir, 'b'));
  assert.strictEqual(fs.readFileSync(path.join(b, '.env'), 'utf8'), ENV);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('herd, remove: a link that points somewhere else is left alone, whatever its name', () => {
  const dir = repo(true);
  const wt = create(dir, 'x');
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-home-'));
  const someoneElse = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-site-'));
  fs.symlinkSync(someoneElse, path.join(herdSites(home), 'mainsite-x'));
  const { bin, marker } = herdStub();

  remove(dir, wt, bin, withTool('worktree-remove.sh', 'herd-remove', 'git worktree remove'), home);

  assert.ok(!fs.existsSync(marker), 'herd unlink must not run for a link pointing elsewhere');
  assert.ok(fs.existsSync(path.join(home, 'Library', 'Application Support', 'Herd', 'config', 'valet', 'Sites', 'mainsite-x')), 'the foreign link must survive');
  assert.ok(!fs.existsSync(wt), 'the tree is still removed');
  for (const d of [dir, home, someoneElse, bin]) fs.rmSync(d, { recursive: true, force: true });
});

test('herd, create: a repo Herd does not serve gets no link', () => {
  const dir = repo(true);
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-home-'));
  const { bin, marker } = herdStub();
  create(dir, 'x', bin, withTool('worktree-create.sh', 'herd-create', 'echo "$path"'), home);
  assert.deepStrictEqual(herdActs(marker), [], 'herd link must not run for a repo Herd does not serve');
  for (const d of [dir, home, bin]) fs.rmSync(d, { recursive: true, force: true });
});

test('herd, create then remove: the served tree is linked by name, and unlinked when worktree_path arrives through a symlink to a link stored resolved', () => {
  const dir = repo(true);
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-home-'));
  const { bin, marker } = herdStub([dir]);
  const wt = create(dir, 'x', bin, withTool('worktree-create.sh', 'herd-create', 'echo "$path"'), home);
  assert.deepStrictEqual(herdActs(marker), ['link mainsite-x']);
  fs.symlinkSync(fs.realpathSync(wt), path.join(herdSites(home), 'mainsite-x'));

  const alias = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'craft-alias-')), 'repo');
  fs.symlinkSync(dir, alias);
  const aliased = path.join(alias, '.claude', 'worktrees', 'x');
  assert.notStrictEqual(aliased, wt);

  remove(dir, aliased, bin, withTool('worktree-remove.sh', 'herd-remove', 'git worktree remove'), home);

  assert.deepStrictEqual(herdActs(marker), ['link mainsite-x', 'unlink mainsite-x']);
  assert.ok(!fs.existsSync(wt), 'the tree is removed');
  for (const d of [dir, home, path.dirname(alias), bin]) fs.rmSync(d, { recursive: true, force: true });
});
