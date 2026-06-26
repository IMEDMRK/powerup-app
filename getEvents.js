const https = require('https');

https.get('https://api.github.com/repos/IMEDMRK/powerup-app/events', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const events = JSON.parse(data);
    const pushEvents = events.filter(e => e.type === 'PushEvent');
    console.log(JSON.stringify(pushEvents.slice(0, 3).map(e => ({ id: e.id, payload: e.payload })), null, 2));
  });
});
