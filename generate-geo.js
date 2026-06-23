const g = require('./node_modules/geoalgeria');
const fs = require('fs');
const path = require('path');

// Build wilayas list
const wilayas = g.wilayas.map(w => ({
  code: w.code,
  name_ar: w.name_ar,
  name_fr: w.name_fr
}));

// Build communes grouped by wilaya code
const communesByWilaya = {};
wilayas.forEach(w => {
  const communes = g.getCommunesByWilaya(w.code).map(c => ({
    code: c.code_commune,
    name_ar: c.name_ar,
    name_fr: c.name_fr
  }));
  communesByWilaya[w.code] = communes;
});

const outDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'wilayas.json'), JSON.stringify(wilayas, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'communes.json'), JSON.stringify(communesByWilaya, null, 2), 'utf8');

console.log('Done! wilayas:', wilayas.length);
console.log('Sample communes for wilaya 16:', communesByWilaya[16]?.slice(0, 3));
