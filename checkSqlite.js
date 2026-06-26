const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prisma/dev.db', (err) => {
  if (err) {
    console.error(err.message);
    return;
  }
  db.get('SELECT COUNT(*) as count FROM User', (err, row) => {
    if (err) console.error(err.message);
    else console.log('SQLite Users:', row.count);
  });
  db.get('SELECT COUNT(*) as count FROM "Order"', (err, row) => {
    if (err) console.error(err.message);
    else console.log('SQLite Orders:', row.count);
  });
});
