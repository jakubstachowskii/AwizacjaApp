import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  TextField, 
  Snackbar, 
  Alert, 
  TablePagination, 
  TableSortLabel, 
  TableContainer, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Grid, 
  MenuItem,
  Chip
} from '@mui/material';
import { FaPlus, FaEdit, FaTrash, FaTruck, FaShippingFast } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

const DeliveryDialog = ({ open, onClose, onSubmit, initialData, contractors, grains, warehouses }) => {
  const [values, setValues] = useState({ 
    contractor_id: '', 
    grain_id: '', 
    quantity: '', 
    unit: 'ton', 
    delivery_date: '', 
    plate_number: '', 
    driver_name: '', 
    notes: '',
    warehouse_id: ''
  });
  
  useEffect(() => { 
    setValues(initialData || { 
      contractor_id: '', 
      grain_id: '', 
      quantity: '', 
      unit: 'ton', 
      delivery_date: '', 
      plate_number: '', 
      driver_name: '', 
      notes: '',
      warehouse_id: ''
    }); 
  }, [initialData, open]);
  
  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setValues(v => ({ ...v, [name]: value })); 
  };
  
  const submit = () => onSubmit({
    ...values,
    contractor_id: Number(values.contractor_id),
    grain_id: Number(values.grain_id),
    quantity: Number(values.quantity)
  });
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaShippingFast color="#059669" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {initialData ? 'Edytuj dostawę' : 'Nowa dostawa'}
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
                color: '#059669',
                fontWeight: 700,
                borderBottom: '3px solid #059669',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                📦 Podstawowe informacje o dostawie
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} lg={8}>
                  <TextField 
                    select 
                    label="Kontrahent dostawy" 
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
                <Grid item xs={12} sm={4} md={3}>
                  <TextField 
                    label="Ilość dostawy" 
                    name="quantity" 
                    type="number"
                    fullWidth 
                    value={values.quantity} 
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField 
                    select 
                    label="Jednostka miary" 
                    name="unit" 
                    fullWidth 
                    value={values.unit} 
                    onChange={handleChange}
                  >
                    <MenuItem value="ton">Tona</MenuItem>
                    <MenuItem value="kg">Kilogram</MenuItem>
                    <MenuItem value="quintal">Kwintal</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4} md={6}>
                  <TextField 
                    type="date" 
                    label="Data dostawy" 
                    name="delivery_date" 
                    fullWidth 
                    value={values.delivery_date} 
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <TextField 
                  select 
                  label="Magazyn" 
                  name="warehouse_id" 
                  fullWidth 
                  value={values.warehouse_id} 
                  onChange={handleChange}
                >
                  <MenuItem value="">(Wybierz magazyn)</MenuItem>
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                  ))}
                </TextField>
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
                color: '#0891b2',
                fontWeight: 700,
                borderBottom: '3px solid #0891b2',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                🚚 Informacje transportowe
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} lg={8}>
                  <TextField 
                    label="Numer rejestracyjny pojazdu" 
                    name="plate_number" 
                    fullWidth 
                    value={values.plate_number} 
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} lg={4}>
                  <TextField 
                    label="Imię i nazwisko kierowcy" 
                    name="driver_name" 
                    fullWidth 
                    value={values.driver_name} 
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    label="Dodatkowe notatki o dostawie" 
                    name="notes" 
                    multiline
                    rows={3}
                    fullWidth 
                    value={values.notes} 
                    onChange={handleChange}
                    sx={{ 
                      '& .MuiInputLabel-root': { 
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        overflow: 'visible'
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Anuluj</Button>
        <Button variant="contained" onClick={submit}>
          {initialData ? 'Zapisz' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Deliveries = () => {
  const [rows, setRows] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('delivery_date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [warehouses, setWarehouses] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [data, cts, grs, whs] = await Promise.all([
        window.electronAPI.dbGetAll('skup_deliveries'),
        window.electronAPI.dbGetAll('skup_contractors'),
        window.electronAPI.dbGetAll('skup_grains'),
        window.electronAPI.dbGetAll('magazyn_warehouses', 'name')
      ]);
      setRows(data || []);
      setContractors(cts || []);
      setGrains(grs || []);
      setWarehouses(whs || []);
    } catch (error) {
      console.error('Błąd ładowania dostaw:', error);
      setSnack({ open: true, message: 'Błąd ładowania dostaw', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(row => 
      row.plate_number?.toLowerCase().includes(filter.toLowerCase()) ||
      row.driver_name?.toLowerCase().includes(filter.toLowerCase()) ||
      contractors.find(c => c.id === row.contractor_id)?.name?.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[orderBy] || '';
      const bVal = b[orderBy] || '';
      if (order === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [rows, filter, orderBy, order, contractors]);

  const handleSubmit = async (data) => {
    try {
      if (editingRow) {
        await window.electronAPI.dbUpdate('skup_deliveries', editingRow.id, data);
        setSnack({ open: true, message: 'Dostawa zaktualizowana', severity: 'success' });
      } else {
        await window.electronAPI.dbInsert('skup_deliveries', data);
        setSnack({ open: true, message: 'Dostawa dodana', severity: 'success' });
      }

      // Automatyczny ruch magazynowy (wydanie) z walidacją stanu
      if (data.warehouse_id && data.grain_id && Number(data.quantity) > 0) {
        const magazynGrainId = await window.electronAPI.resolveMagazynGrainId(Number(data.grain_id));
        if (!magazynGrainId) {
          setSnack({ open: true, message: 'Nie udało się zmapować zboża do magazynu', severity: 'error' });
        } else {
        const stocks = await window.electronAPI.dbGetAll('magazyn_stock_levels', 'id');
        const existing = (stocks || []).find(s => s.warehouse_id === Number(data.warehouse_id) && s.grain_id === Number(magazynGrainId));
        const available = Number(existing?.quantity || 0);
        if (available < Number(data.quantity)) {
          setSnack({ open: true, message: 'Brak wystarczającego stanu magazynowego', severity: 'error' });
        } else {
          await window.electronAPI.dbInsert('magazyn_movements', {
            warehouse_id: Number(data.warehouse_id),
            grain_id: Number(magazynGrainId),
            movement_type: 'wydanie',
            quantity: Number(data.quantity),
            unit: data.unit === 'kg' ? 'kg' : 't',
            reference_type: 'skup_delivery',
            reference_id: editingRow?.id || null,
            document_number: null,
            notes: 'Automatyczne wydanie z dostawy'
          });
          await window.electronAPI.dbUpdate('magazyn_stock_levels', existing.id, { quantity: available - Number(data.quantity) });
        }
        }
      }

      setDialogOpen(false);
      setEditingRow(null);
      load();
    } catch (error) {
      console.error('Błąd zapisywania dostawy:', error);
      setSnack({ open: true, message: 'Błąd zapisu', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await window.electronAPI.dbDelete('skup_deliveries', idToDelete);
      setSnack({ open: true, message: 'Dostawa usunięta', severity: 'success' });
      load();
    } catch (error) {
      console.error('Błąd usuwania dostawy:', error);
      setSnack({ open: true, message: 'Błąd usuwania dostawy', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setIdToDelete(null);
    }
  };

  const getContractorName = (contractorId) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor ? contractor.name : 'Nieznany';
  };

  const getGrainName = (grainId) => {
    const grain = grains.find(g => g.id === grainId);
    return grain ? grain.name : 'Nieznane';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FaTruck />
          Dostawy
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => setDialogOpen(true)}
        >
          Dodaj dostawę
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Szukaj dostaw..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ width: 300 }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'delivery_date'}
                  direction={orderBy === 'delivery_date' ? order : 'asc'}
                  onClick={() => handleSort('delivery_date')}
                >
                  Data dostawy
                </TableSortLabel>
              </TableCell>
              <TableCell>Kontrahent</TableCell>
              <TableCell>Zboże</TableCell>
              <TableCell>Ilość</TableCell>
              <TableCell>Numer rejestracyjny</TableCell>
              <TableCell>Kierowca</TableCell>
              <TableCell align="center">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.delivery_date ? new Date(row.delivery_date).toLocaleDateString('pl-PL') : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getContractorName(row.contractor_id)} 
                      size="small" 
                      color="primary" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getGrainName(row.grain_id)} 
                      size="small" 
                      color="secondary" 
                    />
                  </TableCell>
                  <TableCell>
                    {row.quantity} {row.unit}
                  </TableCell>
                  <TableCell>{row.plate_number || '-'}</TableCell>
                  <TableCell>{row.driver_name || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingRow(row);
                        setDialogOpen(true);
                      }}
                    >
                      <FaEdit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(row.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <FaTrash />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <DeliveryDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingRow(null); }}
        onSubmit={handleSubmit}
        initialData={editingRow}
        contractors={contractors}
        grains={grains}
        warehouses={warehouses}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setIdToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń dostawę"
        message="Czy na pewno chcesz usunąć tę dostawę?"
        confirmText="Usuń"
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Deliveries;
