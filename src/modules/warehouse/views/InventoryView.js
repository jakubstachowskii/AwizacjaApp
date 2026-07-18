import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip, IconButton } from '@mui/material';
import { FaIndustry } from 'react-icons/fa';
import { Delete as DeleteIcon } from '@mui/icons-material';
import ConfirmDialog from '../../../components/ConfirmDialog';

const WarehouseDialog = ({ open, onClose, onSubmit, initial }) => {
  const [values, setValues] = useState({ name: '', code: '', type: 'silos', capacity: '', unit: 't', location: '', description: '', is_active: 1 });
  useEffect(() => { setValues(initial || { name: '', code: '', type: 'silos', capacity: '', unit: 't', location: '', description: '', is_active: 1 }); }, [initial, open]);
  const h = (f) => (e) => setValues(v => ({ ...v, [f]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(2,6,23,0.12)' } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1.5 }}>{initial ? 'Edytuj magazyn' : 'Nowy magazyn'}</DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, '& .MuiFormControl-root, & .MuiTextField-root': { size: 'small' } }}>
        <Box sx={{ p: 3, mb: 2, borderRadius: 2, border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2563eb', fontWeight: 700, borderBottom: '3px solid #2563eb', pb: 1, fontSize: '1.05rem' }}>
            Dane magazynu
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Nazwa" size="small" value={values.name} onChange={h('name')} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Kod" size="small" value={values.code} onChange={h('code')} /></Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small"><InputLabel>Typ</InputLabel>
               <Select value={values.type} label="Typ" onChange={h('type')} size="small">
                <MenuItem value="silos">Silos</MenuItem>
                <MenuItem value="magazyn">Magazyn</MenuItem>
                <MenuItem value="bunkier">Bunkier</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Pojemność" type="number" size="small" value={values.capacity} onChange={h('capacity')} /></Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small"><InputLabel>Jednostka</InputLabel>
               <Select value={values.unit} label="Jednostka" onChange={h('unit')} size="small">
                <MenuItem value="t">t</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Lokalizacja" size="small" value={values.location} onChange={h('location')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Opis" multiline rows={2} size="small" value={values.description} onChange={h('description')} /></Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={onClose}>Anuluj</Button>
        <Button size="small" variant="contained" onClick={() => onSubmit(values)}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function InventoryView() {
  const [warehouses, setWarehouses] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [grains, setGrains] = useState([]);
  const [openWh, setOpenWh] = useState(false);
  const [editWh, setEditWh] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const loadAll = useCallback(async () => {
    const [wh, st, gr] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name'),
      window.electronAPI.dbGetAll('magazyn_stock_levels', 'last_updated'),
      window.electronAPI.dbGetAll('grains', 'name')
    ]);
    setWarehouses(wh || []);
    setStocks(st || []);
    setGrains(gr || []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveWarehouse = async (v) => {
    if (editWh) await window.electronAPI.dbUpdate('magazyn_warehouses', editWh.id, v);
    else await window.electronAPI.dbInsert('magazyn_warehouses', v);
    setOpenWh(false); setEditWh(null); loadAll();
  };

  const confirmAndDelete = (table, id) => {
    setPendingDelete({ table, id });
    setConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    await window.electronAPI.dbDelete(pendingDelete.table, pendingDelete.id);
    setConfirmOpen(false);
    setPendingDelete(null);
    loadAll();
  };

  const totalByWh = useMemo(() => {
    const map = {};
    for (const s of stocks) {
      const key = s.warehouse_id;
      map[key] = (map[key] || 0) + Number(s.quantity || 0);
    }
    return map;
  }, [stocks]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaIndustry style={{ color: '#2563eb' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Magazyny i stany</Typography>
        </Box>
        <Button variant="contained" startIcon={<FaIndustry />} onClick={() => setOpenWh(true)}>Nowy magazyn</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Magazyny</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nazwa</TableCell>
                    <TableCell>Kod</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell>Pojemność</TableCell>
                    <TableCell align="right">Akcje</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(warehouses || []).map(w => (
                    <TableRow key={w.id}>
                      <TableCell>{w.name}</TableCell>
                      <TableCell><Chip label={w.code} size="small" /></TableCell>
                      <TableCell>{w.type}</TableCell>
                      <TableCell>{w.capacity} {w.unit}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => { setEditWh(w); setOpenWh(true); }}>Edytuj</Button>
                        <IconButton size="small" color="error" onClick={() => confirmAndDelete('magazyn_warehouses', w.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Aktualne stany</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Magazyn</TableCell>
                    <TableCell>Zboże</TableCell>
                    <TableCell align="right">Ilość</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stocks || []).map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{warehouses.find(w => w.id === s.warehouse_id)?.name || s.warehouse_id}</TableCell>
                      <TableCell>{grains.find(g => g.id === s.grain_id)?.name || s.grain_id}</TableCell>
                      <TableCell align="right">{Number(s.quantity || 0).toFixed(3)} {s.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <WarehouseDialog open={openWh} onClose={() => { setOpenWh(false); setEditWh(null); }} onSubmit={saveWarehouse} initial={editWh} />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={executeDelete}
        title="Usuń magazyn"
        message="Czy na pewno chcesz usunąć ten magazyn?"
        confirmText="Usuń"
      />
    </Box>
  );
}



