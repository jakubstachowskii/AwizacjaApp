const path = require('path');
const fs = require('fs');
const { openDatabase, getDb, closeDatabase } = require('../electron/database');
const { dbGet, dbRun } = require('../electron/dbHelpers');

(async () => {
  const testPath = path.join(__dirname, 'tmp-sqljs-test.db');
  try {
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
    await openDatabase(testPath);
    const db = getDb();
    db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    dbRun(db, 'INSERT INTO test (name) VALUES (?)', ['ok']);
    const row = dbGet(db, 'SELECT * FROM test WHERE id = 1');
    closeDatabase();
    if (row?.name === 'ok') {
      console.log('SQLJS_OK');
      process.exit(0);
    }
    console.error('SQLJS_FAIL', row);
    process.exit(1);
  } catch (err) {
    console.error('SQLJS_ERROR', err);
    process.exit(1);
  } finally {
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
  }
})();
