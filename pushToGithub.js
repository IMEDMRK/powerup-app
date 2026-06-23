const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error("Please provide the token as an argument");
  process.exit(1);
}
const USERNAME = 'IMEDMRK';
const REPO_NAME = 'powerup-app';
const DIR = process.cwd();

async function uploadToGithub() {
  try {
    console.log('1. Creating GitHub repository...');
    const createRepoRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: REPO_NAME,
        private: true,
        description: 'PowerUp Landing Page and Dashboard',
      })
    });
    
    if (!createRepoRes.ok && createRepoRes.status !== 422) { // 422 usually means it already exists
      const errorText = await createRepoRes.text();
      console.error('Failed to create repo:', errorText);
      return;
    }
    console.log('Repository created or already exists.');

    console.log('2. Initializing git repository...');
    await git.init({ fs, dir: DIR });

    console.log('3. Adding files to git...');
    // Only add necessary files to avoid memory/timeout issues
    const allFiles = await git.statusMatrix({ fs, dir: DIR });
    
    // Ignore node_modules, .next, .env.local
    const toAdd = allFiles
      .filter(row => !row[0].startsWith('node_modules') && !row[0].startsWith('.next') && row[0] !== '.env.local' && row[0] !== 'dev.db')
      .map(row => row[0]);

    for (const filepath of toAdd) {
      await git.add({ fs, dir: DIR, filepath });
    }

    console.log('4. Committing files...');
    await git.commit({
      fs,
      dir: DIR,
      author: {
        name: USERNAME,
        email: `${USERNAME}@users.noreply.github.com`,
      },
      message: 'Initial commit: Production ready powerup-app'
    });

    console.log('5. Pushing to GitHub...');
    
    await git.addRemote({
      fs,
      dir: DIR,
      remote: 'origin',
      url: `https://${TOKEN}@github.com/${USERNAME}/${REPO_NAME}.git`,
      force: true
    });

    await git.push({
      fs,
      http,
      dir: DIR,
      remote: 'origin',
      ref: 'master',
      remoteRef: 'main',
      force: true
    });

    console.log('✅ Successfully pushed to GitHub!');
  } catch (error) {
    console.error('Error:', error);
  }
}

uploadToGithub();
