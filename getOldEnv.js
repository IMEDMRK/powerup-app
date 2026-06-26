const https = require('https');

function download(sha) {
  https.get(`https://raw.githubusercontent.com/IMEDMRK/powerup-app/${sha}/.env`, (res) => {
    if (res.statusCode === 200) {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => console.log(`--- .env at ${sha} ---\n${data}`));
    } else {
      console.log(`No .env at ${sha} (Status: ${res.statusCode})`);
    }
  });
}

download('025ff50013f0e668e9a1277fd30e0f8463a4331a');
download('a43f131fc9250f08e0f225690cc8f81ec0d3d600');
download('ca30128b6561d41530243da23897c7918137e10b');
download('635afe86b72dfbbb6ba84837d2e131df5fd8b68e');
