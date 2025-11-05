import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Chip, IconButton, Toolbar } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { FaPlus, FaExchangeAlt, FaIndustry } from 'react-icons/fa';

const WarehouseDialog = ({ open, onClose, onSubmit, initial }) => {
  const [values, setValues] = useState({ name: '', code: '', type: 'silos', capacity: '', unit: 't', location: '', description: '', is_active: 1 });
  useEffect(() => { setValues(initial || { name: '', code: '', type: 'silos', capacity: '', unit: 't', location: '', description: '', is_active: 1 }); }, [initial, open]);
  const handleChange = (field) => (e) => setValues(v => ({ ...v, [field]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Edytuj magazyn' : 'Nowy magazyn'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}><TextField fullWidth label="Nazwa" value={values.name} onChange={handleChange('name')} /></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Kod" value={values.code} onChange={handleChange('code')} /></Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth><InputLabel>Typ</InputLabel>
              <Select value={values.type} label="Typ" onChange={handleChange('type')}>
                <MenuItem value="silos">Silos</MenuItem>
                <MenuItem value="magazyn">Magazyn</MenuItem>
                <MenuItem value="bunkier">Bunkier</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Pojemność" type="number" value={values.capacity} onChange={handleChange('capacity')} /></Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth><InputLabel>Jednostka</InputLabel>
              <Select value={values.unit} label="Jednostka" onChange={handleChange('unit')}>
                <MenuItem value="t">t</MenuItem>
                <MenuItem value="kg">kg</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}><TextField fullWidth label="Lokalizacja" value={values.location} onChange={handleChange('location')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Opis" multiline rows={2} value={values.description} onChange={handleChange('description')} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={() => onSubmit(values)}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

const MovementDialog = ({ open, onClose, onSubmit, initial, warehouses, grains }) => {
  const [v, setV] = useState({ warehouse_id: '', grain_id: '', movement_type: 'przyjecie', quantity: '', unit: 't', document_number: '', notes: '' });
  useEffect(() => { setV(initial || { warehouse_id: '', grain_id: '', movement_type: 'przyjecie', quantity: '', unit: 't', document_number: '', notes: '' }); }, [initial, open]);
  const h = (f) => (e) => setV(x => ({ ...x, [f]: e.target.value }));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ruch magazynowy</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}><FormControl fullWidth><InputLabel>Magazyn</InputLabel><Select value={v.warehouse_id} label="Magazyn" onChange={h('warehouse_id')}>{warehouses.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12}><FormControl fullWidth><InputLabel>Zboże</InputLabel><Select value={v.grain_id} label="Zboże" onChange={h('grain_id')}>{grains.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={6}><FormControl fullWidth><InputLabel>Typ ruchu</InputLabel><Select value={v.movement_type} label="Typ ruchu" onChange={h('movement_type')}><MenuItem value="przyjecie">Przyjęcie</MenuItem><MenuItem value="wydanie">Wydanie</MenuItem><MenuItem value="przesuniecie">Przesunięcie</MenuItem><MenuItem value="korekta">Korekta</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} md={3}><TextField fullWidth label="Ilość" type="number" value={v.quantity} onChange={h('quantity')} /></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Jednostka</InputLabel><Select value={v.unit} label="Jednostka" onChange={h('unit')}><MenuItem value="t">t</MenuItem><MenuItem value="kg">kg</MenuItem></Select></FormControl></Grid>
          <Grid item xs={12} md={6}><TextField fullWidth label="Dokument" value={v.document_number} onChange={h('document_number')} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Uwagi" multiline rows={2} value={v.notes} onChange={h('notes')} /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={() => onSubmit(v)}>Zapisz</Button>
      </DialogActions>
    </Dialog>
  );
};

const Warehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [movements, setMovements] = useState([]);
  const [grains, setGrains] = useState([]);
  const [openWh, setOpenWh] = useState(false);
  const [editWh, setEditWh] = useState(null);
  const [openMv, setOpenMv] = useState(false);
  const [reportFrom, setReportFrom] = useState('');
  const [reportTo, setReportTo] = useState('');

  const confirmAndDelete = async (table, id) => {
    const ok = window.confirm('Na pewno usunąć?');
    if (!ok) return;
    await window.electronAPI.dbDelete(table, id);
    loadAll();
  };

  const loadAll = useCallback(async () => {
    const [wh, st, mv, gr] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name'),
      window.electronAPI.dbGetAll('magazyn_stock_levels', 'last_updated'),
      window.electronAPI.dbGetAll('magazyn_movements', 'movement_date'),
      window.electronAPI.dbGetAll('grains', 'name')
    ]);
    setWarehouses(wh || []);
    setStocks(st || []);
    setMovements(mv || []);
    setGrains(gr || []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const saveWarehouse = async (v) => {
    if (editWh) await window.electronAPI.dbUpdate('magazyn_warehouses', editWh.id, v);
    else await window.electronAPI.dbInsert('magazyn_warehouses', v);
    setOpenWh(false); setEditWh(null); loadAll();
  };

  const addMovement = async (v) => {
    await window.electronAPI.dbInsert('magazyn_movements', v);
    // Aktualizacja stanu (prosto): odczytaj istniejący record stocku lub wstaw
    const existing = (stocks || []).find(s => s.warehouse_id === Number(v.warehouse_id) && s.grain_id === Number(v.grain_id));
    const delta = (v.movement_type === 'wydanie' ? -1 : 1) * Number(v.quantity || 0);
    if (existing) {
      await window.electronAPI.dbUpdate('magazyn_stock_levels', existing.id, { quantity: Number(existing.quantity || 0) + delta });
    } else {
      await window.electronAPI.dbInsert('magazyn_stock_levels', { warehouse_id: Number(v.warehouse_id), grain_id: Number(v.grain_id), quantity: Math.max(0, delta), unit: v.unit || 't' });
    }
    setOpenMv(false); loadAll();
  };

  const totalByWh = useMemo(() => {
    const map = {};
    for (const s of stocks) {
      const key = s.warehouse_id;
      map[key] = (map[key] || 0) + Number(s.quantity || 0);
    }
    return map;
  }, [stocks]);

  const snapshotAsOf = useCallback((asOfDate) => {
    if (!asOfDate) return null;
    const filtered = (movements || []).filter(m => (m.movement_date || '').slice(0,10) <= asOfDate);
    const agg = {};
    for (const m of filtered) {
      const key = `${m.warehouse_id}:${m.grain_id}`;
      const delta = (m.movement_type === 'wydanie' ? -1 : 1) * Number(m.quantity || 0);
      agg[key] = (agg[key] || 0) + delta;
    }
    return agg;
  }, [movements]);

  const exportCsv = () => {
    const rows = (
      reportTo
        ? Object.entries(snapshotAsOf(reportTo) || {}).map(([key, qty]) => {
            const [wid, gid] = key.split(':').map(Number);
            return { warehouse_id: wid, grain_id: gid, quantity: qty, unit: 't' };
          })
        : (stocks || [])
    );
    const headers = ['warehouse','grain','quantity','unit'];
    const lines = [headers.join(',')];
    for (const r of rows) {
      const wh = warehouses.find(w => w.id === r.warehouse_id)?.name || r.warehouse_id;
      const gr = grains.find(g => g.id === r.grain_id)?.name || r.grain_id;
      lines.push([`"${wh}"`,`"${gr}"`,Number(r.quantity || 0).toFixed(3),r.unit || 't'].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magazyn_stany_${reportTo || 'dzis'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Magazyn</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<FaIndustry />} onClick={() => setOpenWh(true)}>Nowy magazyn</Button>
          <Button variant="outlined" startIcon={<FaExchangeAlt />} onClick={() => setOpenMv(true)}>Ruch magazynowy</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Toolbar disableGutters sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Raport stanów</Typography>
            <TextField size="small" label="Od" type="date" InputLabelProps={{ shrink: true }} value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
            <TextField size="small" label="Do" type="date" InputLabelProps={{ shrink: true }} value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
            <Button variant="outlined" onClick={loadAll}>Odśwież</Button>
            <Button variant="contained" onClick={exportCsv}>Eksport CSV</Button>
          </Toolbar>
          <Typography variant="body2" color="text.secondary">Zakres dat wpływa na listę ruchów (sumy stanów widoczne poniżej po przeliczeniu).</Typography>
        </CardContent>
      </Card>

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
              <Typography variant="h6" sx={{ mb: 1 }}>Stany magazynowe</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Magazyn</TableCell>
                    <TableCell>Zboże</TableCell>
                    <TableCell align="right">Ilość</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(
                    reportTo
                      ? Object.entries(snapshotAsOf(reportTo) || {}).map(([key, qty]) => {
                          const [wid, gid] = key.split(':').map(Number);
                          return { id: key, warehouse_id: wid, grain_id: gid, quantity: qty, unit: 't' };
                        })
                      : (stocks || [])
                  ).map(s => (
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

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>Ruchy magazynowe</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Magazyn</TableCell>
                    <TableCell>Zboże</TableCell>
                    <TableCell>Typ</TableCell>
                    <TableCell align="right">Ilość</TableCell>
                    <TableCell>Dokument</TableCell>
                    <TableCell align="right">Akcje</TableCell>
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
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => confirmAndDelete('magazyn_movements', m.id)}>
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
      </Grid>

      <WarehouseDialog open={openWh} onClose={() => { setOpenWh(false); setEditWh(null); }} onSubmit={saveWarehouse} initial={editWh} />
      <MovementDialog open={openMv} onClose={() => setOpenMv(false)} onSubmit={addMovement} warehouses={warehouses} grains={grains} />
    </Box>
  );
};

export default Warehouse;


