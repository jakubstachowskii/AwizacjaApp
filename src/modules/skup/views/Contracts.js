import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Snackbar, Alert, TablePagination, TableSortLabel, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem } from '@mui/material';
import { FaPlus, FaEdit, FaTrash, FaFileContract } from 'react-icons/fa';

const ContractDialog = ({ open, onClose, onSubmit, initialData, contractors, grains }) => {
  const [values, setValues] = useState({ contractor_id: '', grain_id: '', contract_number: '', valid_from: '', valid_to: '', base_price_per_unit: '', currency: 'PLN', volume_limit: '' });
  useEffect(() => { setValues(initialData || { contractor_id: '', grain_id: '', contract_number: '', valid_from: '', valid_to: '', base_price_per_unit: '', currency: 'PLN', volume_limit: '' }); }, [initialData, open]);
  const handleChange = (e) => { const { name, value } = e.target; setValues(v => ({ ...v, [name]: value })); };
  const submit = () => onSubmit({ contractor_id: Number(values.contractor_id), grain_id: Number(values.grain_id), contract_number: values.contract_number || null, valid_from: values.valid_from, valid_to: values.valid_to || null, base_price_per_unit: Number(values.base_price_per_unit), currency: values.currency || 'PLN', volume_limit: values.volume_limit === '' ? null : Number(values.volume_limit) });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaFileContract color="#7c3aed" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {initialData ? 'Edytuj kontrakt' : 'Nowy kontrakt'}
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
                color: '#7c3aed',
                fontWeight: 700,
                borderBottom: '3px solid #7c3aed',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                📄 Podstawowe informacje kontraktu
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                  <TextField 
                    select 
                    label="Kontrahent kontraktu" 
                    name="contractor_id" 
                    fullWidth 
                    value={values.contractor_id} 
                    onChange={handleChange}
                    required
                  >
                    {contractors.map(c => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
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
                    {grains.map(g => (
                      <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Numer kontraktu" 
                    name="contract_number" 
                    fullWidth 
                    value={values.contract_number} 
                    onChange={handleChange}
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
                color: '#dc2626',
                fontWeight: 700,
                borderBottom: '3px solid #dc2626',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                📅 Okres obowiązywania i warunki finansowe
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                    type="date" 
                    label="Data rozpoczęcia" 
                    name="valid_from" 
                    fullWidth 
                    value={values.valid_from} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                    type="date" 
                    label="Data zakończenia" 
                    name="valid_to" 
                    fullWidth 
                    value={values.valid_to} 
                    onChange={handleChange} 
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                    select 
                    label="Waluta płatności" 
                    name="currency" 
                    fullWidth 
                    value={values.currency} 
                    onChange={handleChange}
                  >
                    <MenuItem value="PLN">PLN</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} lg={8}>
                  <TextField 
                    label="Cena bazowa za tonę" 
                    name="base_price_per_unit" 
                    fullWidth 
                    value={values.base_price_per_unit} 
                    onChange={handleChange}
                    type="number"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <TextField 
                    label="Limit ilościowy [t]" 
                    name="volume_limit" 
                    fullWidth 
                    value={values.volume_limit} 
                    onChange={handleChange}
                    type="number"
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

const Contracts = () => {
  const [rows, setRows] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('valid_from');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [data, cts, grs] = await Promise.all([
        window.electronAPI.dbGetAll('skup_contracts', 'valid_from'),
        window.electronAPI.dbGetAll('skup_contractors', 'name'),
        window.electronAPI.dbGetAll('skup_grains', 'name')
      ]);
      setRows(data.reverse());
      setContractors(cts);
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
      await window.electronAPI.dbDelete('skup_contracts', row.id); 
      await load(); 
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') console.error(e); 
    } 
  };

  const handleSubmit = useCallback(async (payload) => {
    try {
      if (editingRow) await window.electronAPI.dbUpdate('skup_contracts', editingRow.id, payload);
      else await window.electronAPI.dbInsert('skup_contracts', payload);
      setDialogOpen(false);
      await load();
    } catch (e) { 
      if (process.env.NODE_ENV === 'development') console.error(e); 
    }
  }, [editingRow, load]);

  const grainMap = useMemo(() => Object.fromEntries(grains.map(g => [g.id, g.name])), [grains]);
  const contractorMap = useMemo(() => Object.fromEntries(contractors.map(c => [c.id, c.name])), [contractors]);

  const filtered = useMemo(() => rows.filter(r => (contractorMap[r.contractor_id] || '').toLowerCase().includes(filter.toLowerCase()) || (grainMap[r.grain_id] || '').toLowerCase().includes(filter.toLowerCase()) || String(r.contract_number || '').toLowerCase().includes(filter.toLowerCase())), [rows, filter, contractorMap, grainMap]);

  const sorted = useMemo(() => { const d=[...filtered]; d.sort((a,b)=>{let av=a[orderBy]||'';let bv=b[orderBy]||'';return (av<bv?(order==='asc'?-1:1):(av>bv?(order==='asc'?1:-1):0));}); return d; }, [filtered, order, orderBy]);
  const paged = useMemo(() => { const s=page*rowsPerPage; return sorted.slice(s,s+rowsPerPage); }, [sorted,page,rowsPerPage]);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>Kontrakty</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField size="small" placeholder="Szukaj..." value={filter} onChange={(e)=>setFilter(e.target.value)} />
          <Button variant="contained" startIcon={<FaPlus />} onClick={onAdd} disabled={loading}>Dodaj</Button>
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 700, color: '#0f172a', backgroundColor: '#f1f5f9' } }}>
              <TableCell sortDirection={orderBy==='contract_number'?order:false}><TableSortLabel active={orderBy==='contract_number'} direction={orderBy==='contract_number'?order:'asc'} onClick={()=>setOrderBy('contract_number')}>Numer</TableSortLabel></TableCell>
              <TableCell>Kontrahent</TableCell>
              <TableCell>Zboże</TableCell>
              <TableCell sortDirection={orderBy==='valid_from'?order:false}><TableSortLabel active={orderBy==='valid_from'} direction={orderBy==='valid_from'?order:'asc'} onClick={()=>setOrderBy('valid_from')}>Od</TableSortLabel></TableCell>
              <TableCell>Do</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Limit [t]</TableCell>
              <TableCell align="right">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map(r => (
              <TableRow key={r.id} hover sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                <TableCell>{r.contract_number || `#${r.id}`}</TableCell>
                <TableCell>{contractorMap[r.contractor_id] || r.contractor_id}</TableCell>
                <TableCell>{grainMap[r.grain_id] || r.grain_id}</TableCell>
                <TableCell>{r.valid_from}</TableCell>
                <TableCell>{r.valid_to || '-'}</TableCell>
                <TableCell>{r.base_price_per_unit} {r.currency}</TableCell>
                <TableCell>{r.volume_limit || '-'}</TableCell>
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

      <ContractDialog open={dialogOpen} onClose={()=>setDialogOpen(false)} onSubmit={handleSubmit} initialData={editingRow} contractors={contractors} grains={grains} />

      <Snackbar open={snack.open} autoHideDuration={2500} onClose={()=>setSnack(s=>({ ...s, open:false }))}><Alert severity={snack.severity} onClose={()=>setSnack(s=>({ ...s, open:false }))}>{snack.message}</Alert></Snackbar>
    </Box>
  );
};

export default Contracts;

