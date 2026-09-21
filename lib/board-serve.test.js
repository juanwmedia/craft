const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { git } = require('./test-util.js');

const { ownerSlugs, watchTargetOf, DOCS_CRAFT } = require('./board-serve.js');


function writeSlug(repo, slug, text) {
  const dir = path.join(repo, 'docs', 'craft', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'data.json'), JSON.stringify({ note: text }));
}

function makeRepo() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'board-serve-test-'));
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.email', 'test@example.com');
  git(repo, 'config', 'user.name', 'Craft Test');
  git(repo, 'config', 'commit.gpgsign', 'false');
  writeSlug(repo, 'a', 'a-init');
  writeSlug(repo, 'b', 'b-init');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'init');
  return repo;
}

test('owner rule: a linked worktree owns only what its branch changed', () => {
  const repo = makeRepo();
  const wt = path.join(os.tmpdir(), `board-serve-test-wt-${process.pid}-${Date.now()}`);
  try {
    git(repo, 'worktree', 'add', wt, '-b', 'feature-branch');

    writeSlug(wt, 'b', 'b-on-branch');
    git(wt, 'add', '-A');
    git(wt, 'commit', '-m', 'edit b on the branch');

    writeSlug(repo, 'a', 'a-on-main-after-branch');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-m', 'edit a on main after the branch was cut');

    const owned = ownerSlugs(wt, 'main');
    assert.deepEqual([...owned].sort(), ['b']);

    git(repo, 'merge', 'feature-branch', '-m', 'merge feature-branch');

    const ownedAfterMerge = ownerSlugs(wt, 'main');
    assert.deepEqual([...ownedAfterMerge], []);
  } finally {
    try { git(repo, 'worktree', 'remove', '--force', wt); } catch (e) { /* best effort cleanup */ }
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(wt, { recursive: true, force: true });
  }
});

test('owner rule: two linked worktrees that both changed the same slug both own it', () => {
  const repo = makeRepo();
  const wt1 = path.join(os.tmpdir(), `board-serve-test-wt1-${process.pid}-${Date.now()}`);
  const wt2 = path.join(os.tmpdir(), `board-serve-test-wt2-${process.pid}-${Date.now()}`);
  try {
    git(repo, 'worktree', 'add', wt1, '-b', 'branch-one');
    git(repo, 'worktree', 'add', wt2, '-b', 'branch-two');

    writeSlug(wt1, 'b', 'b-on-branch-one');
    git(wt1, 'add', '-A');
    git(wt1, 'commit', '-m', 'edit b on branch one');

    writeSlug(wt2, 'b', 'b-on-branch-two');
    git(wt2, 'add', '-A');
    git(wt2, 'commit', '-m', 'edit b on branch two');

    assert.deepEqual([...ownerSlugs(wt1, 'main')], ['b']);
    assert.deepEqual([...ownerSlugs(wt2, 'main')], ['b']);
    assert.deepEqual([...ownerSlugs(wt1, 'main')].sort(), [...ownerSlugs(wt2, 'main')].sort());
  } finally {
    try { git(repo, 'worktree', 'remove', '--force', wt1); } catch (e) { /* best effort cleanup */ }
    try { git(repo, 'worktree', 'remove', '--force', wt2); } catch (e) { /* best effort cleanup */ }
    fs.rmSync(repo, { recursive: true, force: true });
    fs.rmSync(wt1, { recursive: true, force: true });
    fs.rmSync(wt2, { recursive: true, force: true });
  }
});

test('watch target: a tree with no docs/craft yet is watched at its nearest existing ancestor, so the first board still reloads', () => {
  const repo = makeRepo();
  const craft = path.join(repo, DOCS_CRAFT);

  fs.rmSync(craft, { recursive: true, force: true });
  fs.rmSync(path.join(repo, 'docs'), { recursive: true, force: true });
  assert.deepEqual(watchTargetOf(repo), { dir: repo, recursive: false });

  fs.mkdirSync(path.join(repo, 'docs'));
  assert.deepEqual(watchTargetOf(repo), { dir: path.join(repo, 'docs'), recursive: false });

  fs.mkdirSync(craft);
  assert.deepEqual(watchTargetOf(repo), { dir: craft, recursive: true });

  fs.rmSync(repo, { recursive: true, force: true });
});
