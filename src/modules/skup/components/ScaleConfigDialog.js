import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Chip
} from '@mui/material';

// 10 przykładowych modeli wag i ich domyślne ustawienia
const SCALE_PRESETS = [
  { key: 'AUTO_DETECT', name: 'Auto-detekcja (zalecane)', mode: 'auto' },
  { key: 'RADWAG_W1', name: 'Radwag W1 (RS232)', mode: 'serial', serial_baud: 9600, frame_format: 'RADWAG' },
  { key: 'RADWAG_W2', name: 'Radwag W2 (TCP)', mode: 'tcp', tcp_port: 4001, frame_format: 'RADWAG' },
  { key: 'SARTORIUS_CW', name: 'Sartorius Combics (RS232)', mode: 'serial', serial_baud: 9600, frame_format: 'SART' },
  { key: 'METTLER_TOLEDO_IND', name: 'Mettler Toledo IND (RS232)', mode: 'serial', serial_baud: 9600, frame_format: 'MT' },
  { key: 'AXIS_BDU', name: 'AXIS BDU (RS232)', mode: 'serial', serial_baud: 9600, frame_format: 'AXIS' },
  { key: 'OMRON_WX', name: 'Omron WX (TCP)', mode: 'tcp', tcp_port: 5000, frame_format: 'GENERIC' },
  { key: 'RADWAG_PUE', name: 'Radwag PUE (TCP)', mode: 'tcp', tcp_port: 2111, frame_format: 'RADWAG' },
  { key: 'KERN_IK', name: 'KERN IK (RS232)', mode: 'serial', serial_baud: 9600, frame_format: 'GENERIC' },
  { key: 'CUSTOM', name: 'Ustawienia ręczne', mode: 'manual' }
];

const ScaleConfigDialog = ({ open, onClose, onSaved }) => {
  const [modelKey, setModelKey] = useState('AUTO_DETECT');
  const [config, setConfig] = useState({
    mode: 'auto',
    serial_port: '',
    serial_baud: 9600,
    tcp_host: '',
    tcp_port: 0,
    frame_format: 'GENERIC',
    stability_threshold: 1.0,
    stability_time_ms: 1500
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [serialPorts, setSerialPorts] = useState([]);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setLoading(true);
        const saved = await window.electronAPI.scaleGetConfig();
        if (saved) {
          setConfig(prev => ({ ...prev, ...saved }));
          // Dopasuj preset do istniejącej konfiguracji (best-effort)
          const match = SCALE_PRESETS.find(p => p.mode === saved.mode) || SCALE_PRESETS[0];
          setModelKey(match.key);
        }
        try {
          const ports = await window.electronAPI.scaleListSerialPorts();
          if (Array.isArray(ports)) setSerialPorts(ports);
        } catch (_) {}
      } catch (e) {
        setError('Nie udało się wczytać konfiguracji wagi');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  const applyPreset = useCallback((preset) => {
    const next = { ...config };
    next.mode = preset.mode || next.mode;
    if (preset.serial_baud) next.serial_baud = preset.serial_baud;
    if (preset.tcp_port) next.tcp_port = preset.tcp_port;
    if (preset.frame_format) next.frame_format = preset.frame_format;
    setConfig(next);
  }, [config]);

  const handleModelChange = (e) => {
    const key = e.target.value;
    setModelKey(key);
    const preset = SCALE_PRESETS.find(p => p.key === key) || SCALE_PRESETS[0];
    applyPreset(preset);
  };

  const handleField = (field) => (e) => {
    const value = e.target.value;
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await window.electronAPI.scaleSaveConfig(config);
      setMessage('Zapisano ustawienia wagi');
      if (onSaved) onSaved(config);
    } catch (e) {
      setError('Błąd zapisu ustawień wagi');
    } finally {
      setLoading(false);
    }
  };

  const mode = config.mode;

  const testConnection = async () => {
    try {
      setError('');
      setMessage('');
      const res = await window.electronAPI.scaleTestConnection(config);
      if (res?.success) setMessage(res.message || 'Połączenie OK');
      else setError(res?.message || 'Błąd połączenia');
    } catch (e) {
      setError('Błąd testu połączenia');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>⚙️ Konfiguracja wagi</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Model wagi</InputLabel>
              <Select value={modelKey} label="Model wagi" onChange={handleModelChange}>
                {SCALE_PRESETS.map(p => (
                  <MenuItem key={p.key} value={p.key}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 1 }}>
              <Chip label={`Tryb: ${mode}`} size="small" color="primary" sx={{ mr: 1 }} />
              <Chip label={`Format: ${config.frame_format || 'GENERIC'}`} size="small" />
            </Box>
          </Grid>

          {(mode === 'serial') && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Port szeregowy</InputLabel>
                  <Select value={config.serial_port || ''} label="Port szeregowy" onChange={handleField('serial_port')}>
                    <MenuItem value="">(Wpisz ręcznie)</MenuItem>
                    {serialPorts.map(p => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Prędkość (baud)" type="number" value={config.serial_baud || 9600} onChange={handleField('serial_baud')} />
              </Grid>
            </>
          )}

          {(mode === 'tcp') && (
            <>
              <Grid item xs={12} sm={8}>
                <TextField fullWidth label="Adres IP" value={config.tcp_host || ''} onChange={handleField('tcp_host')} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Port" type="number" value={config.tcp_port || 0} onChange={handleField('tcp_port')} />
              </Grid>
            </>
          )}

          {(mode === 'auto' || mode === 'manual') && (
            <Grid item xs={12}>
              <Alert severity="info">Tryb {mode === 'auto' ? 'auto-detekcji' : 'ręcznej konfiguracji'}. Ustaw parametry poniżej, jeśli wymagane.</Alert>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Próg stabilności (kg)" type="number" value={config.stability_threshold ?? 1.0} onChange={handleField('stability_threshold')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Czas stabilności (ms)" type="number" value={config.stability_time_ms ?? 1500} onChange={handleField('stability_time_ms')} />
          </Grid>

          {message && (
            <Grid item xs={12}>
              <Alert severity="success">{message}</Alert>
            </Grid>
          )}
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Zamknij</Button>
        <Button onClick={testConnection}>Test połączenia</Button>
        <Button variant="contained" onClick={saveConfig} disabled={loading}>
          Zapisz ustawienia
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScaleConfigDialog;


