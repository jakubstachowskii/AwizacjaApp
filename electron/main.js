const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { openDatabase, getDb, closeDatabase } = require('./database');
const net = require('net');
const { isAllowedTable } = require('./dbConstants');
const {
    testTcpConnection,
    parseNumericFrame,
    parseLabFrame,
    TcpDeviceSession,
    readTcpOnce
} = require('./peripherals/deviceConnector');
const {
    runMigrations,
    saveSkupIntakeWithMovement,
    getSetting,
    setSetting,
    dbGet,
    dbAll,
    dbRun,
    dbExec,
    runInTransaction,
    checkDatabaseIntegrity,
    optimizeDatabase,
    resolveMagazynGrainId
} = require('./dbHelpers');

// Stabilniejszy start na Windows (bez wyłączania software rasterizer)
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-http-cache');

let mainWindow;
let db;
let selectedDate = null;
let splashBaseSize = null; // [width, height]
let isDatabaseClosed = false; // Flaga do śledzenia czy baza została już zamknięta
let selectedSkupView = null; // docelowy widok startowy dla Skup

// Ścieżka do bazy danych
const dbPath = path.join(app.getPath('userData'), 'grain_logistics.db');

function closeDatabaseConnection() {
    if (db && !isDatabaseClosed) {
        try {
            closeDatabase();
            console.log('✓ Baza danych zamknięta pomyślnie');
        } catch (err) {
            console.error('❌ Błąd zamykania bazy danych:', err);
        }
        db = null;
        isDatabaseClosed = true;
    }
}

function initSampleData() {
    const row = dbGet(db, 'SELECT COUNT(*) as count FROM grains');
    if (row.count > 0) {
        console.log('Baza danych zawiera już dane, pomijam dodawanie przykładowych danych');
        return;
    }
    console.log('Dodawanie przykładowych danych...');
    const grains = [
        { name: 'Pszenica', unit: 't' },
        { name: 'Żyto', unit: 't' },
        { name: 'Jęczmień', unit: 't' },
        { name: 'Owies', unit: 't' },
        { name: 'Kukurydza', unit: 't' }
    ];
    const contractors = [
        { name: 'Jan Kowalski', nip: '1234567890', address: 'ul. Rolnicza 1, 00-001 Warszawa', phone: '123-456-789', email: 'jan.kowalski@email.pl', type: 'rolnik' },
        { name: 'Firma Transportowa ABC', nip: '0987654321', address: 'ul. Transportowa 10, 00-002 Warszawa', phone: '987-654-321', email: 'abc@transport.pl', type: 'transport' },
        { name: 'Skup Zboża XYZ', nip: '1122334455', address: 'ul. Skupowa 5, 00-003 Warszawa', phone: '111-222-333', email: 'skup@xyz.pl', type: 'firma' }
    ];
    for (const grain of grains) {
        dbRun(db, 'INSERT INTO grains (name, unit) VALUES (?, ?)', [grain.name, grain.unit]);
    }
    for (const contractor of contractors) {
        dbRun(db, 'INSERT INTO contractors (name, nip, address, phone, email, type) VALUES (?, ?, ?, ?, ?, ?)', [
            contractor.name, contractor.nip, contractor.address, contractor.phone, contractor.email, contractor.type
        ]);
    }
    const mainGrains = dbAll(db, 'SELECT * FROM grains');
    for (const g of mainGrains) {
        dbRun(db, 'INSERT OR IGNORE INTO skup_grains (name, unit) VALUES (?, ?)', [g.name, g.unit]);
        dbRun(db, 'INSERT OR IGNORE INTO sales_products (name, unit, category) VALUES (?, ?, ?)', [g.name, g.unit, 'zboze']);
    }
    console.log('Przykładowe dane dodane pomyślnie');
}

async function initDatabase() {
    try {
        if (db && !isDatabaseClosed) {
            closeDatabase();
        }
        const isNewDb = !fs.existsSync(dbPath);
        await openDatabase(dbPath);
        db = getDb();
        isDatabaseClosed = false;
        db.run('PRAGMA foreign_keys = ON');
        console.log('Połączono z bazą danych SQLite (sql.js)');

        if (isNewDb) {
            const schemaPath = path.join(__dirname, '../schema.sql');
            if (!fs.existsSync(schemaPath)) {
                throw new Error('Schema file not found');
            }
            dbExec(db, fs.readFileSync(schemaPath, 'utf8'));
            console.log('Schema załadowany (nowa baza)');
            initSampleData();
        }

        runMigrations(db);
        console.log('✓ Inicjalizacja bazy danych zakończona');
    } catch (err) {
        console.error('Błąd inicjalizacji bazy danych:', err);
        throw err;
    }
}

