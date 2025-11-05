const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const net = require('net');

// Wyłączenie GPU acceleration i cache
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-sandbox');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-features', 'VizDisplayCompositor');

let mainWindow;
let db;
let selectedDate = null;
let splashBaseSize = null; // [width, height]
let isDatabaseClosed = false; // Flaga do śledzenia czy baza została już zamknięta
let selectedSkupView = null; // docelowy widok startowy dla Skup

// Ścieżka do bazy danych
const dbPath = path.join(app.getPath('userData'), 'grain_logistics.db');

// Sprawdzenie integralności bazy danych - bezpieczna wersja
function checkDatabaseIntegrity() {
    return new Promise((resolve, reject) => {
        // Sprawdź czy baza istnieje i ma tabele
        db.get("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1", (err, row) => {
            if (err) {
                console.log('Nowa baza danych - pomijam sprawdzenie integralności');
                resolve(true);
                return;
            }
            
            if (!row) {
                console.log('Baza danych jest pusta - pomijam sprawdzenie integralności');
                resolve(true);
                return;
            }
            
            // Sprawdź integralność tylko jeśli baza ma tabele
            db.get("PRAGMA integrity_check", (err, integrityRow) => {
                if (err) {
                    console.log('Nie można sprawdzić integralności - kontynuuję');
                    resolve(true);
                    return;
                }
                
                if (integrityRow && integrityRow.integrity_check === 'ok') {
                    console.log('✓ Integralność bazy danych: OK');
                    resolve(true);
                } else {
                    console.log('⚠ Ostrzeżenie: Problemy z integralnością bazy danych');
                    resolve(true); // Kontynuuj mimo problemów
                }
            });
        });
    });
}

// Optymalizacja bazy danych (VACUUM) - tylko w trybie development
function optimizeDatabase() {
    return new Promise((resolve, reject) => {
        // VACUUM tylko w trybie development, w produkcji może powodować problemy
        if (process.env.NODE_ENV === 'development') {
            console.log('Optymalizacja bazy danych (VACUUM)...');
            db.run("VACUUM", (err) => {
                if (err) {
                    console.error('Błąd optymalizacji bazy danych:', err);
                    reject(err);
                } else {
                    console.log('✓ Optymalizacja bazy danych zakończona');
                    resolve();
                }
            });
        } else {
            console.log('✓ Pomijam VACUUM w trybie produkcyjnym');
            resolve();
        }
    });
}

// Włączenie WAL mode dla lepszej wydajności
function enableWALMode() {
    return new Promise((resolve, reject) => {
        db.run("PRAGMA journal_mode=WAL", (err) => {
            if (err) {
                console.error('Błąd włączania WAL mode:', err);
                reject(err);
            } else {
                console.log('✓ WAL mode włączony');
                resolve();
            }
        });
    });
}

// Włączenie foreign keys
function enableForeignKeys() {
    return new Promise((resolve, reject) => {
        db.run("PRAGMA foreign_keys=ON", (err) => {
            if (err) {
                console.error('Błąd włączania foreign keys:', err);
                reject(err);
            } else {
                console.log('✓ Foreign keys włączone');
                resolve();
            }
        });
    });
}

// Inicjalizacja bazy danych - uproszczona wersja
function initDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Błąd połączenia z bazą danych:', err);
                reject(err);
                return;
            }
            
            console.log('Połączono z bazą danych SQLite');
            
            // Włącz podstawowe ustawienia
            db.run("PRAGMA foreign_keys=ON", (err) => {
                if (err) {
                    console.log('Nie można włączyć foreign keys');
                } else {
                    console.log('✓ Foreign keys włączone');
                }
            });
            
            // Wczytanie schematu
            const schemaPath = path.join(__dirname, '../schema.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                db.exec(schema, (err) => {
                    if (err) {
                        console.error('Błąd inicjalizacji schematu:', err);
                        reject(err);
                    } else {
                        console.log('Schema załadowany pomyślnie');
                        // Dodaj przykładowe dane jeśli baza jest pusta
                        initSampleData().then(() => {
                            console.log('✓ Inicjalizacja bazy danych zakończona');
                            resolve();
                        }).catch((err) => {
                            console.error('Błąd inicjalizacji przykładowych danych:', err);
                            resolve(); // Kontynuuj nawet jeśli przykładowe dane się nie dodadzą
                        });
                    }
                });
            } else {
                console.error('Plik schematu nie istnieje:', schemaPath);
                reject(new Error('Schema file not found'));
            }
        });
    });
}

