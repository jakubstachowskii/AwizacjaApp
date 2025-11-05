import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, IconButton, TextField, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Snackbar, Alert } from '@mui/material';
import { FaLayerGroup, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const BatchDialog = ({ open, onClose, onSubmit, initial, grains }) => {
  const [v, setV] = useState({ batch_number: '', grain_id: '', origin: '', harvest_year: new Date().getFullYear(), quality_params: '{}', physical_mass: '', trade_mass: '', status: 'aktywna' });
  const isNew = !initial;
  useEffect(() => { setV(initial || { batch_number: '', grain_id: '', origin: '', harvest_year: new Date().getFullYear(), quality_params: '{}', physical_mass: '', trade_mass: '', status: 'aktywna' }); }, [initial, open]);
  // Auto numer przy tworzeniu nowej partii
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (open && isNew) {
          const num = await window.electronAPI.generateDocumentNumber('BATCH');
          if (!cancelled) setV(x => ({ ...x, batch_number: num }));
        }
      } catch (_) {}
    };
    run();
    return () => { cancelled = true; };
  }, [open, isNew]);
  const h = (f) => (e) => setV(x => ({ ...x, [f]: e.target.value }));
  const submit = () => onSubmit({ batch_number: v.batch_number, grain_id: Number(v.grain_id), origin: v.origin || null, harvest_year: Number(v.harvest_year) || null, quality_params: v.quality_params || '{}', physical_mass: v.physical_mass === '' ? 0 : Number(v.physical_mass), trade_mass: v.trade_mass === '' ? 0 : Number(v.trade_mass), status: v.status || 'aktywna' });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(2,6,23,0.12)' } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1.5 }}>Partia</DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ p: 3, mb: 2, borderRadius: 2, border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#0ea5e9', fontWeight: 700, borderBottom: '3px solid #0ea5e9', pb: 1, fontSize: '1.05rem' }}>Dane partii</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Numer partii" value={v.batch_number} onChange={h('batch_number')} InputProps={{ readOnly: isNew }} helperText={isNew ? 'Numer generowany automatycznie' : ''} /></Grid>
            <Grid item xs={12} md={6}><TextField select fullWidth size="small" label="Zboże" value={v.grain_id} onChange={h('grain_id')}>{grains.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}</TextField></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" label="Pochodzenie" value={v.origin} onChange={h('origin')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" type="number" label="Rok zbioru" value={v.harvest_year} onChange={h('harvest_year')} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={2} size="small" label="Parametry jakości (JSON)" value={v.quality_params} onChange={h('quality_params')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" type="number" label="Masa fizyczna [t]" value={v.physical_mass} onChange={h('physical_mass')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth size="small" type="number" label="Masa handlowa [t]" value={v.trade_mass} onChange={h('trade_mass')} /></Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={onClose}>Anuluj</Button>
        <Button size="small" variant="contained" onClick={submit}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function BatchesView() {
  const [rows, setRows] = useState([]);
  const [grains, setGrains] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    try {
      const [bs, gs] = await Promise.all([
        window.electronAPI.dbGetAll('magazyn_batches', 'id'),
        window.electronAPI.dbGetAll('grains', 'name')
      ]);
      setRows(bs.reverse());
      setGrains(gs);
    } catch (e) {
      setSnack({ open: true, message: 'Błąd ładowania', severity: 'error' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onAdd = async () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (row) => { setEditing(row); setOpen(true); };
  const onDelete = async (row) => {
    if (!window.confirm('Usunąć partię?')) return;
    try {
      await window.electronAPI.dbDelete('magazyn_batches', row.id);
      await load();
    } catch (e) { setSnack({ open: true, message: 'Błąd usuwania', severity: 'error' }); }
  };

  const submit = async (payload) => {
    try {
      if (editing) {
        await window.electronAPI.dbUpdate('magazyn_batches', editing.id, payload);
      } else {
        const autoNumber = await window.electronAPI.generateDocumentNumber('BATCH');
        await window.electronAPI.dbInsert('magazyn_batches', { ...payload, batch_number: autoNumber });
      }
      setOpen(false); setEditing(null); await load();
    } catch (e) { setSnack({ open: true, message: 'Błąd zapisu', severity: 'error' }); }
  };

  const grainMap = useMemo(() => Object.fromEntries(grains.map(g => [g.id, g.name])), [grains]);
  const filtered = useMemo(() => rows.filter(r => (r.batch_number||'').toLowerCase().includes(filter.toLowerCase()) || (grainMap[r.grain_id]||'').toLowerCase().includes(filter.toLowerCase())), [rows, filter, grainMap]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaLayerGroup style={{ color: '#0ea5e9' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Partie</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Filtruj..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <Button variant="contained" startIcon={<FaPlus />} onClick={onAdd}>Nowa partia</Button>
        </Box>
      </Box>

      <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Numer</TableCell>
                <TableCell>Zboże</TableCell>
                <TableCell>Pochodzenie</TableCell>
                <TableCell>Rok</TableCell>
                <TableCell align="right">Masa fiz. [t]</TableCell>
                <TableCell align="right">Masa handl. [t]</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.batch_number}</TableCell>
                  <TableCell>{grainMap[row.grain_id] || row.grain_id}</TableCell>
                  <TableCell>{row.origin || '-'}</TableCell>
                  <TableCell>{row.harvest_year || '-'}</TableCell>
                  <TableCell align="right">{Number(row.physical_mass||0).toFixed(3)}</TableCell>
                  <TableCell align="right">{Number(row.trade_mass||0).toFixed(3)}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => onEdit(row)}><FaEdit /></IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(row)}><FaTrash /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>Brak partii</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BatchDialog open={open} onClose={() => { setOpen(false); setEditing(null); }} onSubmit={submit} initial={editing} grains={grains} />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}



