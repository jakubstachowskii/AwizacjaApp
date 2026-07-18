/**
 * Test integracyjny aplikacji — uruchom: npx electron scripts/test-app-e2e.js
 */
const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const { openDatabase, getDb, closeDatabase } = require('../electron/database');
const {
  dbGet, dbAll, dbRun, dbExec, runInTransaction,
  saveSkupIntakeWithMovement, getSetting, setSetting,
  checkDatabaseIntegrity, resolveMagazynGrainId
} = require('../electron/dbHelpers');
const { isAllowedTable } = require('../electron/dbConstants');

const results = [];
let failed = 0;

function ok(name) { results.push({ name, pass: true }); }
function fail(name, err) {
  results.push({ name, pass: false, err: String(err?.message || err) });
  failed++;
}

async function runTests(dbPath) {
  await openDatabase(dbPath);
  const db = getDb();
  db.run('PRAGMA foreign_keys = ON');

  const schemaPath = path.join(__dirname, '../schema.sql');
  dbExec(db, fs.readFileSync(schemaPath, 'utf8'));

  try {
    if (checkDatabaseIntegrity(db)) ok('Integrality check');
    else fail('Integrality check', 'not ok');
  } catch (e) { fail('Integrality check', e); }

  try {
    if (!isAllowedTable('users')) ok('SQL injection guard');
    else fail('SQL injection guard', 'users allowed');
  } catch (e) { fail('SQL injection guard', e); }

  try {
    const grain = dbRun(db, "INSERT INTO grains (name, unit) VALUES ('Test Pszenica E2E', 't')");
    const contractor = dbRun(db, "INSERT INTO contractors (name, type) VALUES ('Test Rolnik E2E', 'rolnik')");
    dbRun(db, 'INSERT OR IGNORE INTO skup_grains (name, unit) VALUES (?, ?)', ['Test Pszenica E2E', 't']);
    const sg = dbGet(db, 'SELECT id FROM skup_grains WHERE name = ?', ['Test Pszenica E2E']);
    const sc = dbRun(db, 'INSERT INTO skup_contractors (name, type) VALUES (?, ?)', ['Test Skup Kontrahent', 'rolnik']);

    if (grain.id && contractor.id) ok('INSERT grains + contractors');
    else fail('INSERT grains + contractors', 'no ids');

    const mapped = resolveMagazynGrainId(db, sg?.id);
    if (mapped) ok('Mapowanie skup_grains → grains');
    else fail('Mapowanie skup_grains → grains', 'null');

    const intake = saveSkupIntakeWithMovement(db, {
      intakeData: {
        intake_datetime: new Date().toISOString(),
        contractor_id: sc.id,
        grain_id: sg.id,
        document_number: 'E2E-001',
        gross_weight: 1000,
        tare_weight: 100,
        net_weight: 900,
        status: 'przyjęte'
      },
      warehouseId: null,
      isUpdate: false
    });
    if (intake?.id) ok('skupSaveIntake + ruch magazynowy');
    else fail('skupSaveIntake + ruch magazynowy', 'no id');

    const movement = dbGet(db, 'SELECT * FROM magazyn_movements WHERE reference_type = ? AND reference_id = ?', ['skup_intake', intake.id]);
    if (movement && Number(movement.quantity) === 900) ok('Ruch magazynowy po przyjęciu');
    else fail('Ruch magazynowy po przyjęciu', JSON.stringify(movement));

    setSetting(db, 'test_key', 'test_value');
    if (getSetting(db, 'test_key') === 'test_value') ok('Settings get/set');
    else fail('Settings get/set', getSetting(db, 'test_key'));

    const appt = dbRun(db, `INSERT INTO appointments (type, datetime, grain_id, quantity, plate_number, contractor_id, status)
      VALUES ('dostawa', datetime('now'), ?, 10, 'WX12345', ?, 'oczekująca')`, [grain.id, contractor.id]);
    const appts = dbAll(db, 'SELECT * FROM appointments WHERE id = ?', [appt.id]);
    if (appts.length === 1) ok('INSERT appointments');
    else fail('INSERT appointments', 'not found');

    const customer = dbRun(db, "INSERT INTO sales_customers (name, type) VALUES ('E2E Klient', 'firma')");
    const order = dbRun(db, 'INSERT INTO sales_orders (order_number, customer_id, order_date, status) VALUES (?, ?, date(\'now\'), ?)', ['E2E-ORD-1', customer.id, 'nowe']);
    if (order.id) ok('INSERT sales_orders');
    else fail('INSERT sales_orders', 'no id');

    const test = dbRun(db, "INSERT INTO jakosc_tests (sample_code, test_date, result) VALUES ('E2E-S1', datetime('now'), 'zgodny')");
    if (test.id) ok('INSERT jakosc_tests');
    else fail('INSERT jakosc_tests', 'no id');

    runInTransaction(db, () => {
      dbRun(db, 'DELETE FROM magazyn_movements WHERE reference_type = ? AND reference_id = ?', ['skup_intake', intake.id]);
      dbRun(db, 'DELETE FROM skup_intakes WHERE id = ?', [intake.id]);
    });
    ok('Transakcja DELETE');
  } catch (e) {
    fail('Flow E2E', e);
  }

  closeDatabase();
}

app.whenReady().then(async () => {
  const testPath = path.join(app.getPath('temp'), 'awizaxja-e2e-test.db');
  try {
    if (fs.existsSync(testPath)) fs.unlinkSync(testPath);
    await runTests(testPath);
    console.log('\n=== RAPORT TESTÓW E2E ===\n');
    for (const r of results) {
      console.log(`${r.pass ? '✓' : '✗'} ${r.name}${r.err ? ' — ' + r.err : ''}`);
    }
    console.log(`\nWynik: ${results.length - failed} OK, ${failed} FAIL\n`);
    app.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('E2E_FATAL', err);
    app.exit(1);
  } finally {
    try { if (fs.existsSync(testPath)) fs.unlinkSync(testPath); } catch (_) { /* ignore */ }
  }
});
