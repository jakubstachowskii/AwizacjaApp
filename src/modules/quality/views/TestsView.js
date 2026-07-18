import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography, IconButton,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { FaPlus, FaTrash, FaSync } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { compactEmptyRowSx } from '../../../theme/designTokens';

const FIELDS = [
  { name: 'sample_code', label: 'Kod próbki' },
  { name: 'test_date', label: 'Data badania', type: 'datetime-local' },
  { name: 'moisture_content', label: 'Wilgotność %', type: 'number' },
  { name: 'impurities_content', label: 'Zanieczyszczenia %', type: 'number' },
  { name: 'protein_content', label: 'Białko %', type: 'number' },
  { name: 'falling_number', label: 'Liczba opadania', type: 'number' },
  { name: 'result', label: 'Wynik (zgodny/niezgodny)' },
  { name: 'notes', label: 'Notatki' }
];

export default function TestsView() {
  const [rows, setRows] = useState([]);
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [importDeviceId, setImportDeviceId] = useState('');
  const [importMsg, setImportMsg] = useState(null);
  const [form, setForm] = useState({ sample_code: '', test_date: new Date().toISOString().slice(0, 16), result: 'zgodny', notes: '' });

  const load = useCallback(async () => {
    setRows(await window.electronAPI.dbGetAll('jakosc_tests', 'test_date') || []);
    setDevices(await window.electronAPI.dbGetAll('jakosc_devices', 'name') || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const notify = () => window.dispatchEvent(new Event('quality:refresh'));

  const importFromDevice = async () => {
    if (!importDeviceId) return;
    setImportMsg(null);
    try {
      const res = await window.electronAPI.labDeviceReadOnce(Number(importDeviceId));
      if (!res?.success) {
        setImportMsg({ type: 'error', text: res?.message || 'Błąd odczytu' });
        return;
      }
      const m = res.measurement;
      const updates = { ...form };
      if (m?.parameter === 'wilgotnosc' || m?.parameter === 'moisture') {
        updates.moisture_content = m.value;
      } else if (m?.parameter === 'temperatura') {
        updates.notes = [form.notes, `Temp: ${m.value}${m.unit || ''}`].filter(Boolean).join('; ');
      } else {
        updates.notes = [form.notes, `Odczyt: ${m?.value} ${m?.unit || ''}`].filter(Boolean).join('; ');
      }
      setForm(updates);
      setImportMsg({ type: 'success', text: 'Zaimportowano pomiar z urządzenia sieciowego' });
    } catch (e) {
      setImportMsg({ type: 'error', text: e.message || 'Błąd importu' });
    }
  };

  const save = async () => {
    await window.electronAPI.dbInsert('jakosc_tests', form);
    setOpen(false);
    load();
    notify();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await window.electronAPI.dbDelete('jakosc_tests', deleteId);
    setDeleteId(null);
    load();
    notify();
  };

  return (
    <Box>
      <PageHeader
        title="Badania laboratoryjne"
        subtitle="Rejestr próbek i wyników analiz"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowe badanie</Button>}
      />
      <DataPanel>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kod próbki</TableCell><TableCell>Data</TableCell><TableCell>Wilgotność</TableCell><TableCell>Wynik</TableCell><TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak badań.</Typography></TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.sample_code}</TableCell>
                <TableCell>{r.test_date}</TableCell>
                <TableCell>{r.moisture_content ?? '—'}%</TableCell>
                <TableCell>{r.result}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setDeleteId(r.id)}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowe badanie</DialogTitle>
        <DialogContent dividers>
          {importMsg && <Alert severity={importMsg.type} sx={{ mb: 2 }}>{importMsg.text}</Alert>}
          {devices.filter((d) => d.connection_type === 'tcp').length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Urządzenie sieciowe</InputLabel>
                <Select label="Urządzenie sieciowe" value={importDeviceId} onChange={(e) => setImportDeviceId(e.target.value)}>
                  {devices.filter((d) => d.connection_type === 'tcp').map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button size="small" variant="outlined" startIcon={<FaSync />} onClick={importFromDevice} disabled={!importDeviceId}>
                Importuj pomiar
              </Button>
            </Box>
          )}
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {FIELDS.map((f) => (
              <Grid item xs={12} sm={6} key={f.name}>
                <TextField fullWidth size="small" label={f.label} type={f.type || 'text'}
                  value={form[f.name] || ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>Anuluj</Button>
          <Button variant="contained" onClick={save}>Zapisz</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Usuń badanie"
        message="Czy na pewno chcesz usunąć to badanie? Tej operacji nie można cofnąć."
        confirmText="Usuń"
      />
    </Box>
  );
}
