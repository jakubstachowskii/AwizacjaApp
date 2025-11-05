import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Snackbar, Alert, TablePagination, TableSortLabel, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem } from '@mui/material';
import { FaPlus, FaEdit, FaTrash, FaCalculator } from 'react-icons/fa';

const RuleDialog = ({ open, onClose, onSubmit, initialData, grains }) => {
  const [values, setValues] = useState({ grain_id: '', param: 'moisture', min_value: '', max_value: '', deduction_type: 'percent', deduction_value: '' });
  useEffect(()=>{ setValues(initialData || { grain_id: '', param: 'moisture', min_value: '', max_value: '', deduction_type: 'percent', deduction_value: '' }); },[initialData, open]);
  const handleChange = (e)=>{ const {name,value}=e.target; setValues(v=>({ ...v, [name]: value })); };
  const submit = ()=> onSubmit({ grain_id: Number(values.grain_id), param: values.param, min_value: values.min_value === '' ? null : Number(values.min_value), max_value: values.max_value === '' ? null : Number(values.max_value), deduction_type: values.deduction_type, deduction_value: Number(values.deduction_value) });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaCalculator color="#dc2626" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {initialData ? 'Edytuj regułę potrąceń' : 'Nowa reguła potrąceń'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ 
        maxHeight: '80vh', 
        overflow: 'auto',
        px: { xs: 1, sm: 3 },
        py: { xs: 2, sm: 3 }
      }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2, 
              border: '2px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: '#dc2626',
                fontWeight: 700,
                borderBottom: '3px solid #dc2626',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                🌾 Parametry zboża i jakości
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={4}>
                  <TextField 
                    select 
                    label="Rodzaj zboża" 
                    name="grain_id" 
                    fullWidth 
                    value={values.grain_id} 
                    onChange={handleChange}
                    required
                  >
                    {grains.map(g=> (
                      <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} lg={8}>
                  <TextField 
                    select 
                    label="Parametr jakościowy" 
                    name="param" 
                    fullWidth 
                    value={values.param} 
                    onChange={handleChange}
                  >
                    <MenuItem value="moisture">Wilgotność</MenuItem>
                    <MenuItem value="impurities">Zanieczyszczenia</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <TextField 
                    label="Wartość minimalna" 
                    name="min_value" 
                    fullWidth 
                    value={values.min_value} 
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={6}>
                  <TextField 
                    label="Wartość maksymalna" 
                    name="max_value" 
                    fullWidth 
                    value={values.max_value} 
                    onChange={handleChange}
                    type="number"
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2, 
              border: '2px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                color: '#059669',
                fontWeight: 700,
                borderBottom: '3px solid #059669',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                💰 Reguły potrąceń finansowych
              </Typography>

        <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={8}>
                  <TextField 
                    select 
                    label="Rodzaj potrącenia" 
                    name="deduction_type" 
                    fullWidth 
                    value={values.deduction_type} 
                    onChange={handleChange}
                  >
                    <MenuItem value="percent">Procent</MenuItem>
                    <MenuItem value="absolute">Kwota stała</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <TextField 
                    label="Wartość potrącenia" 
                    name="deduction_value" 
                    fullWidth 
                    value={values.deduction_value} 
                    onChange={handleChange}
                    type="number"
                    required
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={submit}>{initialData ? 'Zapisz' : 'Dodaj'}</Button>
      </DialogActions>
    </Dialog>
  );
};

const QualityRules = () => {
  const [rows, setRows] = useState([]);
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('grain_id');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [data, grs] = await Promise.all([
        window.electronAPI.dbGetAll('skup_quality_rules', 'id'),
        window.electronAPI.dbGetAll('skup_grains', 'name')
      ]);
      setRows(data);
      setGrains(grs);
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') console.error(e); 
      setSnack({ open: true, message: 'Błąd ładowania', severity: 'error' }); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onAdd = () => { setEditingRow(null); setDialogOpen(true); };
  const onEdit = (row) => { setEditingRow(row); setDialogOpen(true); };
  const onDelete = async (row) => { 
    try { 
      await window.electronAPI.dbDelete('skup_quality_rules', row.id); 
      await load(); 
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') console.error(e); 
    } 
  };

  const handleSubmit = useCallback(async (payload) => {
    try {
      if (editingRow) await window.electronAPI.dbUpdate('skup_quality_rules', editingRow.id, payload);
      else await window.electronAPI.dbInsert('skup_quality_rules', payload);
      setDialogOpen(false);
      await load();
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') console.error(e); 
    }
  }, [editingRow, load]);

  const grainMap = useMemo(() => Object.fromEntries(grains.map(g => [g.id, g.name])), [grains]);
  const filtered = useMemo(() => rows.filter(r => (grainMap[r.grain_id] || '').toLowerCase().includes(filter.toLowerCase()) || (r.param || '').toLowerCase().includes(filter.toLowerCase())), [rows, filter, grainMap]);
  const sorted = useMemo(() => { const d=[...filtered]; d.sort((a,b)=>{let av=a[orderBy]||'';let bv=b[orderBy]||'';return (av<bv?(order==='asc'?-1:1):(av>bv?(order==='asc'?1:-1):0));}); return d; }, [filtered, order, orderBy]);
  const paged = useMemo(() => { const s=page*rowsPerPage; return sorted.slice(s,s+rowsPerPage); }, [sorted,page,rowsPerPage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Reguły potrąceń</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Szukaj..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <Button variant="contained" startIcon={<FaPlus />} onClick={onAdd} disabled={loading}>Dodaj</Button>
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 700, md: 'auto' }
          }
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9' } }}>
              <TableCell sx={{ minWidth: 120 }}>Zboże</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Parametr</TableCell>
              <TableCell sx={{ minWidth: 80, display: { xs: 'none', sm: 'table-cell' } }}>Min</TableCell>
              <TableCell sx={{ minWidth: 80, display: { xs: 'none', sm: 'table-cell' } }}>Max</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Rodzaj</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Wartość</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                <TableCell sx={{ 
                  maxWidth: 120, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {grainMap[r.grain_id] || r.grain_id}
                </TableCell>
                <TableCell sx={{ 
                  maxWidth: 100, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {r.param}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {r.min_value ?? '-'}
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {r.max_value ?? '-'}
                </TableCell>
                <TableCell sx={{ 
                  maxWidth: 100, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {r.deduction_type}
                </TableCell>
                <TableCell sx={{ 
                  maxWidth: 100, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}>
                  {r.deduction_value}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={()=>onEdit(r)}><FaEdit/></IconButton>
                  <IconButton size="small" onClick={()=>onDelete(r)} sx={{ ml: 1 }}><FaTrash/></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination component="div" count={sorted.length} page={page} onPageChange={(e,np)=>setPage(np)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e)=>{setRowsPerPage(parseInt(e.target.value,10));setPage(0);}} />

      <RuleDialog open={dialogOpen} onClose={()=>setDialogOpen(false)} onSubmit={handleSubmit} initialData={editingRow} grains={grains} />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={()=>setSnack(s=>({ ...s, open:false }))}><Alert severity={snack.severity} onClose={()=>setSnack(s=>({ ...s, open:false }))}>{snack.message}</Alert></Snackbar>
    </Box>
  );
};

export default QualityRules;

