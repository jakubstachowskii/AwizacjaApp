import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography,
  FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import { FaPlus, FaTrash } from 'react-icons/fa';

export default function TransfersView() {
  const [rows, setRows] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [grains, setGrains] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ from_warehouse_id: '', to_warehouse_id: '', grain_id: '', quantity: '', unit: 't', notes: '' });

  const load = useCallback(async () => {
    const [t, w, g] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_transfers', 'transfer_date'),
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name'),
      window.electronAPI.dbGetAll('grains', 'name')
    ]);
    setRows(t || []);
    setWarehouses(w || []);
    setGrains(g || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const qty = Number(form.quantity);
    if (!form.from_warehouse_id || !form.to_warehouse_id || !form.grain_id || qty <= 0) return;
    await window.electronAPI.dbInsert('magazyn_transfers', {
      ...form,
      from_warehouse_id: Number(form.from_warehouse_id),
      to_warehouse_id: Number(form.to_warehouse_id),
      grain_id: Number(form.grain_id),
      quantity: qty
    });
    // Aktualizacja stanów
    const stocks = await window.electronAPI.dbGetAll('magazyn_stock_levels', 'id');
    const from = stocks.find((s) => s.warehouse_id === Number(form.from_warehouse_id) && s.grain_id === Number(form.grain_id));
    const to = stocks.find((s) => s.warehouse_id === Number(form.to_warehouse_id) && s.grain_id === Number(form.grain_id));
    if (from) await window.electronAPI.dbUpdate('magazyn_stock_levels', from.id, { quantity: Number(from.quantity) - qty });
    if (to) await window.electronAPI.dbUpdate('magazyn_stock_levels', to.id, { quantity: Number(to.quantity || 0) + qty });
    else await window.electronAPI.dbInsert('magazyn_stock_levels', { warehouse_id: Number(form.to_warehouse_id), grain_id: Number(form.grain_id), quantity: qty, unit: form.unit });
    setOpen(false);
    load();
  };

  const whName = (id) => warehouses.find((w) => w.id === id)?.name || id;
  const grainName = (id) => grains.find((g) => g.id === id)?.name || id;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>Przesunięcia między magazynami</Typography>
        <Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowe przesunięcie</Button>
      </Box>
      <Table size="small">
        <TableHead><TableRow><TableCell>Z</TableCell><TableCell>Do</TableCell><TableCell>Zboże</TableCell><TableCell>Ilość</TableCell><TableCell>Data</TableCell><TableCell /></TableRow></TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{whName(r.from_warehouse_id)}</TableCell>
              <TableCell>{whName(r.to_warehouse_id)}</TableCell>
              <TableCell>{grainName(r.grain_id)}</TableCell>
              <TableCell>{r.quantity} {r.unit}</TableCell>
              <TableCell>{r.transfer_date}</TableCell>
              <TableCell><IconButton size="small" color="error" onClick={async () => { await window.electronAPI.dbDelete('magazyn_transfers', r.id); load(); }}><FaTrash /></IconButton></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Przesunięcie magazynowe</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {['from_warehouse_id', 'to_warehouse_id', 'grain_id'].map((field, idx) => (
              <Grid item xs={12} key={field}>
                <FormControl fullWidth size="small">
                  <InputLabel>{idx === 0 ? 'Magazyn źródłowy' : idx === 1 ? 'Magazyn docelowy' : 'Zboże'}</InputLabel>
                  <Select value={form[field]} label="..." onChange={(e) => setForm({ ...form, [field]: e.target.value })}>
                    {(idx < 2 ? warehouses : grains).map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            ))}
            <Grid item xs={6}><TextField fullWidth size="small" type="number" label="Ilość" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth size="small" label="Notatki" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save}>Zapisz</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