// Funkcja do inicjalizacji przykładowych danych
function initSampleData() {
    return new Promise((resolve, reject) => {
        // Sprawdź czy baza jest pusta
        db.get("SELECT COUNT(*) as count FROM grains", (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Jeśli baza jest pusta, dodaj przykładowe dane
            if (row.count === 0) {
                console.log('Dodawanie przykładowych danych...');
                
                // Dodaj przykładowe zboża
                const grains = [
                    { name: 'Pszenica', unit: 't' },
                    { name: 'Żyto', unit: 't' },
                    { name: 'Jęczmień', unit: 't' },
                    { name: 'Owies', unit: 't' },
                    { name: 'Kukurydza', unit: 't' }
                ];
                
                // Dodaj przykładowych kontrahentów
                const contractors = [
                    { name: 'Jan Kowalski', nip: '1234567890', address: 'ul. Rolnicza 1, 00-001 Warszawa', phone: '123-456-789', email: 'jan.kowalski@email.pl', type: 'rolnik' },
                    { name: 'Firma Transportowa ABC', nip: '0987654321', address: 'ul. Transportowa 10, 00-002 Warszawa', phone: '987-654-321', email: 'abc@transport.pl', type: 'transport' },
                    { name: 'Skup Zboża XYZ', nip: '1122334455', address: 'ul. Skupowa 5, 00-003 Warszawa', phone: '111-222-333', email: 'skup@xyz.pl', type: 'firma' }
                ];
                
                // Dodaj zboża
                const grainPromises = grains.map(grain => {
                    return new Promise((resolve, reject) => {
                        db.run("INSERT INTO grains (name, unit) VALUES (?, ?)", 
                            [grain.name, grain.unit], 
                            function(err) {
                                if (err) reject(err);
                                else resolve();
                            });
                    });
                });
                
                // Dodaj kontrahentów
                const contractorPromises = contractors.map(contractor => {
                    return new Promise((resolve, reject) => {
                        db.run("INSERT INTO contractors (name, nip, address, phone, email, type) VALUES (?, ?, ?, ?, ?, ?)", 
                            [contractor.name, contractor.nip, contractor.address, contractor.phone, contractor.email, contractor.type], 
                            function(err) {
                                if (err) reject(err);
                                else resolve();
                            });
                    });
                });
                
                // Wykonaj wszystkie operacje
                Promise.all([...grainPromises, ...contractorPromises])
                    .then(() => {
                        console.log('Przykładowe dane dodane pomyślnie');
                        resolve();
                    })
                    .catch(reject);
            } else {
                console.log('Baza danych zawiera już dane, pomijam dodawanie przykładowych danych');
                resolve();
            }
        });
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            disableBlinkFeatures: 'Auxclick',
            enableWebSQL: false,
            spellcheck: false,
            partition: 'persist:main'
        },
        show: false,
        titleBarStyle: 'default',
        resizable: false,
        minimizable: true,
        maximizable: false
    });

    // Zapamiętaj bazowy rozmiar Splash przy starcie
    splashBaseSize = mainWindow.getSize();

    // W trybie development ładuj z localhost, w produkcji z pliku
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
    } else {
      mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        // Ustaw okno w trybie aplikacji od razu, żeby uniknąć migania
        mainWindow.setResizable(true);
        mainWindow.setMaximizable(true);
        mainWindow.maximize();
        mainWindow.show();
    });

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
    try {
        // Timeout dla inicjalizacji bazy danych
        const initPromise = initDatabase();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout inicjalizacji bazy danych')), 10000);
        });
        
        await Promise.race([initPromise, timeoutPromise]);
        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    } catch (error) {
        console.error('Błąd inicjalizacji aplikacji:', error);
        // Spróbuj uruchomić aplikację mimo błędu bazy danych
        console.log('Uruchamiam aplikację w trybie awaryjnym...');
        createWindow();
    }
});

