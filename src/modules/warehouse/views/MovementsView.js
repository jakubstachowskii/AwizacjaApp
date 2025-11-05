import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { FaExchangeAlt } from 'react-icons/fa';

const MovementDialog = ({ open, onClose, onSubmit, initial, warehouses, grains }) => {
  const [v, setV] = useState({ warehouse_id: '', grain_id: '', movement_type: 'przyjecie', quantity: '', unit: 't', document_number: '', notes: '' });
  const isNew = !initial;
  useEffect(() => { setV(initial || { warehouse_id: '', grain_id: '', movement_type: 'przyjecie', quantity: '', unit: 't', document_number: '', notes: '' }); }, [initial, open]);
  // Auto numer dokumentu: WZ (wydanie), PZ (przyjęcie), MM (przesunięcie)
  useEffect(() => {
    let cancelled = false;
    const maybeGen = async () => {
      if (!(open && isNew && !v.document_number)) return;
      let typ = null;
      if (v.movement_type === 'wydanie') typ = 'WZ';
      else if (v.movement_type === 'przyjecie') typ = 'PZ';
      else if (v.movement_type === 'przesuniecie') typ = 'MM';
      if (!typ) return;
      window.electronAPI.generateDocumentNumber(typ)
        .then((num) => { if (!cancelled) setV(x => ({ ...x, document_number: num })); })
        .catch(() => {});
    };
    maybeGen();
    // reaguj też na zmianę typu
  }, [open, isNew, v.movement_type, v.document_number]);
  const h = (f) => (e) => setV(x => ({ ...x, [f]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 12px 30px rgba(2,6,23,0.12)' } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1.5 }}>Ruch magazynowy</DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Box sx={{ p: 3, mb: 2, borderRadius: 2, border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#10b981', fontWeight: 700, borderBottom: '3px solid #10b981', pb: 1, fontSize: '1.05rem' }}>
            Szczegóły ruchu
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>Magazyn</InputLabel><Select value={v.warehouse_id} label="Magazyn" onChange={h('warehouse_id')} size="small">{warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><FormControl fullWidth size="small"><InputLabel>Zboże</InputLabel><Select value={v.grain_id} label="Zboże" onChange={h('grain_id')} size="small">{grains.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={6}><FormControl fullWidth size="small"><InputLabel>Typ ruchu</InputLabel><Select value={v.movement_type} label="Typ ruchu" onChange={h('movement_type')} size="small"><MenuItem value="przyjecie">Przyjęcie</MenuItem><MenuItem value="wydanie">Wydanie</MenuItem><MenuItem value="przesuniecie">Przesunięcie</MenuItem><MenuItem value="korekta">Korekta</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Ilość" type="number" size="small" value={v.quantity} onChange={h('quantity')} /></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth size="small"><InputLabel>Jednostka</InputLabel><Select value={v.unit} label="Jednostka" onChange={h('unit')} size="small"><MenuItem value="t">t</MenuItem><MenuItem value="kg">kg</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Dokument" size="small" value={v.document_number} onChange={h('document_number')} InputProps={{ readOnly: isNew && ['wydanie','przyjecie','przesuniecie'].includes(v.movement_type) }} helperText={isNew && v.movement_type === 'wydanie' ? 'Numer WZ generowany automatycznie' : isNew && v.movement_type === 'przyjecie' ? 'Numer PZ generowany automatycznie' : isNew && v.movement_type === 'przesuniecie' ? 'Numer MM generowany automatycznie' : ''} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Uwagi" multiline rows={2} size="small" value={v.notes} onChange={h('notes')} /></Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={onClose}>Anuluj</Button>
        <Button size="small" variant="contained" onClick={() => onSubmit(v)}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

export default function MovementsView() {
  const [warehouses, setWarehouses] = useState([]);
  const [movements, setMovements] = useState([]);
  const [grains, setGrains] = useState([]);
  const [openMv, setOpenMv] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  const loadAll = useCallback(async () => {
    const [wh, mv, gr] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name'),
      window.electronAPI.dbGetAll('magazyn_movements', 'movement_date'),
      window.electronAPI.dbGetAll('grains', 'name')
    ]);
    setWarehouses(wh || []);
    setMovements(mv || []);
    setGrains(gr || []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const addMovement = async (v) => {
    const payload = { ...v };
    if (!payload.document_number) {
      if (payload.movement_type === 'wydanie') payload.document_number = await window.electronAPI.generateDocumentNumber('WZ');
      else if (payload.movement_type === 'przyjecie') payload.document_number = await window.electronAPI.generateDocumentNumber('PZ');
      else if (payload.movement_type === 'przesuniecie') payload.document_number = await window.electronAPI.generateDocumentNumber('MM');
    }
    await window.electronAPI.dbInsert('magazyn_movements', payload);
    // update stock simplified
    const stocks = await window.electronAPI.dbGetAll('magazyn_stock_levels', 'id');
    const existing = (stocks || []).find(s => s.warehouse_id === Number(v.warehouse_id) && s.grain_id === Number(v.grain_id));
    const delta = (v.movement_type === 'wydanie' ? -1 : 1) * Number(v.quantity || 0);
    if (existing) await window.electronAPI.dbUpdate('magazyn_stock_levels', existing.id, { quantity: Number(existing.quantity || 0) + delta, unit: v.unit || existing.unit || 't' });
    else await window.electronAPI.dbInsert('magazyn_stock_levels', { warehouse_id: Number(v.warehouse_id), grain_id: Number(v.grain_id), quantity: Math.max(0, delta), unit: v.unit || 't' });
    setOpenMv(false); loadAll();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaExchangeAlt style={{ color: '#10b981' }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Ruchy magazynowe</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FaExchangeAlt />} onClick={() => setOpenMv(true)}>Nowy ruch</Button>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}><TextField label="Od" type="date" fullWidth InputLabelProps={{ shrink: true }} value={reportFrom} onChange={(e)=>setReportFrom(e.target.value)} /></Grid>
            <Grid item xs={12} sm={6} md={3}><TextField label="Do" type="date" fullWidth InputLabelProps={{ shrink: true }} value={reportTo} onChange={(e)=>setReportTo(e.target.value)} /></Grid>
            <Grid item xs={12} md={3}><Button onClick={loadAll}>Odśwież</Button></Grid>
          </Grid>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Magazyn</TableCell>
                <TableCell>Zboże</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell align="right">Ilość</TableCell>
                <TableCell>Dokument</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(movements || []).filter(m => {
                if (!reportFrom && !reportTo) return true;
                const d = (m.movement_date || '').slice(0,10);
                if (reportFrom && d < reportFrom) return false;
                if (reportTo && d > reportTo) return false;
                return true;
              }).map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.movement_date?.slice(0,19).replace('T',' ') || ''}</TableCell>
                  <TableCell>{warehouses.find(w => w.id === m.warehouse_id)?.name || m.warehouse_id}</TableCell>
                  <TableCell>{grains.find(g => g.id === m.grain_id)?.name || m.grain_id}</TableCell>
                  <TableCell>{m.movement_type}</TableCell>
                  <TableCell align="right">{Number(m.quantity || 0).toFixed(3)} {m.unit}</TableCell>
                  <TableCell>{m.document_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MovementDialog open={openMv} onClose={() => setOpenMv(false)} onSubmit={addMovement} warehouses={warehouses} grains={grains} />
    </Box>
  );
}



