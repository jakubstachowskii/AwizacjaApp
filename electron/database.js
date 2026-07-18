const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let SQL = null;
let db = null;
let dbPath = null;

async function openDatabase(filePath) {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
    });
  }
  if (db) {
    try { persist(); db.close(); } catch (_) { /* ignore */ }
  }
  if (fs.existsSync(filePath)) {
    db = new SQL.Database(fs.readFileSync(filePath));
  } else {
    db = new SQL.Database();
  }
  dbPath = filePath;
  return db;
}

function getDb() {
  return db;
}

function persist() {
  if (db && dbPath) {
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
  }
}

function closeDatabase() {
  if (db) {
    try {
      persist();
      db.close();
    } catch (_) { /* ignore */ }
    db = null;
  }
}

module.exports = {
  openDatabase,
  getDb,
  persist,
  closeDatabase
};