// Obsługa zamykania aplikacji
app.on('before-quit', (event) => {
    if (db && !isDatabaseClosed) {
        console.log('Zamykanie bazy danych...');
        event.preventDefault(); // Zapobiegaj natychmiastowemu zamknięciu
        isDatabaseClosed = true;
        
        db.close((err) => {
            if (err) {
                console.error('❌ Błąd zamykania bazy danych:', err);
            } else {
                console.log('✓ Baza danych zamknięta pomyślnie');
            }
            console.log('👋 Aplikacja zamknięta');
            app.exit(0); // Wymuś zamknięcie aplikacji
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (db && !isDatabaseClosed) {
            console.log('Zamykanie bazy danych...');
            isDatabaseClosed = true;
            db.close((err) => {
                if (err) {
                    console.error('❌ Błąd zamykania bazy danych:', err);
                } else {
                    console.log('✓ Baza danych zamknięta pomyślnie');
                }
                console.log('👋 Aplikacja zamknięta');
                app.quit();
            });
        } else if (!db) {
            console.log('✓ Aplikacja zamknięta (brak połączenia z bazą danych)');
            console.log('👋 Aplikacja zamknięta');
            app.quit();
        } else {
            // Baza już została zamknięta przez before-quit
            console.log('👋 Aplikacja zamknięta');
            app.quit();
        }
    }
});

// IPC Handlers dla operacji na bazie danych

// Pobieranie danych z walidacją
ipcMain.handle('db-get-all', async (event, table, orderBy = 'id') => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        // Sprawdź czy tabela istnieje
        const allowedTables = ['grains', 'contractors', 'appointments', 'weights', 'settings', 
                              'skup_intakes', 'skup_contractors', 'skup_grains', 'skup_prices', 
                              'skup_documents', 'skup_quality_rules', 'skup_contracts', 'skup_scale_config',
                              'skup_weight_audit', 'skup_deliveries',
                              'magazyn_warehouses', 'magazyn_stock_levels', 'magazyn_movements', 'magazyn_transfers',
                              'magazyn_quality_samples', 'magazyn_quality_certificates', 'magazyn_inventories', 'magazyn_inventory_items', 'magazyn_storage_plans',
                              'magazyn_batches', 'magazyn_batch_movements'];
        if (!allowedTables.includes(table)) {
            reject(new Error(`Table '${table}' is not allowed`));
            return;
        }

        // Walidacja orderBy - tylko alfanumeryczne znaki, podkreślenia i kropki
        if (!/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(orderBy)) {
            reject(new Error('Invalid orderBy parameter'));
            return;
        }

        const query = `SELECT * FROM ${table} ORDER BY ${orderBy}`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error(`Błąd pobierania danych z ${table}:`, err);
                reject(err);
            } else {
                resolve(rows || []);
            }
        });
    });
});

