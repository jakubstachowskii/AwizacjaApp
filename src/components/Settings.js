import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  FaCog,
  FaDatabase,
  FaDownload,
  FaUpload,
  FaTrash,
  FaInfoCircle,
  FaShieldAlt,
  FaPalette,
  FaBell,
  FaFileExport,
  FaFileImport,
  FaRedo,
  FaExclamationTriangle
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';

const Settings = () => {
  const { showSuccess, showError, showWarning } = useNotification();
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [clearDataDialogOpen, setClearDataDialogOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState(null);

  // Ustawienia aplikacji
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: false,
    darkMode: false,
    language: 'pl',
    theme: 'default'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (window.electronAPI?.settingsGetAll) {
          const saved = await window.electronAPI.settingsGetAll();
          if (saved && Object.keys(saved).length) {
            setSettings((prev) => ({
              ...prev,
              notifications: saved.notifications !== 'false',
              autoBackup: saved.autoBackup === 'true',
              darkMode: saved.darkMode === 'true',
              language: saved.language || 'pl',
              theme: saved.theme || 'default'
            }));
          }
        }
      } catch (_) { /* ignore */ }
    };
    loadSettings();
  }, []);

  const handleSettingChange = async (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    try {
      if (window.electronAPI?.settingsSet) {
        await window.electronAPI.settingsSet(setting, String(value));
      }
      showSuccess(`Ustawienie zapisane`);
    } catch {
      showError('Nie udało się zapisać ustawienia');
    }
  };

  const handleBackup = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.dbBackup();
        showSuccess('Kopia zapasowa została utworzona pomyślnie');
      } else {
        showError('Funkcja kopii zapasowej nie jest dostępna');
      }
    } catch (error) {
      showError('Błąd podczas tworzenia kopii zapasowej');
    }
    setBackupDialogOpen(false);
  };

  const handleRestore = async () => {
    try {
      if (window.electronAPI?.dbRestore) {
        const result = await window.electronAPI.dbRestore();
        if (result?.success) {
          showSuccess('Baza danych została przywrócona. Odśwież widok aplikacji.');
        } else if (!result?.cancelled) {
          showError(result?.error || 'Błąd przywracania');
        }
      } else {
        showError('Funkcja przywracania nie jest dostępna');
      }
    } catch (error) {
      showError('Błąd podczas przywracania danych');
    }
    setRestoreDialogOpen(false);
  };

  const handleExport = async () => {
    try {
      if (window.electronAPI?.dbExport) {
        const result = await window.electronAPI.dbExport();
        if (result?.success) showSuccess('Eksport zakończony pomyślnie');
        else if (!result?.cancelled) showError(result?.error || 'Błąd eksportu');
      }
    } catch {
      showError('Błąd podczas eksportu danych');
    }
  };

  const handleClearData = async () => {
    setClearDataDialogOpen(false);
    showWarning('Pełne czyszczenie bazy nie jest dostępne z poziomu UI. Użyj kopii zapasowej przed ręczną operacją na pliku bazy.');
  };

  const handleTestDatabase = async () => {
    try {
      if (window.electronAPI?.dbCheckIntegrity) {
        const ok = await window.electronAPI.dbCheckIntegrity();
        if (ok) showSuccess('Połączenie z bazą danych: OK');
        else showError('Wykryto problem z integralnością bazy');
      }
    } catch {
      showError('Błąd połączenia z bazą danych');
    }
  };

  const handleResetSettings = async () => {
    const defaults = { notifications: true, autoBackup: false, darkMode: false, language: 'pl', theme: 'default' };
    setSettings(defaults);
    try {
      if (window.electronAPI?.settingsSet) {
        await Promise.all(Object.entries(defaults).map(([k, v]) => window.electronAPI.settingsSet(k, String(v))));
      }
      showSuccess('Ustawienia przywrócone do domyślnych');
    } catch {
      showError('Nie udało się zresetować ustawień');
    }
  };

  const getDatabaseStats = async () => {
    try {
      if (window.electronAPI) {
        const stats = await window.electronAPI.dbGetStats();
        return stats;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd podczas pobierania statystyk bazy danych:', error);
      }
    }
    return null;
  };

  return (
    <Box sx={{ p: 0 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#1e293b' }}>
        <FaCog style={{ marginRight: '12px', verticalAlign: 'middle' }} />
        Ustawienia Systemu
      </Typography>

      <Grid container spacing={3}>
        {/* Ustawienia ogólne */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <FaCog style={{ marginRight: '8px' }} />
                Ustawienia Ogólne
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <FaBell color="#2563eb" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Powiadomienia systemowe"
                    secondary="Otrzymuj powiadomienia o ważnych zdarzeniach"
                  />
                  <Switch
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FaDatabase color="#10b981" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Automatyczne kopie zapasowe"
                    secondary="Twórz kopie zapasowe bazy danych automatycznie"
                  />
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <FaPalette color="#8b5cf6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tryb ciemny"
                    secondary="Funkcja planowana w kolejnej wersji"
                  />
                  <Switch checked={false} disabled />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Zarządzanie danymi */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <FaDatabase style={{ marginRight: '8px' }} />
                Zarządzanie Danymi
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FaDownload />}
                  fullWidth
                  onClick={() => setBackupDialogOpen(true)}
                >
                  Utwórz kopię zapasową
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FaUpload />}
                  fullWidth
                  onClick={() => setRestoreDialogOpen(true)}
                >
                  Przywróć z kopii zapasowej
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FaFileExport />}
                  fullWidth
                  onClick={handleExport}
                >
                  Eksportuj dane
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FaFileImport />}
                  fullWidth
                  disabled
                  title="Import danych — planowany w kolejnej wersji"
                >
                  Importuj dane (wkrótce)
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Informacje o systemie */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <FaInfoCircle style={{ marginRight: '8px' }} />
                Informacje o Systemie
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Wersja aplikacji"
                    secondary="1.0.0"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Baza danych"
                    secondary="SQLite (lokalna)"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Platforma"
                    secondary="Electron + React"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Autor"
                    secondary="Awizaxja Team"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Narzędzia systemowe */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <FaShieldAlt style={{ marginRight: '8px' }} />
                Narzędzia Systemowe
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FaRedo />}
                  fullWidth
                  color="primary"
                  onClick={handleTestDatabase}
                >
                  Test połączenia z bazą
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FaTrash />}
                  fullWidth
                  color="error"
                  onClick={() => setClearDataDialogOpen(true)}
                >
                  Wyczyść wszystkie dane
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<FaCog />}
                  fullWidth
                  onClick={handleResetSettings}
                >
                  Resetuj ustawienia
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogi */}
      
      {/* Dialog kopii zapasowej */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)}>
        <DialogTitle>Utwórz kopię zapasową</DialogTitle>
        <DialogContent>
          <Typography>
            Czy chcesz utworzyć kopię zapasową wszystkich danych? 
            Kopia zostanie zapisana w katalogu aplikacji.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleBackup} variant="contained">Utwórz</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog przywracania */}
      <Dialog open={restoreDialogOpen} onClose={() => setRestoreDialogOpen(false)}>
        <DialogTitle>Przywróć z kopii zapasowej</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Otworzy się okno wyboru pliku kopii zapasowej (.db).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleRestore} variant="contained">Przywróć</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog czyszczenia danych */}
      <Dialog open={clearDataDialogOpen} onClose={() => setClearDataDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FaExclamationTriangle color="#ef4444" />
            Wyczyść wszystkie dane
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Ta operacja usunie wszystkie dane z aplikacji. 
            Ta akcja jest nieodwracalna!
          </Alert>
          <Typography>
            Czy na pewno chcesz wyczyścić wszystkie dane? 
            Ta operacja nie może być cofnięta.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDataDialogOpen(false)}>Anuluj</Button>
          <Button onClick={handleClearData} variant="contained" color="error">
            Wyczyść dane
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings; 