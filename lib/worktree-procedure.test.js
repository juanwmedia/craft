const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { git, gitFails } = require('./test-util.js');
const SLUG = 'x';
const BRANCH = 'worktree-' + SLUG;
const BOARD_DIR = path.join('docs', 'craft', SLUG);

function emptyRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'craft-proc-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@craft');
  git(dir, 'config', 'user.name', 'craft');
  return fs.realpathSync(dir);
}

function repo() {
  const dir = emptyRepo();
  fs.writeFileSync(path.join(dir, 'README.md'), 'x');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-qm', 'init');
  return dir;
}

const treeOf = (dir) => path.join(dir, '.claude', 'worktrees', SLUG);
const openTree = (dir) => { git(dir, 'worktree', 'add', '-q', treeOf(dir), '-b', BRANCH, 'HEAD'); return treeOf(dir); };

function writeBoard(tree) {
  fs.mkdirSync(path.join(tree, BOARD_DIR), { recursive: true });
  fs.writeFileSync(path.join(tree, BOARD_DIR, 'data.json'), '{"feature":"X"}');
}

// The Busy rule lives in references/worktree.md and this is a copy of it, so the last test in this file
// greps the reference and fails when the two stop agreeing.
const WORKTREE_MD = fs.readFileSync(path.join(__dirname, '..', 'references', 'worktree.md'), 'utf8');
const DROPPED = ['docs/craft/', '.claude/worktrees/'];
const busyLines = (tree) => git(tree, 'status', '--porcelain', '-uall')
  .split('\n').filter(Boolean)
  .filter(l => !DROPPED.some(prefix => l.slice(3).startsWith(prefix)));

test('Open step 0: a repo with no commit has no HEAD to branch from', () => {
  const dir = emptyRepo();
  assert.ok(gitFails(dir, 'rev-parse', '--verify', 'HEAD'));
  assert.ok(!gitFails(repo(), 'rev-parse', '--verify', 'HEAD'));
});

test('Open step 2: a detached HEAD has no current branch, so there is nothing to come back to', () => {
  const dir = repo();
  assert.strictEqual(git(dir, 'branch', '--show-current'), 'main');
  git(dir, 'checkout', '-q', '--detach', 'HEAD');
  assert.strictEqual(git(dir, 'branch', '--show-current'), '');
});

test('Open step 1: a tree removed by hand leaves the branch, and git refuses to add it back until the stale record is pruned', () => {
  const dir = repo();
  const tree = openTree(dir);
  fs.rmSync(tree, { recursive: true, force: true });
  assert.ok(git(dir, 'branch', '--list', BRANCH).includes(BRANCH), 'the branch survives');
  assert.ok(git(dir, 'worktree', 'list', '--porcelain').includes('branch refs/heads/' + BRANCH), 'git still has the deleted tree registered');
  assert.ok(gitFails(dir, 'worktree', 'add', tree, BRANCH), 'this is why the prune is in the procedure');
  git(dir, 'worktree', 'prune');
  assert.ok(!git(dir, 'worktree', 'list', '--porcelain').includes('branch refs/heads/' + BRANCH));
  git(dir, 'worktree', 'add', '-q', tree, BRANCH);
  assert.ok(git(dir, 'worktree', 'list', '--porcelain').includes('branch refs/heads/' + BRANCH));
});

