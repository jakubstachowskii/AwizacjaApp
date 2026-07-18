const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { openDatabase, getDb, closeDatabase } = require('../electron/database');
const { dbGet, dbAll, dbRun } = require('../electron/dbHelpers');

app.whenReady().then(async () => {
  try {
    const testPath = path.join(app.getPath('temp'), 'awizaxja-sqlite-test.db');
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);

    await openDatabase(testPath);
    const db = getDb();
    db.run('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
    dbRun(db, 'INSERT INTO test (name) VALUES (?)', ['ok']);
    const row = dbGet(db, 'SELECT * FROM test WHERE id = 1');
    const all = dbAll(db, 'SELECT * FROM test');
    closeDatabase();

    if (row?.name === 'ok' && all.length === 1) {
      console.log('SQLITE_OK');
      app.exit(0);
    } else {
      console.error('SQLITE_FAIL', row, all);
      app.exit(1);
    }
  } catch (err) {
    console.error('SQLITE_ERROR', err);
    app.exit(1);
  }
});
