import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

export default function ReportsView() {
  const [reportTo, setReportTo] = useState('');
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [grains, setGrains] = useState([]);

  const loadAll = useCallback(async () => {
    const [mv, wh, gr] = await Promise.all([
      window.electronAPI.dbGetAll('magazyn_movements', 'movement_date'),
      window.electronAPI.dbGetAll('magazyn_warehouses', 'name'),
      window.electronAPI.dbGetAll('grains', 'name')
    ]);
    setMovements(mv || []);
    setWarehouses(wh || []);
    setGrains(gr || []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const snapshot = useMemo(() => {
    if (!reportTo) return {};
    const filtered = (movements || []).filter(m => (m.movement_date || '').slice(0,10) <= reportTo);
    const agg = {};
    for (const m of filtered) {
      const key = `${m.warehouse_id}:${m.grain_id}`;
      const delta = (m.movement_type === 'wydanie' ? -1 : 1) * Number(m.quantity || 0);
      agg[key] = (agg[key] || 0) + delta;
    }
    return agg;
  }, [movements, reportTo]);

  const exportCsv = () => {
    const rows = Object.entries(snapshot).map(([key, qty]) => {
      const [wid, gid] = key.split(':').map(Number);
      return { warehouse_id: wid, grain_id: gid, quantity: qty, unit: 't' };
    });
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
    a.download = `raport_stan_na_${reportTo || 'dzis'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Card sx={{ mb: 2, border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Stan na dzień" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={reportTo} onChange={(e)=>setReportTo(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button size="small" variant="outlined" onClick={loadAll}>Odśwież</Button>
            </Grid>
            <Grid item xs={12} sm="auto">
              <Button size="small" variant="contained" onClick={exportCsv} disabled={!reportTo}>Eksport CSV</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {reportTo && (
        <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Snapshot stanów na {reportTo}</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Magazyn</TableCell>
                  <TableCell>Zboże</TableCell>
                  <TableCell align="right">Ilość</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(snapshot).map(([key, qty]) => {
                  const [wid, gid] = key.split(':').map(Number);
                  const wh = warehouses.find(w => w.id === wid)?.name || wid;
                  const gr = grains.find(g => g.id === gid)?.name || gid;
                  return (
                    <TableRow key={key}>
                      <TableCell>{wh}</TableCell>
                      <TableCell>{gr}</TableCell>
                      <TableCell align="right">{Number(qty || 0).toFixed(3)} t</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}