test('Busy: without -uall git collapses the board to an untracked directory that neither prefix matches', () => {
  const dir = repo();
  const tree = openTree(dir);
  writeBoard(tree);
  const collapsed = git(tree, 'status', '--porcelain').split('\n').filter(Boolean);
  assert.deepStrictEqual(collapsed, ['?? docs/']);
  assert.ok(!/^..\s+docs\/craft\//.test(collapsed[0]), 'the collapsed line is what used to read a board-only tree as busy');
  assert.deepStrictEqual(git(tree, 'status', '--porcelain', '-uall').split('\n').filter(Boolean), ['?? ' + BOARD_DIR + '/data.json']);
});

test('Busy: a tree holding only its board is free, and one file outside it makes the tree busy', () => {
  const dir = repo();
  const tree = openTree(dir);
  writeBoard(tree);
  assert.deepStrictEqual(busyLines(tree), []);
  fs.writeFileSync(path.join(tree, 'src.js'), 'work in progress');
  assert.deepStrictEqual(busyLines(tree), ['?? src.js']);
});

test('Close: the tree that holds a branch is found by its ref line, and the main tree is listed first', () => {
  const dir = repo();
  const tree = openTree(dir);
  const porcelain = git(dir, 'worktree', 'list', '--porcelain');
  assert.strictEqual(porcelain.split('\n')[0], 'worktree ' + dir);
  const entries = porcelain.split('\n\n').map(b => b.split('\n'));
  const home = entries.find(e => e.includes('branch refs/heads/main'));
  const feature = entries.find(e => e.includes('branch refs/heads/' + BRANCH));
  assert.strictEqual(home[0], 'worktree ' + dir);
  assert.strictEqual(feature[0], 'worktree ' + tree);
});

test('Close: git prints worktree paths with every symlink resolved, so a path you built yourself never matches', () => {
  const dir = repo();
  openTree(dir);
  const link = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'craft-link-')), 'repo');
  fs.symlinkSync(dir, link);
  const viaLink = path.join(link, '.claude', 'worktrees', SLUG);
  assert.ok(fs.existsSync(path.join(viaLink, '.git')), 'the tree is reachable through the symlink');
  assert.ok(!git(link, 'worktree', 'list', '--porcelain').includes('worktree ' + viaLink));
  assert.ok(git(link, 'worktree', 'list', '--porcelain').includes('worktree ' + treeOf(dir)));
});

test('Close refusal 1: no -uall drops here, so a tree holding only its board still stops the close', () => {
  const dir = repo();
  const tree = openTree(dir);
  writeBoard(tree);
  assert.deepStrictEqual(busyLines(tree), [], 'Busy lets this tree be written to');
  assert.notStrictEqual(git(tree, 'status', '--porcelain'), '', 'Close still refuses it');
});

test('Close: the branch is deleted after the merge, because -d refuses one whose work is not in', () => {
  const dir = repo();
  const tree = openTree(dir);
  fs.writeFileSync(path.join(tree, 'feature.js'), 'shipped');
  git(tree, 'add', '-A');
  git(tree, 'commit', '-qm', 'the feature');
  git(dir, 'worktree', 'remove', tree);
  assert.ok(gitFails(dir, 'branch', '-d', BRANCH), 'unmerged, and no longer checked out anywhere');
  git(dir, 'merge', '-q', BRANCH);
  assert.ok(!gitFails(dir, 'branch', '-d', BRANCH));
  assert.ok(!git(dir, 'branch', '--list', BRANCH).includes(BRANCH));
});

test('Busy: the prefixes this file drops are the ones the reference names, and -uall is why', () => {
  const busy = WORKTREE_MD.slice(WORKTREE_MD.indexOf('## Busy'), WORKTREE_MD.indexOf('## Close'));
  for (const prefix of DROPPED) assert.ok(busy.includes(prefix), prefix + ' is no longer dropped by the reference');
  assert.ok(busy.includes('-uall'));
});

test('Open step 4: the create hook prints the path and nothing else to stdout, its report goes to stderr', () => {
  const dir = repo();
  const script = path.join(__dirname, 'worktree-create.sh');
  const out = execFileSync('bash', [script], {
    cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    input: JSON.stringify({ hook_event_name: 'WorktreeCreate', name: SLUG, cwd: dir }),
  });
  assert.strictEqual(out.trim(), treeOf(dir));
  assert.strictEqual(out.trim().split('\n').length, 1);
});