function createWindow() {
    const indexHtml = path.join(__dirname, '../build/index.html');
    if (process.env.NODE_ENV !== 'development' && !fs.existsSync(indexHtml)) {
        console.error('Brak pliku UI:', indexHtml);
        dialog.showErrorBox(
            'Grain Logistics',
            'Brak zbudowanego interfejsu (folder build/).\nUruchom: npm run build\na potem: npm start'
        );
        app.quit();
        return;
    }

    mainWindow = new BrowserWindow({
        width: 1280,
        height: 860,
        x: 80,
        y: 60,
        backgroundColor: '#eef1f6',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            spellcheck: false
        },
        show: false,
        title: 'Grain Logistics',
        autoHideMenuBar: true,
        resizable: true,
        minimizable: true,
        maximizable: true
    });

    splashBaseSize = mainWindow.getSize();

    mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
        console.error('did-fail-load', code, desc, url);
        dialog.showErrorBox('Błąd ładowania UI', `${desc}\n${url || indexHtml}`);
    });

    mainWindow.webContents.on('render-process-gone', (_e, details) => {
        console.error('render-process-gone', details);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.maximize();
        if (process.platform === 'win32') {
            mainWindow.setAlwaysOnTop(true);
            mainWindow.setAlwaysOnTop(false);
        }
    });

    // Awaryjnie pokaż okno po 2 s, nawet jeśli ready-to-show nie przyjdzie
    setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
            console.warn('Awaryjne pokazanie okna');
            mainWindow.show();
            mainWindow.focus();
        }
    }, 2000);

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
    } else {
        mainWindow.loadFile(indexHtml).catch((err) => {
            console.error('loadFile error', err);
            dialog.showErrorBox('Błąd startu', String(err));
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Obsługa błędów aplikacji
process.on('uncaughtException', (error) => {
    console.error('Nieobsłużony błąd:', error);
    // Nie zamykaj aplikacji automatycznie
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Nieobsłużona promesa:', reason);
    // Nie zamykaj aplikacji automatycznie
});

// Obsługa błędów Electron
app.on('render-process-gone', (event, webContents, details) => {
    console.error('Render process crashed:', details);
});

app.on('child-process-gone', (event, details) => {
    console.error('Child process crashed:', details);
});

app.whenReady().then(async () => {
    createWindow();

    try {
        const initPromise = initDatabase();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout inicjalizacji bazy danych')), 15000);
        });
        await Promise.race([initPromise, timeoutPromise]);
    } catch (error) {
        console.error('Błąd inicjalizacji bazy danych:', error);
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('before-quit', (event) => {
    if (db && !isDatabaseClosed) {
        event.preventDefault();
        closeDatabaseConnection();
        console.log('👋 Aplikacja zamknięta');
        app.exit(0);
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (db && !isDatabaseClosed) {
            closeDatabaseConnection();
        }
        console.log('👋 Aplikacja zamknięta');
        app.quit();
    }
});

// IPC Handlers dla operacji na bazie danych

ipcMain.handle('db-get-all', async (event, table, orderBy = 'id') => {
    if (!db) throw new Error('Database not initialized');
    if (!isAllowedTable(table)) throw new Error(`Table '${table}' is not allowed`);
    if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(orderBy)) throw new Error('Invalid orderBy parameter');
    return dbAll(db, `SELECT * FROM ${table} ORDER BY ${orderBy}`);
});

ipcMain.handle('db-get-appointments', async (event, filters = {}) => {
    if (!db) throw new Error('Database not initialized');
    let query = `
        SELECT a.*, g.name as grain_name, g.unit as grain_unit, c.name as contractor_name,
               w.brutto, w.tara, w.netto
        FROM appointments a
        LEFT JOIN grains g ON a.grain_id = g.id
        LEFT JOIN contractors c ON a.contractor_id = c.id
        LEFT JOIN weights w ON a.id = w.appointment_id`;
    const conditions = [];
    const params = [];
    if (filters.status) { conditions.push('a.status = ?'); params.push(filters.status); }
    if (filters.type) { conditions.push('a.type = ?'); params.push(filters.type); }
    if (filters.dateFrom) { conditions.push('DATE(a.datetime) >= ?'); params.push(filters.dateFrom); }
    if (filters.dateTo) { conditions.push('DATE(a.datetime) <= ?'); params.push(filters.dateTo); }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY a.datetime DESC';
    return dbAll(db, query, params);
});

ipcMain.handle('db-insert', async (event, table, data) => {
    if (!db) throw new Error('Database not initialized');
    if (!data || typeof data !== 'object' || !Object.keys(data).length) throw new Error('Invalid data provided');
    if (!isAllowedTable(table)) throw new Error(`Table '${table}' is not allowed`);
    return runInTransaction(db, () => {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        return dbRun(db, `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, Object.values(data));
    });
});

ipcMain.handle('db-update', async (event, table, id, data) => {
    if (!db) throw new Error('Database not initialized');
    if (!id || !data || typeof data !== 'object' || !Object.keys(data).length) throw new Error('Invalid id or data provided');
    if (!isAllowedTable(table)) throw new Error(`Table '${table}' is not allowed`);
    return runInTransaction(db, () => {
        const columns = Object.keys(data).map((key) => `${key} = ?`).join(', ');
        const result = dbRun(db, `UPDATE ${table} SET ${columns}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...Object.values(data), id]);
        if (result.changes === 0) throw new Error(`Record with id ${id} not found in ${table}`);
        return result;
    });
});

ipcMain.handle('db-delete', async (event, table, id) => {
    if (!db) throw new Error('Database not initialized');
    if (!id) throw new Error('Invalid id provided');
    if (!isAllowedTable(table)) throw new Error(`Table '${table}' is not allowed`);
    return runInTransaction(db, () => {
        const result = dbRun(db, `DELETE FROM ${table} WHERE id = ?`, [id]);
        if (result.changes === 0) throw new Error(`Record with id ${id} not found in ${table}`);
        return result;
    });
});

// Backup bazy danych
ipcMain.handle('db-backup', async () => {
    try {
        if (!mainWindow) {
            throw new Error('Main window not available');
        }

        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            defaultPath: `grain_logistics_backup_${new Date().toISOString().split('T')[0]}.db`,
            filters: [
                { name: 'Database files', extensions: ['db'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        
        if (filePath) {
            fs.copyFileSync(dbPath, filePath);
            return { success: true, path: filePath };
        }
        
        return { success: false, cancelled: true };
    } catch (error) {
        console.error('Błąd backup:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('db-get-stats', async (event, dateFrom, dateTo) => {
    if (!db) throw new Error('Database not initialized');
    return dbGet(db, `
        SELECT COUNT(*) as total_appointments,
               SUM(CASE WHEN type = 'dostawa' THEN 1 ELSE 0 END) as deliveries,
               SUM(CASE WHEN type = 'odbiór' THEN 1 ELSE 0 END) as pickups,
               SUM(CASE WHEN status = 'zakończona' THEN quantity ELSE 0 END) as total_quantity,
               AVG(CASE WHEN status = 'zakończona' AND w.netto IS NOT NULL THEN w.netto ELSE NULL END) as avg_weight
        FROM appointments a
        LEFT JOIN weights w ON a.id = w.appointment_id
        WHERE DATE(a.datetime) BETWEEN ? AND ?`, [dateFrom, dateTo]);
});

// IPC handlers
ipcMain.handle('set-selected-date', async (event, date) => {
  selectedDate = date;
  return true;
});

ipcMain.handle('get-selected-date', async (event) => {
  return selectedDate;
});

ipcMain.handle('set-window-mode', async (event, mode) => {
    if (!mainWindow) return false;
    try {
        if (mode === 'splash') {
            if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false);
            if (mainWindow.isMaximized()) mainWindow.unmaximize();
            // zapisz bazowy rozmiar jeśli nie ustawiony
            if (!splashBaseSize) {
                splashBaseSize = mainWindow.getSize();
            }
            mainWindow.setResizable(false);
            mainWindow.setMaximizable(false);
            // użyj bazowego rozmiaru splash i wycentruj
            const [w, h] = splashBaseSize;
            mainWindow.setSize(w, h);
            mainWindow.center();
        } else if (mode === 'app') {
            // Włącz możliwość zmiany rozmiaru i maksymalizacji
            mainWindow.setResizable(true);
            mainWindow.setMaximizable(true);
            // Upewnij się, że okno jest zmaksymalizowane
            if (!mainWindow.isMaximized()) {
                mainWindow.maximize();
            }
            // Upewnij się, że okno jest widoczne i na wierzchu
            if (!mainWindow.isVisible()) {
                mainWindow.show();
            }
            mainWindow.focus();
        }
        return true;
    } catch (e) {
        console.error('set-window-mode error', e);
        return false;
    }
});

// Skup: ustawienie/odczyt docelowego widoku
ipcMain.handle('set-selected-skup-view', async (event, viewKey) => {
    selectedSkupView = viewKey || null;
    return true;
});

ipcMain.handle('get-selected-skup-view', async () => {
    return selectedSkupView;
});

ipcMain.handle('maximize-window', async () => {
    if (!mainWindow) return false;
    try {
        if (mainWindow.isMaximizable()) {
            mainWindow.maximize();
            return true;
        }
        return false;
    } catch (e) {
        console.error('maximize-window error', e);
        return false;
    }
});

ipcMain.handle('scale-get-config', async () => {
    if (!db) throw new Error('Database not initialized');
    return dbGet(db, 'SELECT * FROM skup_scale_config WHERE id = 1');
});

ipcMain.handle('scale-save-config', async (event, config) => {
    if (!db) throw new Error('Database not initialized');
    const fields = ['mode','serial_port','serial_baud','tcp_host','tcp_port','frame_format','stability_threshold','stability_time_ms'];
    const values = fields.map(k => config[k] ?? null);
    return dbRun(db,
        `INSERT INTO skup_scale_config (id, ${fields.join(',')}) VALUES (1, ${fields.map(()=>'?').join(',')})
         ON CONFLICT(id) DO UPDATE SET ${fields.map(f => `${f} = excluded.${f}`).join(', ')}, updated_at = CURRENT_TIMESTAMP`,
        values);
});

let mockScaleInterval = null;
let scaleTcpSession = null;

function stopScalePolling() {
    if (mockScaleInterval) { clearInterval(mockScaleInterval); mockScaleInterval = null; }
    if (scaleTcpSession) { scaleTcpSession.stop(); scaleTcpSession = null; }
}

function startMockScalePolling() {
    mockScaleInterval = setInterval(() => {
        try {
            const value = Math.max(0, (Math.sin(Date.now() / 2000) * 5000) + 20000 + (Math.random() * 50 - 25));
            dbRun(db, 'INSERT INTO skup_scale_readings (source, value, unit, stable) VALUES (?,?,?,?)', ['mock', value.toFixed(2), 'kg', 1]);
        } catch (_) { /* ignore */ }
    }, 1000);
}

ipcMain.handle('scale-start', async () => {
    try {
        if (!db) return false;
        if (mockScaleInterval || scaleTcpSession) return true;

        const cfg = dbGet(db, 'SELECT * FROM skup_scale_config WHERE id = 1');
        const mode = cfg?.mode || 'mock';

        if (mode === 'tcp' && cfg.tcp_host && cfg.tcp_port) {
            scaleTcpSession = new TcpDeviceSession({
                host: cfg.tcp_host,
                port: cfg.tcp_port,
                onFrame: (line) => {
                    const parsed = parseNumericFrame(line, cfg.frame_format || 'GENERIC');
                    if (!parsed || parsed.value == null) return;
                    dbRun(db, 'INSERT INTO skup_scale_readings (source, value, unit, stable) VALUES (?,?,?,?)',
                        ['tcp', parsed.value.toFixed(3), parsed.unit || 'kg', parsed.stable ? 1 : 0]);
                }
            });
            await scaleTcpSession.start();
            return true;
        }

        startMockScalePolling();
        return true;
    } catch (e) {
        console.error('scale-start error', e);
        stopScalePolling();
        startMockScalePolling();
        return true;
    }
});

ipcMain.handle('scale-stop', async () => {
    stopScalePolling();
    return true;
});

ipcMain.handle('scale-get-status', async () => {
    if (!db) return { connected: false, mode: 'unknown' };
    const cfg = dbGet(db, 'SELECT * FROM skup_scale_config WHERE id = 1');
    const latest = dbGet(db, 'SELECT * FROM skup_scale_readings ORDER BY reading_datetime DESC, id DESC LIMIT 1');
    return {
        mode: cfg?.mode || 'mock',
        connected: Boolean(mockScaleInterval || scaleTcpSession?.isActive?.()),
        host: cfg?.tcp_host || null,
        port: cfg?.tcp_port || null,
        latest
    };
});

ipcMain.handle('scale-get-latest', async () => {
    if (!db) throw new Error('Database not initialized');
    return dbGet(db, 'SELECT * FROM skup_scale_readings ORDER BY reading_datetime DESC, id DESC LIMIT 1');
});

// Prosta lista potencjalnych portów szeregowych (bez zależności) – do czasu wdrożenia 'serialport'
ipcMain.handle('scale-list-serial-ports', async () => {
    // Heurystyczna lista dla Windows (COM1..COM20)
    const ports = Array.from({ length: 20 }, (_, i) => `COM${i + 1}`);
    return ports;
});

// Test połączenia – TCP realny, Serial wymaga później biblioteki
ipcMain.handle('scale-test-connection', async (event, cfg) => {
    try {
        if (!cfg || !cfg.mode) return { success: false, message: 'Brak konfiguracji' };
        if (cfg.mode === 'mock') return { success: true, message: 'Tryb symulacji — gotowy' };
        if (cfg.mode === 'tcp') {
            await testTcpConnection(cfg.tcp_host, cfg.tcp_port);
            return { success: true, message: 'Połączono (TCP)' };
        }
        if (cfg.mode === 'serial') {
            return { success: false, message: 'Test portu szeregowego wymaga instalacji modułu serialport' };
        }
        return { success: false, message: 'Nieobsługiwany tryb' };
    } catch (e) {
        return { success: false, message: e.message || 'Błąd połączenia' };
    }
});

const labDeviceSessions = new Map();

ipcMain.handle('lab-device-test-connection', async (event, device) => {
    try {
        if (!device) return { success: false, message: 'Brak konfiguracji urządzenia' };
        if (device.connection_type === 'manual') return { success: true, message: 'Tryb ręczny — bez połączenia sieciowego' };
        if (device.connection_type === 'tcp') {
            await testTcpConnection(device.tcp_host, device.tcp_port);
            return { success: true, message: 'Połączono (TCP)' };
        }
        if (device.connection_type === 'serial') {
            return { success: false, message: 'Port szeregowy wymaga modułu serialport' };
        }
        return { success: false, message: 'Nieobsługiwany typ połączenia' };
    } catch (e) {
        return { success: false, message: e.message || 'Błąd połączenia' };
    }
});

ipcMain.handle('lab-device-start', async (event, deviceId) => {
    if (!db) throw new Error('Database not initialized');
    const device = dbGet(db, 'SELECT * FROM jakosc_devices WHERE id = ?', [deviceId]);
    if (!device) throw new Error('Urządzenie nie istnieje');
    if (device.connection_type !== 'tcp') return { success: false, message: 'Streaming dostępny tylko dla TCP' };
    if (labDeviceSessions.has(deviceId)) return { success: true };

    const session = new TcpDeviceSession({
        host: device.tcp_host,
        port: device.tcp_port,
        onFrame: (line) => {
            const parsed = parseLabFrame(line);
            if (!parsed) return;
            dbRun(db, `INSERT INTO jakosc_measurements (device_id, parameter, value, unit, source)
                VALUES (?,?,?,?,?)`,
                [deviceId, parsed.parameter, parsed.value, parsed.unit || '', 'tcp']);
        }
    });
    await session.start();
    labDeviceSessions.set(deviceId, session);
    dbRun(db, 'UPDATE jakosc_devices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['online', deviceId]);
    return { success: true };
});

ipcMain.handle('lab-device-stop', async (event, deviceId) => {
    const session = labDeviceSessions.get(deviceId);
    if (session) {
        session.stop();
        labDeviceSessions.delete(deviceId);
    }
    if (db) dbRun(db, 'UPDATE jakosc_devices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['aktywne', deviceId]);
    return { success: true };
});

ipcMain.handle('lab-device-read-once', async (event, deviceId) => {
    if (!db) throw new Error('Database not initialized');
    const device = dbGet(db, 'SELECT * FROM jakosc_devices WHERE id = ?', [deviceId]);
    if (!device) throw new Error('Urządzenie nie istnieje');
    if (device.connection_type === 'manual') return { success: false, message: 'Urządzenie w trybie ręcznym' };
    if (device.connection_type !== 'tcp') return { success: false, message: 'Odczyt jednorazowy dostępny dla TCP' };

    const raw = await readTcpOnce(device.tcp_host, device.tcp_port);
    const parsed = parseLabFrame(raw) || { parameter: 'wartosc', value: raw, unit: '' };
    const result = dbRun(db, `INSERT INTO jakosc_measurements (device_id, parameter, value, unit, source)
        VALUES (?,?,?,?,?)`,
        [deviceId, parsed.parameter, parsed.value, parsed.unit || '', 'tcp']);
    return { success: true, measurement: { ...parsed, id: result.lastInsertRowid } };
});

ipcMain.handle('appointment-save-weights', async (event, { appointmentId, brutto, tara, netto }) => {
    if (!db) throw new Error('Database not initialized');
    if (!appointmentId) throw new Error('Brak ID awizacji');
    const existing = dbGet(db, 'SELECT id FROM weights WHERE appointment_id = ?', [appointmentId]);
    const payload = {
        brutto: brutto ?? null,
        tara: tara ?? null,
        netto: netto ?? null,
        weight_datetime: new Date().toISOString()
    };
    if (existing) {
        dbRun(db, 'UPDATE weights SET brutto = ?, tara = ?, netto = ?, weight_datetime = ? WHERE appointment_id = ?',
            [payload.brutto, payload.tara, payload.netto, payload.weight_datetime, appointmentId]);
        return { id: existing.id, ...payload };
    }
    const res = dbRun(db, 'INSERT INTO weights (appointment_id, brutto, tara, netto, weight_datetime) VALUES (?,?,?,?,?)',
        [appointmentId, payload.brutto, payload.tara, payload.netto, payload.weight_datetime]);
    return { id: res.lastInsertRowid, ...payload };
});

function nextDocNumber(prefix, rows, seqIndex) {
    let next = 1;
    if (rows?.length && rows[0][Object.keys(rows[0])[0]]) {
        const parts = String(rows[0][Object.keys(rows[0])[0]]).split('-');
        next = (Number(parts[seqIndex]) || 0) + 1;
    }
    return next;
}

ipcMain.handle('generate-document-number', async (event, { type, date }) => {
    if (!db) throw new Error('Database not initialized');
    const now = date ? new Date(date) : new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    if (type === 'BATCH') {
        const prefix = `BATCH-${yyyy}${mm}${dd}-`;
        const rows = dbAll(db, 'SELECT batch_number FROM magazyn_batches WHERE batch_number LIKE ? ORDER BY batch_number DESC LIMIT 1', [`${prefix}%`]);
        return `${prefix}${String(nextDocNumber(prefix, rows, 2)).padStart(4, '0')}`;
    }
    const map = {
        WZ: ['wydanie', `WZ-${yyyy}-`],
        PZ: ['przyjecie', `PZ-${yyyy}-`],
        MM: ['przesuniecie', `MM-${yyyy}-`]
    };
    if (map[type]) {
        const [movementType, prefix] = map[type];
        const rows = dbAll(db, 'SELECT document_number FROM magazyn_movements WHERE movement_type = ? AND document_number LIKE ? ORDER BY document_number DESC LIMIT 1', [movementType, `${prefix}%`]);
        return `${prefix}${String(nextDocNumber(prefix, rows, 2)).padStart(4, '0')}`;
    }
    throw new Error(`Unsupported document number type: ${type}`);
});

ipcMain.handle('db-check-integrity', async () => {
    if (!db) throw new Error('Database not initialized');
    return checkDatabaseIntegrity(db);
});

ipcMain.handle('db-optimize', async () => {
    if (!db) throw new Error('Database not initialized');
    optimizeDatabase(db);
    return true;
});

ipcMain.handle('db-get-info', async () => {
    if (!db) throw new Error('Database not initialized');
    const tables = dbAll(db, "SELECT name FROM sqlite_master WHERE type='table'");
    return {
        tables: tables.map(t => t.name),
        grains_columns: dbAll(db, 'PRAGMA table_info(grains)'),
        contractors_columns: dbAll(db, 'PRAGMA table_info(contractors)'),
        appointments_columns: dbAll(db, 'PRAGMA table_info(appointments)')
    };
});

ipcMain.handle('db-cleanup', async (event, options = {}) => {
    if (!db) throw new Error('Database not initialized');
    const { daysToKeep = 365 } = options;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    return runInTransaction(db, () => {
        dbRun(db, "DELETE FROM skup_scale_readings WHERE reading_datetime < datetime('now', '-30 days')");
        dbRun(db, "DELETE FROM appointments WHERE datetime < ? AND status = 'zakończona'", [cutoffDateStr]);
        return { message: 'Cleanup completed successfully' };
    });
});

ipcMain.handle('db-resolve-magazyn-grain', async (event, skupGrainId) => {
    if (!db) throw new Error('Database not initialized');
    return resolveMagazynGrainId(db, skupGrainId);
});

// Zapis przyjęcia skupu z mapowaniem słowników i ruchem magazynowym (transakcja)
ipcMain.handle('skup-save-intake', async (event, payload) => {
    if (!db) throw new Error('Database not initialized');
    const { intakeData, warehouseId, isUpdate, intakeId } = payload || {};
    return saveSkupIntakeWithMovement(db, { intakeData, warehouseId, isUpdate, intakeId });
});

// Ustawienia aplikacji
ipcMain.handle('settings-get', async (event, key) => {
    if (!db) throw new Error('Database not initialized');
    return getSetting(db, key);
});

ipcMain.handle('settings-get-all', async () => {
    if (!db) throw new Error('Database not initialized');
    const rows = await dbAll(db, 'SELECT key, value FROM settings');
    return rows.reduce((acc, r) => ({ ...acc, [r.key]: r.value }), {});
});

ipcMain.handle('settings-set', async (event, key, value) => {
    if (!db) throw new Error('Database not initialized');
    await setSetting(db, key, value);
    return true;
});

// Przywracanie kopii zapasowej
ipcMain.handle('db-restore', async () => {
    try {
        if (!mainWindow) throw new Error('Main window not available');
        const { response } = await dialog.showMessageBox(mainWindow, {
            type: 'warning',
            buttons: ['Anuluj', 'Przywróć'],
            defaultId: 0,
            title: 'Przywracanie bazy danych',
            message: 'Przywrócenie kopii zapasowej nadpisze bieżącą bazę danych. Kontynuować?'
        });
        if (response !== 1) return { success: false, cancelled: true };

        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            filters: [{ name: 'Database files', extensions: ['db'] }],
            properties: ['openFile']
        });
        if (!filePaths || !filePaths.length) return { success: false, cancelled: true };

        if (db && !isDatabaseClosed) {
            closeDatabaseConnection();
        }
        fs.copyFileSync(filePaths[0], dbPath);
        isDatabaseClosed = false;
        await initDatabase();
        return { success: true, path: filePaths[0] };
    } catch (error) {
        console.error('Błąd restore:', error);
        return { success: false, error: error.message };
    }
});

// Eksport danych do JSON
ipcMain.handle('db-export', async () => {
    try {
        if (!mainWindow || !db) throw new Error('Database not available');
        const { filePath } = await dialog.showSaveDialog(mainWindow, {
            defaultPath: `grain_logistics_export_${new Date().toISOString().split('T')[0]}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });
        if (!filePath) return { success: false, cancelled: true };

        const tables = await dbAll(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        const exportData = { exportedAt: new Date().toISOString(), tables: {} };
        for (const { name } of tables) {
            if (isAllowedTable(name)) {
                exportData.tables[name] = await dbAll(db, `SELECT * FROM ${name}`);
            }
        }
        fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf8');
        return { success: true, path: filePath };
    } catch (error) {
        console.error('Błąd export:', error);
        return { success: false, error: error.message };
    }
});