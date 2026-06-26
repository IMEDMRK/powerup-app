const fs = require('fs');
const git = require('isomorphic-git');
const DIR = process.cwd();

async function check() {
  const status = await git.statusMatrix({ fs, dir: DIR });
  const modified = status.filter(row => row[1] !== row[2]);
  console.log("Modified files:", modified.map(r => r[0]));
}
check();