// Pobieranie awizacji z joinami
ipcMain.handle('db-get-appointments', async (event, filters = {}) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        let query = `
            SELECT 
                a.*,
                g.name as grain_name,
                g.unit as grain_unit,
                c.name as contractor_name,
                w.brutto,
                w.tara,
                w.netto
            FROM appointments a
            LEFT JOIN grains g ON a.grain_id = g.id
            LEFT JOIN contractors c ON a.contractor_id = c.id
            LEFT JOIN weights w ON a.id = w.appointment_id
        `;
        
        const conditions = [];
        const params = [];
        
        if (filters.status) {
            conditions.push('a.status = ?');
            params.push(filters.status);
        }
        
        if (filters.type) {
            conditions.push('a.type = ?');
            params.push(filters.type);
        }
        
        if (filters.dateFrom) {
            conditions.push('DATE(a.datetime) >= ?');
            params.push(filters.dateFrom);
        }
        
        if (filters.dateTo) {
            conditions.push('DATE(a.datetime) <= ?');
            params.push(filters.dateTo);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY a.datetime DESC';
        
        db.all(query, params, (err, rows) => {
            if (err) {
                console.error('Błąd pobierania awizacji:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
});

// Dodawanie rekordu z transakcją
ipcMain.handle('db-insert', async (event, table, data) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        // Walidacja danych
        if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
            reject(new Error('Invalid data provided'));
            return;
        }

        // Sprawdź czy tabela istnieje
        const allowedTables = ['grains', 'contractors', 'appointments', 'weights', 'settings', 
                              'skup_intakes', 'skup_contractors', 'skup_grains', 'skup_prices', 
                              'skup_documents', 'skup_quality_rules', 'skup_contracts', 'skup_scale_config',
                              'skup_weight_audit', 'skup_deliveries',
                              'magazyn_warehouses', 'magazyn_stock_levels', 'magazyn_movements', 'magazyn_transfers',
                              'magazyn_quality_samples', 'magazyn_quality_certificates', 'magazyn_inventories', 'magazyn_inventory_items', 'magazyn_storage_plans',
                              'magazyn_batches', 'magazyn_batch_movements'];
        if (!allowedTables.includes(table)) {
            reject(new Error(`Table '${table}' is not allowed`));
            return;
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            const columns = Object.keys(data).join(', ');
            const placeholders = Object.keys(data).map(() => '?').join(', ');
            const values = Object.values(data);
            
            const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
            
            db.run(query, values, function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    console.error(`Błąd dodawania rekordu do ${table}:`, err);
                    reject(err);
                } else {
                    db.run("COMMIT");
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    });
});

// Aktualizacja rekordu z transakcją
ipcMain.handle('db-update', async (event, table, id, data) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        // Walidacja danych
        if (!id || !data || typeof data !== 'object' || Object.keys(data).length === 0) {
            reject(new Error('Invalid id or data provided'));
            return;
        }

        // Sprawdź czy tabela istnieje
        const allowedTables = ['grains', 'contractors', 'appointments', 'weights', 'settings', 
                              'skup_intakes', 'skup_contractors', 'skup_grains', 'skup_prices', 
                              'skup_documents', 'skup_quality_rules', 'skup_contracts', 'skup_scale_config',
                              'skup_weight_audit', 'skup_deliveries',
                              'magazyn_warehouses', 'magazyn_stock_levels', 'magazyn_movements', 'magazyn_transfers',
                              'magazyn_quality_samples', 'magazyn_quality_certificates', 'magazyn_inventories', 'magazyn_inventory_items', 'magazyn_storage_plans'];
        if (!allowedTables.includes(table)) {
            reject(new Error(`Table '${table}' is not allowed`));
            return;
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            const columns = Object.keys(data).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(data), id];
            
            const query = `UPDATE ${table} SET ${columns}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            
            db.run(query, values, function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    console.error(`Błąd aktualizacji rekordu w ${table}:`, err);
                    reject(err);
                } else {
                    if (this.changes === 0) {
                        db.run("ROLLBACK");
                        reject(new Error(`Record with id ${id} not found in ${table}`));
                    } else {
                        db.run("COMMIT");
                        resolve({ changes: this.changes });
                    }
                }
            });
        });
    });
});

// Usuwanie rekordu z transakcją
ipcMain.handle('db-delete', async (event, table, id) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        // Walidacja danych
        if (!id) {
            reject(new Error('Invalid id provided'));
            return;
        }

        // Sprawdź czy tabela istnieje
        const allowedTables = ['grains', 'contractors', 'appointments', 'weights', 'settings', 
                              'skup_intakes', 'skup_contractors', 'skup_grains', 'skup_prices', 
                              'skup_documents', 'skup_quality_rules', 'skup_contracts', 'skup_scale_config',
                              'skup_weight_audit', 'skup_deliveries',
                              'magazyn_warehouses', 'magazyn_stock_levels', 'magazyn_movements', 'magazyn_transfers',
                              'magazyn_quality_samples', 'magazyn_quality_certificates', 'magazyn_inventories', 'magazyn_inventory_items', 'magazyn_storage_plans',
                              'magazyn_batches', 'magazyn_batch_movements'];
        if (!allowedTables.includes(table)) {
            reject(new Error(`Table '${table}' is not allowed`));
            return;
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            const query = `DELETE FROM ${table} WHERE id = ?`;
            
            db.run(query, [id], function(err) {
                if (err) {
                    db.run("ROLLBACK");
                    console.error(`Błąd usuwania rekordu z ${table}:`, err);
                    reject(err);
                } else {
                    if (this.changes === 0) {
                        db.run("ROLLBACK");
                        reject(new Error(`Record with id ${id} not found in ${table}`));
                    } else {
                        db.run("COMMIT");
                        resolve({ changes: this.changes });
                    }
                }
            });
        });
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

// Statystyki
ipcMain.handle('db-get-stats', async (event, dateFrom, dateTo) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const query = `
            SELECT 
                COUNT(*) as total_appointments,
                SUM(CASE WHEN type = 'dostawa' THEN 1 ELSE 0 END) as deliveries,
                SUM(CASE WHEN type = 'odbiór' THEN 1 ELSE 0 END) as pickups,
                SUM(CASE WHEN status = 'zakończona' THEN quantity ELSE 0 END) as total_quantity,
                AVG(CASE WHEN status = 'zakończona' AND w.netto IS NOT NULL THEN w.netto ELSE NULL END) as avg_weight
            FROM appointments a
            LEFT JOIN weights w ON a.id = w.appointment_id
            WHERE DATE(a.datetime) BETWEEN ? AND ?
        `;
        
        db.get(query, [dateFrom, dateTo], (err, row) => {
            if (err) {
                console.error('Błąd pobierania statystyk:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
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
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM skup_scale_config WHERE id = 1', (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
});

ipcMain.handle('scale-save-config', async (event, config) => {
    return new Promise((resolve, reject) => {
        const fields = ['mode','serial_port','serial_baud','tcp_host','tcp_port','frame_format','stability_threshold','stability_time_ms'];
        const values = fields.map(k => config[k] ?? null);
        db.run(
            `INSERT INTO skup_scale_config (id, ${fields.join(',')}) VALUES (1, ${fields.map(()=>'?').join(',')})
             ON CONFLICT(id) DO UPDATE SET ${fields.map(f => `${f} = excluded.${f}`).join(', ')}, updated_at = CURRENT_TIMESTAMP`,
            values,
            function(err){ if (err) reject(err); else resolve({ changes: this.changes }); }
        );
    });
});

let mockScaleInterval = null;

ipcMain.handle('scale-start', async () => {
    try {
        if (mockScaleInterval) return true;
        mockScaleInterval = setInterval(() => {
            const value = Math.max(0, (Math.sin(Date.now()/2000) * 5000) + 20000 + (Math.random()*50 - 25));
            db.run('INSERT INTO skup_scale_readings (source, value, unit, stable) VALUES (?,?,?,?)', ['mock', value.toFixed(2), 'kg', 1]);
        }, 1000);
        return true;
    } catch (e) {
        console.error('scale-start error', e);
        return false;
    }
});

ipcMain.handle('scale-stop', async () => {
    try {
        if (mockScaleInterval) { clearInterval(mockScaleInterval); mockScaleInterval = null; }
        return true;
    } catch (e) { console.error('scale-stop error', e); return false; }
});

ipcMain.handle('scale-get-latest', async () => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM skup_scale_readings ORDER BY reading_datetime DESC, id DESC LIMIT 1', (err, row) => {
            if (err) return reject(err);
            resolve(row || null);
        });
    });
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
        if (cfg.mode === 'tcp') {
            if (!cfg.tcp_host || !cfg.tcp_port) return { success: false, message: 'Uzupełnij adres i port' };
            await new Promise((resolve, reject) => {
                const socket = new net.Socket();
                const timer = setTimeout(() => {
                    try { socket.destroy(); } catch (_) {}
                    reject(new Error('Timeout'));
                }, 1500);
                socket.connect(Number(cfg.tcp_port), cfg.tcp_host, () => {
                    clearTimeout(timer);
                    socket.end();
                    resolve();
                });
                socket.on('error', (e) => {
                    clearTimeout(timer);
                    reject(e);
                });
            });
            return { success: true, message: 'Połączono (TCP)' };
        }
        if (cfg.mode === 'serial') {
            // Do czasu instalacji 'serialport' zwracamy informację o braku wsparcia testu
            return { success: false, message: 'Test portu szeregowego wymaga instalacji modułu serialport' };
        }
        return { success: false, message: 'Nieobsługiwany tryb' };
    } catch (e) {
        return { success: false, message: e.message || 'Błąd połączenia' };
    }
});

// Generator numerów dokumentów (BATCH: dzienny, WZ: roczny)
ipcMain.handle('generate-document-number', async (event, { type, date }) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const now = date ? new Date(date) : new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');

        if (type === 'BATCH') {
            const prefix = `BATCH-${yyyy}${mm}${dd}-`;
            const query = `SELECT batch_number FROM magazyn_batches WHERE batch_number LIKE ? ORDER BY batch_number DESC LIMIT 1`;
            db.all(query, [`${prefix}%`], (err, rows) => {
                if (err) { reject(err); return; }
                let next = 1;
                if (rows && rows.length > 0 && rows[0].batch_number) {
                    const parts = String(rows[0].batch_number).split('-');
                    const lastSeq = Number(parts[2]) || 0;
                    next = lastSeq + 1;
                }
                resolve(`${prefix}${String(next).padStart(4, '0')}`);
            });
            return;
        }

        if (type === 'WZ') {
            const prefix = `WZ-${yyyy}-`;
            const query = `SELECT document_number FROM magazyn_movements WHERE movement_type = 'wydanie' AND document_number LIKE ? ORDER BY document_number DESC LIMIT 1`;
            db.all(query, [`${prefix}%`], (err, rows) => {
                if (err) { reject(err); return; }
                let next = 1;
                if (rows && rows.length > 0 && rows[0].document_number) {
                    const parts = String(rows[0].document_number).split('-');
                    const lastSeq = Number(parts[2]) || 0;
                    next = lastSeq + 1;
                }
                resolve(`${prefix}${String(next).padStart(4, '0')}`);
            });
            return;
        }

        if (type === 'PZ') {
            const prefix = `PZ-${yyyy}-`;
            const query = `SELECT document_number FROM magazyn_movements WHERE movement_type = 'przyjecie' AND document_number LIKE ? ORDER BY document_number DESC LIMIT 1`;
            db.all(query, [`${prefix}%`], (err, rows) => {
                if (err) { reject(err); return; }
                let next = 1;
                if (rows && rows.length > 0 && rows[0].document_number) {
                    const parts = String(rows[0].document_number).split('-');
                    const lastSeq = Number(parts[2]) || 0;
                    next = lastSeq + 1;
                }
                resolve(`${prefix}${String(next).padStart(4, '0')}`);
            });
            return;
        }

        if (type === 'MM') {
            const prefix = `MM-${yyyy}-`;
            const query = `SELECT document_number FROM magazyn_movements WHERE movement_type = 'przesuniecie' AND document_number LIKE ? ORDER BY document_number DESC LIMIT 1`;
            db.all(query, [`${prefix}%`], (err, rows) => {
                if (err) { reject(err); return; }
                let next = 1;
                if (rows && rows.length > 0 && rows[0].document_number) {
                    const parts = String(rows[0].document_number).split('-');
                    const lastSeq = Number(parts[2]) || 0;
                    next = lastSeq + 1;
                }
                resolve(`${prefix}${String(next).padStart(4, '0')}`);
            });
            return;
        }

        reject(new Error(`Unsupported document number type: ${type}`));
    });
});

// Nowe funkcje zarządzania bazą danych

// Sprawdzenie integralności bazy danych
ipcMain.handle('db-check-integrity', async () => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        checkDatabaseIntegrity().then(resolve).catch(reject);
    });
});

// Optymalizacja bazy danych (VACUUM)
ipcMain.handle('db-optimize', async () => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        optimizeDatabase().then(resolve).catch(reject);
    });
});

// Pobieranie informacji o bazie danych
ipcMain.handle('db-get-info', async () => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const queries = [
            "SELECT name FROM sqlite_master WHERE type='table'",
            "PRAGMA table_info(grains)",
            "PRAGMA table_info(contractors)",
            "PRAGMA table_info(appointments)"
        ];

        db.serialize(() => {
            const results = {};
            let completed = 0;
            
            db.all(queries[0], [], (err, tables) => {
                if (err) {
                    reject(err);
                    return;
                }
                results.tables = tables.map(t => t.name);
                completed++;
                if (completed === queries.length) {
                    resolve(results);
                }
            });

            // Pobierz informacje o tabelach
            ['grains', 'contractors', 'appointments'].forEach((table, index) => {
                db.all(queries[index + 1], [], (err, columns) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    results[`${table}_columns`] = columns;
                    completed++;
                    if (completed === queries.length) {
                        resolve(results);
                    }
                });
            });
        });
    });
});

// Czyszczenie starych danych (opcjonalne)
ipcMain.handle('db-cleanup', async (event, options = {}) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }

        const { daysToKeep = 365 } = options;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            // Usuń stare odczyty wagi (starsze niż 30 dni)
            db.run("DELETE FROM skup_scale_readings WHERE reading_datetime < datetime('now', '-30 days')", (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    reject(err);
                    return;
                }
                
                // Usuń stare awizacje (starsze niż określona liczba dni)
                db.run("DELETE FROM appointments WHERE datetime < ? AND status = 'zakończona'", [cutoffDateStr], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        reject(err);
                        return;
                    }
                    
                    db.run("COMMIT");
                    resolve({ message: 'Cleanup completed successfully' });
                });
            });
        });
    });
});