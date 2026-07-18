import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TextField, Grid, Typography,
  FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import { FaPlus } from 'react-icons/fa';

export default function InventoriesView() {
  const [inventories, setInventories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ warehouse_id: '', inventory_date: new Date().toISOString().slice(0, 10), notes: '' });

  const load = useCallback(async () => {
    const [inv, wh] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_inventories', 'inventory_date'),
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name')
    ]);
    setInventories(inv || []);
    setWarehouses(wh || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await window.electronAPI.dbInsert('magazyn_inventories', {
      ...form,
      warehouse_id: Number(form.warehouse_id),
      status: 'rozpoczeta'
    });
    setOpen(false);
    load();
  };

  const whName = (id) => warehouses.find((w) => w.id === id)?.name || id;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>Inwentaryzacje</Typography>
        <Button variant="contained" startIcon={<FaPlus />} onClick={() => setOpen(true)}>Nowa inwentaryzacja</Button>
      </Box>
      <Table size="small">
        <TableHead><TableRow><TableCell>Magazyn</TableCell><TableCell>Data</TableCell><TableCell>Status</TableCell><TableCell>Notatki</TableCell></TableRow></TableHead>
        <TableBody>
          {inventories.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{whName(r.warehouse_id)}</TableCell>
              <TableCell>{r.inventory_date}</TableCell>
              <TableCell><Chip size="small" label={r.status} /></TableCell>
              <TableCell>{r.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rozpocznij inwentaryzację</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small"><InputLabel>Magazyn</InputLabel>
                <Select value={form.warehouse_id} label="Magazyn" onChange={(e) => setForm({ ...form, warehouse_id: e.target.value })}>
                  {warehouses.map((w) => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth size="small" type="date" label="Data" InputLabelProps={{ shrink: true }} value={form.inventory_date} onChange={(e) => setForm({ ...form, inventory_date: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={2} size="small" label="Notatki" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)}>Anuluj</Button><Button variant="contained" onClick={save}>Zapisz</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
