const { execFileSync } = require('child_process');

const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const gitFails = (cwd, ...args) => {
  try { git(cwd, ...args); return false; } catch (e) { return true; }
};

module.exports = { git, gitFails };
