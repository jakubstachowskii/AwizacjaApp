import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid,
  Typography, IconButton, Chip, Select, MenuItem, FormControl, InputLabel, Alert
} from '@mui/material';
import { FaPlus, FaTrash, FaPlay, FaStop, FaSync, FaPlug } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import ConfirmDialog from '../../../components/ConfirmDialog';

const DEVICE_TYPES = [
  { value: 'wilgotnosciomierz', label: 'Wilgotnościomierz' },
  { value: 'spektrometr', label: 'Spektrometr / NIR' },
  { value: 'termometr', label: 'Termometr / sonda' },
  { value: 'waga_lab', label: 'Waga laboratoryjna' },
  { value: 'inne', label: 'Inne' }
];

const EMPTY = {
  name: '', model: '', serial_number: '',
  connection_type: 'tcp', tcp_host: '', tcp_port: 5000,
  serial_port: '', serial_baud: 9600,
  calibration_date: '', calibration_due: '', status: 'aktywne', notes: ''
};

export default function DevicesView() {
  const [devices, setDevices] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [testMsg, setTestMsg] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setDevices(await window.electronAPI.dbGetAll('jakosc_devices', 'name') || []);
    setMeasurements(await window.electronAPI.dbGetAll('jakosc_measurements', 'measurement_datetime') || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = () => window.dispatchEvent(new Event('quality:refresh'));

  const save = async () => {
    if (!form.name?.trim()) return;
    if (form.id) {
      await window.electronAPI.dbUpdate('jakosc_devices', form.id, form);
    } else {
      await window.electronAPI.dbInsert('jakosc_devices', form);
    }
    setOpen(false);
    setForm(EMPTY);
    load();
    notify();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await window.electronAPI.labDeviceStop?.(deleteId);
    await window.electronAPI.dbDelete('jakosc_devices', deleteId);
    setDeleteId(null);
    load();
    notify();
  };

  const testConnection = async (device) => {
    setTestMsg(null);
    const res = await window.electronAPI.labDeviceTestConnection(device);
    setTestMsg(res);
  };

  const toggleStream = async (device) => {
    setBusyId(device.id);
    try {
      if (device.status === 'online') {
        await window.electronAPI.labDeviceStop(device.id);
      } else {
        await window.electronAPI.labDeviceStart(device.id);
      }
      load();
    } finally {
      setBusyId(null);
    }
  };

  const readOnce = async (deviceId) => {
    setBusyId(deviceId);
    try {
      await window.electronAPI.labDeviceReadOnce(deviceId);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const deviceName = (id) => devices.find((d) => d.id === id)?.name || id;

  return (
    <Box>
      <PageHeader
        title="Urządzenia pomiarowe"
        subtitle="Wilgotnościomierze, spektrometry i inne urządzenia laboratoryjne (TCP/IP, RS232)"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => { setForm(EMPTY); setOpen(true); }}>Dodaj urządzenie</Button>}
      />

      {testMsg && (
        <Alert severity={testMsg.success ? 'success' : 'error'} sx={{ mb: 2 }} onClose={() => setTestMsg(null)}>
          {testMsg.message}
        </Alert>
      )}

      <DataPanel>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nazwa</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Połączenie</TableCell>
              <TableCell>Adres</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Brak urządzeń — dodaj wilgotnościomierz lub spektrometr sieciowy.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : devices.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{d.name}</TableCell>
                <TableCell>{d.model || '—'}</TableCell>
                <TableCell>{d.connection_type?.toUpperCase()}</TableCell>
                <TableCell>
                  {d.connection_type === 'tcp' ? `${d.tcp_host || '—'}:${d.tcp_port || '—'}` : d.serial_port || '—'}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={d.status} color={d.status === 'online' ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <IconButton size="small" title="Test połączenia" onClick={() => testConnection(d)}><FaPlug size={14} /></IconButton>
                  {d.connection_type === 'tcp' && (
                    <>
                      <IconButton size="small" title={d.status === 'online' ? 'Zatrzymaj' : 'Start streaming'} disabled={busyId === d.id}
                        onClick={() => toggleStream(d)}>
                        {d.status === 'online' ? <FaStop size={14} /> : <FaPlay size={14} />}
                      </IconButton>
                      <IconButton size="small" title="Odczyt jednorazowy" disabled={busyId === d.id} onClick={() => readOnce(d.id)}>
                        <FaSync size={14} />
                      </IconButton>
                    </>
                  )}
                  <IconButton size="small" color="error" onClick={() => setDeleteId(d.id)}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Ostatnie pomiary z urządzeń</Typography>
        <DataPanel>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Czas</TableCell><TableCell>Urządzenie</TableCell><TableCell>Parametr</TableCell><TableCell>Wartość</TableCell><TableCell>Źródło</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements.slice(-15).reverse().map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.measurement_datetime?.slice(0, 19).replace('T', ' ')}</TableCell>
                  <TableCell>{deviceName(m.device_id)}</TableCell>
                  <TableCell>{m.parameter}</TableCell>
                  <TableCell>{m.value} {m.unit}</TableCell>
                  <TableCell>{m.source}</TableCell>
                </TableRow>
              ))}
              {measurements.length === 0 && (
                <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Brak pomiarów.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </DataPanel>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>{form.id ? 'Edytuj urządzenie' : 'Nowe urządzenie'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Nazwa" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Model" value={form.model || ''} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Numer seryjny" value={form.serial_number || ''} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Typ połączenia</InputLabel>
                <Select label="Typ połączenia" value={form.connection_type} onChange={(e) => setForm({ ...form, connection_type: e.target.value })}>
                  <MenuItem value="manual">Ręczny</MenuItem>
                  <MenuItem value="tcp">TCP/IP (sieć)</MenuItem>
                  <MenuItem value="serial">RS232 (port szeregowy)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {form.connection_type === 'tcp' && (
              <>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth size="small" label="Adres IP" value={form.tcp_host || ''} onChange={(e) => setForm({ ...form, tcp_host: e.target.value })} placeholder="192.168.1.50" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth size="small" label="Port" type="number" value={form.tcp_port || ''} onChange={(e) => setForm({ ...form, tcp_port: Number(e.target.value) })} />
                </Grid>
              </>
            )}
            {form.connection_type === 'serial' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Port COM" value={form.serial_port || ''} onChange={(e) => setForm({ ...form, serial_port: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Baud" type="number" value={form.serial_baud || 9600} onChange={(e) => setForm({ ...form, serial_baud: Number(e.target.value) })} />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Notatki" multiline rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={save} disabled={!form.name?.trim()}>Zapisz</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Usuń urządzenie"
        message="Czy na pewno chcesz usunąć to urządzenie i jego pomiary?"
        confirmText="Usuń"
      />
    </Box>
  );
}
