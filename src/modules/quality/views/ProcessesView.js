import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography, IconButton, MenuItem
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/PageHeader';
import DataPanel from '../../../components/DataPanel';
import { compactEmptyRowSx } from '../../../theme/designTokens';

export default function ProcessesView() {
  const [processes, setProcesses] = useState([]);
  const [checks, setChecks] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'HACCP', owner: '', description: '' });

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([
      window.electronAPI.dbGetAll('jakosc_processes', 'code'),
      window.electronAPI.dbGetAll('jakosc_process_checks', 'check_datetime')
    ]);
    setProcesses(p || []);
    setChecks((c || []).slice(-10).reverse());
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await window.electronAPI.dbInsert('jakosc_processes', form);
    setOpen(false);
    load();
    window.dispatchEvent(new Event('quality:refresh'));
  };

  return (
    <Box>
      <PageHeader
        title="Procesy HACCP / GMP"
        subtitle="Definicje procesów i ostatnie kontrole"
        action={<Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowy proces</Button>}
      />
      <DataPanel>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kod</TableCell><TableCell>Nazwa</TableCell><TableCell>Typ</TableCell><TableCell>Właściciel</TableCell><TableCell align="right" width={56} />
            </TableRow>
          </TableHead>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow><TableCell colSpan={5}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak procesów.</Typography></TableCell></TableRow>
            ) : processes.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ fontWeight: 500 }}>{r.code}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.owner || '—'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={async () => { await window.electronAPI.dbDelete('jakosc_processes', r.id); load(); window.dispatchEvent(new Event('quality:refresh')); }}><FaTrash size={14} /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4, mb: 1.5 }}>Ostatnie kontrole</Typography>
      <DataPanel>
        <Table size="small">
          <TableHead><TableRow><TableCell>Data</TableCell><TableCell>Punkt kontrolny</TableCell><TableCell>Wynik</TableCell></TableRow></TableHead>
          <TableBody>
            {checks.length === 0 ? (
              <TableRow><TableCell colSpan={3}><Typography variant="body2" color="text.secondary" sx={compactEmptyRowSx}>Brak kontroli.</Typography></TableCell></TableRow>
            ) : checks.map((c) => (
              <TableRow key={c.id} hover><TableCell>{c.check_datetime}</TableCell><TableCell>{c.checkpoint}</TableCell><TableCell>{c.result}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </DataPanel>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>Nowy proces</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={6}><TextField fullWidth size="small" label="Kod" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField select fullWidth size="small" label="Typ" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><MenuItem value="HACCP">HACCP</MenuItem><MenuItem value="GMP">GMP</MenuItem></TextField></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Nazwa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Właściciel" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} size="small" label="Opis" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save}>Zapisz</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
