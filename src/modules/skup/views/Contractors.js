import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, TextField, Snackbar, Alert, TablePagination, TableSortLabel, TableContainer, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Grid, MenuItem } from '@mui/material';
import { FaPlus, FaEdit, FaTrash, FaUser } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

const ContractorDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [values, setValues] = useState({ 
    name: '', 
    type: 'rolnik', 
    nip: '',
    contact_person: '', 
    phone: '', 
    email: '', 
    address: '', 
    notes: '' 
  });
  
  useEffect(() => { 
    setValues(initialData || { 
      name: '', 
      type: 'rolnik', 
      nip: '',
      contact_person: '', 
      phone: '', 
      email: '', 
      address: '', 
      notes: '' 
    }); 
  }, [initialData, open]);
  
  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setValues(v => ({ ...v, [name]: value })); 
  };
  
  const submit = () => onSubmit(values);
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaUser color="#0891b2" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {initialData ? 'Edytuj kontrahenta' : 'Nowy kontrahent'}
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
                color: '#0891b2',
                fontWeight: 700,
                borderBottom: '3px solid #0891b2',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                👤 Podstawowe informacje
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Nazwa kontrahenta" 
                    name="name" 
                    fullWidth 
                    value={values.name} 
                    onChange={handleChange} 
                    required
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
                <Grid item xs={12} sm={6}>
                  <TextField 
                    select 
                    label="Typ kontrahenta" 
                    name="type" 
                    fullWidth 
                    value={values.type} 
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
                  >
                    <MenuItem value="rolnik">Rolnik / Sprzedający</MenuItem>
                    <MenuItem value="firma">Firma / Kupujący</MenuItem>
                    <MenuItem value="transport">Przewoźnik</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="NIP" 
                    name="nip" 
                    fullWidth 
                    value={values.nip} 
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
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Osoba kontaktowa" 
                    name="contact_person" 
                    fullWidth 
                    value={values.contact_person} 
                    onChange={handleChange} 
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Numer telefonu" 
                    name="phone" 
                    fullWidth 
                    value={values.phone} 
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
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Adres email" 
                    name="email" 
                    type="email"
                    fullWidth 
                    value={values.email} 
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
                <Grid item xs={12} sm={6}>
                  <TextField 
                    label="Adres siedziby" 
                    name="address" 
                    fullWidth 
                    value={values.address} 
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
                <Grid item xs={12}>
                  <TextField 
                    label="Dodatkowe notatki" 
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

const Contractors = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [filter, setFilter] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.dbGetAll('skup_contractors');
      setRows(data || []);
    } catch (error) {
      console.error('Błąd ładowania kontrahentów:', error);
      setSnack({ open: true, message: 'Błąd ładowania kontrahentów', severity: 'error' });
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
      row.name?.toLowerCase().includes(filter.toLowerCase()) ||
      row.type?.toLowerCase().includes(filter.toLowerCase()) ||
      row.contact_person?.toLowerCase().includes(filter.toLowerCase())
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
  }, [rows, filter, orderBy, order]);

  const handleSubmit = async (data) => {
    try {
      if (editingRow) {
        await window.electronAPI.dbUpdate('skup_contractors', editingRow.id, data);
        setSnack({ open: true, message: 'Kontrahent zaktualizowany', severity: 'success' });
      } else {
        await window.electronAPI.dbInsert('skup_contractors', data);
        setSnack({ open: true, message: 'Kontrahent dodany', severity: 'success' });
      }
      setDialogOpen(false);
      setEditingRow(null);
      load();
    } catch (error) {
      console.error('Błąd zapisywania kontrahenta:', error);
      setSnack({ open: true, message: 'Błąd zapisywania kontrahenta', severity: 'error' });
    }
  };

  const handleDelete = (id) => {
    setIdToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await window.electronAPI.dbDelete('skup_contractors', idToDelete);
      setSnack({ open: true, message: 'Kontrahent usunięty', severity: 'success' });
      load();
    } catch (error) {
      console.error('Błąd usuwania kontrahenta:', error);
      setSnack({ open: true, message: 'Błąd usuwania kontrahenta', severity: 'error' });
    } finally {
      setConfirmOpen(false);
      setIdToDelete(null);
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      buyer: 'Kupujący',
      seller: 'Sprzedający',
      transporter: 'Przewoźnik',
      other: 'Inny'
    };
    return types[type] || type;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Kontrahenci Skup
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => setDialogOpen(true)}
        >
          Dodaj kontrahenta
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="Szukaj kontrahentów..."
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
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Nazwa
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleSort('type')}
                >
                  Typ
                </TableSortLabel>
              </TableCell>
              <TableCell>Osoba kontaktowa</TableCell>
              <TableCell>Telefon</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{getTypeLabel(row.type)}</TableCell>
                  <TableCell>{row.contact_person || '-'}</TableCell>
                  <TableCell>{row.phone || '-'}</TableCell>
                  <TableCell>{row.email || '-'}</TableCell>
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

      <ContractorDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingRow}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setIdToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń kontrahenta"
        message="Czy na pewno chcesz usunąć tego kontrahenta?"
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

export default Contractors;
