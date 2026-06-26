const { execSync } = require('child_process');
try {
  console.log("Fetching deploys...");
  const out = execSync('npx netlify-cli api listSiteDeploys --data "{\\"site_id\\\": \\"134adaee-e99c-40ba-81c1-a29ae4a8eecb\\"}"');
  const deploys = JSON.parse(out.toString());
  const lastFailed = deploys.find(d => d.state === 'error');
  if (!lastFailed) {
    console.log("No failed deploys found.");
    process.exit(0);
  }
  console.log('Failed deploy ID:', lastFailed.id);
  const log = execSync(`npx netlify-cli api getDeployLog --data "{\\"deploy_id\\\": \\"${lastFailed.id}\\"}"`);
  console.log(JSON.parse(log.toString()).map(l => l.msg).join('\n'));
} catch(e) {
  console.error(e.message);
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
