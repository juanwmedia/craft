const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const LIB = __dirname;
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const noHerd = (extra) => ({ ...process.env, PATH: (extra ? extra + ':' : '') + process.env.PATH.split(':').filter(p => !fs.existsSync(path.join(p, 'herd'))).join(':') });
const run = (script, cwd, payload, extraPath) => execFileSync('bash', [path.join(LIB, script)], {
  cwd, encoding: 'utf8', input: JSON.stringify({ session_id: 's', transcript_path: '/tmp/t.jsonl', cwd, ...payload }), stdio: ['pipe', 'pipe', 'pipe'], env: noHerd(extraPath),
});
const create = (cwd, name, extraPath) => run('worktree-create.sh', cwd, { hook_event_name: 'WorktreeCreate', name }, extraPath).trim();
const remove = (cwd, worktree_path) => run('worktree-remove.sh', cwd, { hook_event_name: 'WorktreeRemove', worktree_path });

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
