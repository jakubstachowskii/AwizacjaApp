const { isAllowedTable } = require('./dbConstants');
const { persist } = require('./database');

let inTransaction = false;

function dbGet(db, sql, params = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    if (stmt.step()) return stmt.getAsObject();
    return null;
  } finally {
    stmt.free();
  }
}

function dbAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  try {
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

function dbRun(db, sql, params = []) {
  db.run(sql, params);
  const last = dbGet(db, 'SELECT last_insert_rowid() AS id');
  const result = { id: Number(last?.id || 0), changes: db.getRowsModified() };
  if (!inTransaction) persist();
  return result;
}

function dbExec(db, sql) {
  db.exec(sql);
  if (!inTransaction) persist();
}

function runInTransaction(db, fn) {
  inTransaction = true;
  db.run('BEGIN');
  try {
    const result = fn();
    db.run('COMMIT');
    inTransaction = false;
    persist();
    return result;
  } catch (err) {
    try { db.run('ROLLBACK'); } catch (_) { /* ignore */ }
    inTransaction = false;
    throw err;
  }
}

function runMigrations(db) {
  const migrations = [
    'ALTER TABLE skup_contractors ADD COLUMN contact_person VARCHAR(100)',
    'ALTER TABLE skup_contractors ADD COLUMN notes TEXT'
  ];
  for (const sql of migrations) {
    try {
      dbRun(db, sql);
    } catch (_) {
      // kolumna już istnieje
    }
  }
}

function resolveMagazynGrainId(db, skupGrainId) {
  if (!skupGrainId) return null;
  const skupGrain = dbGet(db, 'SELECT * FROM skup_grains WHERE id = ?', [skupGrainId]);
  if (!skupGrain) return null;

  let grain = dbGet(db, 'SELECT id FROM grains WHERE name = ? COLLATE NOCASE', [skupGrain.name]);
  if (!grain) {
    const inserted = dbRun(db, 'INSERT INTO grains (name, unit) VALUES (?, ?)', [
      skupGrain.name,
      skupGrain.unit || 't'
    ]);
    return inserted.id;
  }
  return grain.id;
}

function resolveMainContractorId(db, skupContractorId) {
  if (!skupContractorId) return null;
  const skup = dbGet(db, 'SELECT * FROM skup_contractors WHERE id = ?', [skupContractorId]);
  if (!skup) return null;

  let contractor = dbGet(db, 'SELECT id FROM contractors WHERE name = ? COLLATE NOCASE', [skup.name]);
  if (!contractor) {
    const inserted = dbRun(
      db,
      'INSERT INTO contractors (name, nip, address, phone, email, type) VALUES (?, ?, ?, ?, ?, ?)',
      [skup.name, skup.nip || null, skup.address || null, skup.phone || null, skup.email || null, skup.type || 'rolnik']
    );
    return inserted.id;
  }
  return contractor.id;
}

const SKUP_INTAKE_COLUMNS = new Set([
  'intake_datetime', 'contractor_id', 'grain_id', 'document_number',
  'gross_weight', 'tare_weight', 'net_weight', 'price_per_unit', 'currency', 'amount',
  'moisture_content', 'impurities_content', 'protein_content', 'hectoliter_weight',
  'quality_notes', 'status', 'notes'
]);

function pickIntakeColumns(data) {
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (SKUP_INTAKE_COLUMNS.has(k) && v !== '' && v !== null && v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

function saveSkupIntakeWithMovement(db, { intakeData, warehouseId, isUpdate, intakeId }) {
  const payload = pickIntakeColumns(intakeData);
  payload.grain_id = resolveMagazynGrainId(db, payload.grain_id);
  payload.contractor_id = resolveMainContractorId(db, payload.contractor_id);

  if (!payload.grain_id || !payload.contractor_id) {
    throw new Error('Nie udało się zmapować zboża lub kontrahenta');
  }

  return runInTransaction(db, () => {
    let resultId = intakeId;
    if (isUpdate && intakeId) {
      const cols = Object.keys(payload).map((k) => `${k} = ?`).join(', ');
      dbRun(db, `UPDATE skup_intakes SET ${cols}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        ...Object.values(payload),
        intakeId
      ]);
    } else {
      const cols = Object.keys(payload).join(', ');
      const placeholders = Object.keys(payload).map(() => '?').join(', ');
      const inserted = dbRun(
        db,
        `INSERT INTO skup_intakes (${cols}) VALUES (${placeholders})`,
        Object.values(payload)
      );
      resultId = inserted.id;
    }

    const netTons = parseFloat(payload.net_weight || 0);
    if (!isUpdate && resultId && payload.grain_id && netTons > 0) {
      let warehouses = dbAll(db, 'SELECT * FROM magazyn_warehouses ORDER BY id');
      if (!warehouses.length) {
        const created = dbRun(db, 'INSERT INTO magazyn_warehouses (name, code, type, capacity, unit, is_active) VALUES (?, ?, ?, ?, ?, ?)', [
          'Magazyn domyślny', 'MAG-1', 'magazyn', 0, 't', 1
        ]);
        warehouses = [{ id: created.id, name: 'Magazyn domyślny' }];
      }
      const chosenId = warehouseId ? Number(warehouseId) : warehouses[0].id;
      const targetWh = warehouses.find((w) => w.id === chosenId) || warehouses[0];

      dbRun(
        db,
        `INSERT INTO magazyn_movements (warehouse_id, grain_id, movement_type, quantity, unit, reference_type, reference_id, document_number, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          targetWh.id,
          payload.grain_id,
          'przyjecie',
          netTons,
          't',
          'skup_intake',
          resultId,
          payload.document_number || null,
          'Automatyczny ruch z przyjęcia skupu'
        ]
      );

      const existing = dbGet(db, 'SELECT * FROM magazyn_stock_levels WHERE warehouse_id = ? AND grain_id = ?', [
        targetWh.id,
        payload.grain_id
      ]);
      if (existing) {
        dbRun(db, 'UPDATE magazyn_stock_levels SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?', [
          Number(existing.quantity || 0) + netTons,
          existing.id
        ]);
      } else {
        dbRun(db, 'INSERT INTO magazyn_stock_levels (warehouse_id, grain_id, quantity, unit) VALUES (?, ?, ?, ?)', [
          targetWh.id,
          payload.grain_id,
          netTons,
          't'
        ]);
      }
    }

    return { id: resultId };
  });
}

function getSetting(db, key) {
  const row = dbGet(db, 'SELECT value FROM settings WHERE key = ?', [key]);
  return row ? row.value : null;
}

function setSetting(db, key, value) {
  dbRun(
    db,
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`,
    [key, value]
  );
}

function checkDatabaseIntegrity(db) {
  const row = dbGet(db, "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1");
  if (!row) return true;
  try {
    const results = db.exec('PRAGMA integrity_check');
    return results[0]?.values?.[0]?.[0] === 'ok';
  } catch (_) {
    return false;
  }
}

function optimizeDatabase(db) {
  if (process.env.NODE_ENV === 'development') {
    dbExec(db, 'VACUUM');
  }
}

module.exports = {
  dbGet,
  dbAll,
  dbRun,
  dbExec,
  runInTransaction,
  runMigrations,
  resolveMagazynGrainId,
  resolveMainContractorId,
  saveSkupIntakeWithMovement,
  getSetting,
  setSetting,
  checkDatabaseIntegrity,
  optimizeDatabase,
  isAllowedTable
};
