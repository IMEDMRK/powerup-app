const g = require('./node_modules/geoalgeria');
console.log('wilayas count:', g.wilayas.length);
console.log('first wilaya:', JSON.stringify(g.wilayas[0]));
console.log('communes for wilaya 1:', g.getCommunesByWilaya(1).slice(0, 3));
