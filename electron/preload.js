const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbGetAll: (table, orderBy = 'id') => ipcRenderer.invoke('db-get-all', table, orderBy),
  dbInsert: (table, data) => ipcRenderer.invoke('db-insert', table, data),
  dbUpdate: (table, id, data) => ipcRenderer.invoke('db-update', table, id, data),
  dbDelete: (table, id) => ipcRenderer.invoke('db-delete', table, id),
  generateDocumentNumber: (type, date) => ipcRenderer.invoke('generate-document-number', { type, date }),
  dbGetAppointments: (filters = {}) => ipcRenderer.invoke('db-get-appointments', filters),
  dbBackup: () => ipcRenderer.invoke('db-backup'),
  dbGetStats: (dateFrom, dateTo) => ipcRenderer.invoke('db-get-stats', dateFrom, dateTo),
  
  // Database management
  dbCheckIntegrity: () => ipcRenderer.invoke('db-check-integrity'),
  dbOptimize: () => ipcRenderer.invoke('db-optimize'),
  dbGetInfo: () => ipcRenderer.invoke('db-get-info'),
  dbCleanup: (options) => ipcRenderer.invoke('db-cleanup', options),
  
  // Utility functions
  setSelectedDate: (date) => ipcRenderer.invoke('set-selected-date', date),
  getSelectedDate: () => ipcRenderer.invoke('get-selected-date'),

  // Window controls
  setWindowMode: (mode) => ipcRenderer.invoke('set-window-mode', mode),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  setSelectedSkupView: (viewKey) => ipcRenderer.invoke('set-selected-skup-view', viewKey),
  getSelectedSkupView: () => ipcRenderer.invoke('get-selected-skup-view'),

  // Scale (waga) APIs
  scaleGetConfig: () => ipcRenderer.invoke('scale-get-config'),
  scaleSaveConfig: (config) => ipcRenderer.invoke('scale-save-config', config),
  scaleStart: () => ipcRenderer.invoke('scale-start'),
  scaleStop: () => ipcRenderer.invoke('scale-stop'),
  scaleGetLatest: () => ipcRenderer.invoke('scale-get-latest'),
  scaleGetStatus: () => ipcRenderer.invoke('scale-get-status'),
  scaleListSerialPorts: () => ipcRenderer.invoke('scale-list-serial-ports'),
  scaleTestConnection: (cfg) => ipcRenderer.invoke('scale-test-connection', cfg),

  // Urządzenia laboratoryjne (Jakość)
  labDeviceTestConnection: (device) => ipcRenderer.invoke('lab-device-test-connection', device),
  labDeviceStart: (deviceId) => ipcRenderer.invoke('lab-device-start', deviceId),
  labDeviceStop: (deviceId) => ipcRenderer.invoke('lab-device-stop', deviceId),
  labDeviceReadOnce: (deviceId) => ipcRenderer.invoke('lab-device-read-once', deviceId),

  // Awizacje – wagi
  appointmentSaveWeights: (payload) => ipcRenderer.invoke('appointment-save-weights', payload),

  // Skup – transakcyjny zapis przyjęcia
  skupSaveIntake: (payload) => ipcRenderer.invoke('skup-save-intake', payload),
  resolveMagazynGrainId: (skupGrainId) => ipcRenderer.invoke('db-resolve-magazyn-grain', skupGrainId),

  // Ustawienia aplikacji
  settingsGet: (key) => ipcRenderer.invoke('settings-get', key),
  settingsGetAll: () => ipcRenderer.invoke('settings-get-all'),
  settingsSet: (key, value) => ipcRenderer.invoke('settings-set', key, value),

  // Backup / restore / export
  dbRestore: () => ipcRenderer.invoke('db-restore'),
  dbExport: () => ipcRenderer.invoke('db-export')
});