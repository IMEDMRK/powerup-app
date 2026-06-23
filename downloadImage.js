const https = require('https');
const fs = require('fs');

const url = 'https://i.ibb.co/TB8dm77v/1753504381054-removebg-preview.png';
const dest = 'public/product.png';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

https.get(url, options, (res) => {
  if (res.statusCode !== 200) {
    console.error('Failed with status:', res.statusCode);
    process.exit(1);
  }
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Downloaded successfully');
  });
}).on('error', (err) => {
  console.error(err);
});
