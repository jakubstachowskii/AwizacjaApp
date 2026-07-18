import React, { useState, useContext, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormHelperText,
  MenuItem
} from '@mui/material';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaUser
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';
import ConfirmDialog from './ConfirmDialog';

const ContractorsList = () => {
  const { contractors, loading, addContractor, updateContractor, deleteContractor } = useContext(AppContext);
  const { showSuccess, showError } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'buyer',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const contractorTypes = [
    { value: 'buyer', label: 'Kupujący' },
    { value: 'seller', label: 'Sprzedający' },
    { value: 'transporter', label: 'Przewoźnik' },
    { value: 'other', label: 'Inny' }
  ];

  // Filtrowanie kontrahentów
  const filteredContractors = useMemo(() => {
    if (!contractors) return [];
    return contractors.filter(contractor =>
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contractor.contact_person && contractor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contractors, searchTerm]);

  // Paginacja
  const paginatedContractors = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredContractors.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredContractors, page, rowsPerPage]);

  const handleChangePage = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [formErrors]);

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Nazwa kontrahenta jest wymagana';
    }
    
    if (!formData.type) {
      errors.type = 'Typ kontrahenta jest wymagany';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Nieprawidłowy format email';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingContractor) {
        await updateContractor(editingContractor.id, formData);
        showSuccess('Kontrahent został zaktualizowany');
      } else {
        await addContractor(formData);
        showSuccess('Kontrahent został dodany');
      }
      
      setOpenDialog(false);
      setEditingContractor(null);
      setFormData({
        name: '',
        type: 'buyer',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        notes: ''
      });
      setFormErrors({});
    } catch (error) {
      showError('Błąd podczas zapisywania kontrahenta');
    }
  }, [editingContractor, formData, validateForm, updateContractor, addContractor, showSuccess, showError]);

  const handleEdit = useCallback((contractor) => {
    setEditingContractor(contractor);
    setFormData({
      name: contractor.name || '',
      type: contractor.type || 'buyer',
      contact_person: contractor.contact_person || '',
      phone: contractor.phone || '',
      email: contractor.email || '',
      address: contractor.address || '',
      notes: contractor.notes || ''
    });
    setFormErrors({});
    setOpenDialog(true);
  }, []);

  const handleDelete = useCallback((contractor) => {
    setContractorToDelete(contractor);
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!contractorToDelete) return;
    try {
      await deleteContractor(contractorToDelete.id);
      showSuccess('Kontrahent został usunięty');
    } catch (error) {
      showError('Błąd podczas usuwania kontrahenta');
    } finally {
      setConfirmOpen(false);
      setContractorToDelete(null);
    }
  }, [contractorToDelete, deleteContractor, showSuccess, showError]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingContractor(null);
    setFormData({
      name: '',
      type: 'buyer',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
    setFormErrors({});
  }, []);

  const getTypeColor = (type) => {
    const colors = {
      buyer: '#10b981',
      seller: '#f59e0b',
      transporter: '#3b82f6',
      other: '#6b7280'
    };
    return colors[type] || '#6b7280';
  };

  const getTypeLabel = (type) => {
    const typeObj = contractorTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography>Ładowanie kontrahentów...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Kontrahenci
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            }
          }}
        >
          Dodaj kontrahenta
        </Button>
      </Box>

      {/* Wyszukiwanie */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FaSearch style={{ color: '#64748b' }} />
            <TextField
              fullWidth
              placeholder="Szukaj kontrahentów..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Tabela kontrahentów */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Osoba kontaktowa</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedContractors.map((contractor) => (
                <TableRow key={contractor.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: getTypeColor(contractor.type) }}>
                        <FaUsers />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {contractor.name}
                        </Typography>
                        {contractor.address && (
                          <Typography variant="caption" color="text.secondary">
                            {contractor.address}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(contractor.type)}
                      size="small"
                      sx={{
                        bgcolor: getTypeColor(contractor.type),
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {contractor.contact_person || '-'}
                  </TableCell>
                  <TableCell>
                    {contractor.phone || '-'}
                  </TableCell>
                  <TableCell>
                    {contractor.email || '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(contractor)}
                        sx={{ color: '#2563eb' }}
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(contractor)}
                        sx={{ color: '#ef4444' }}
                      >
                        <FaTrash />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredContractors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Dialog dodawania/edycji */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
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
              {editingContractor ? 'Edytuj kontrahenta' : 'Dodaj nowego kontrahenta'}
            </Typography>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
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
                        fullWidth
                        label="Nazwa kontrahenta"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        error={!!formErrors.name}
                        helperText={formErrors.name}
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
                        fullWidth
                        select
                        label="Typ kontrahenta"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        error={!!formErrors.type}
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
                      >
                        {contractorTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      {formErrors.type && <FormHelperText error>{formErrors.type}</FormHelperText>}
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
                    📞 Dane kontaktowe
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Osoba kontaktowa"
                        value={formData.contact_person}
                        onChange={(e) => handleInputChange('contact_person', e.target.value)}
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
                        fullWidth
                        label="Numer telefonu"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
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
                        fullWidth
                        label="Adres email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
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
                        fullWidth
                        label="Adres siedziby"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
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
                        fullWidth
                        label="Dodatkowe notatki"
                        multiline
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
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
            <Button onClick={handleCloseDialog}>
              Anuluj
            </Button>
            <Button type="submit" variant="contained">
              {editingContractor ? 'Zaktualizuj' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setContractorToDelete(null); }}
        onConfirm={confirmDelete}
        title="Usuń kontrahenta"
        message={contractorToDelete ? `Czy na pewno chcesz usunąć kontrahenta "${contractorToDelete.name}"?` : ''}
        confirmText="Usuń"
      />
    </Box>
  );
};

export default ContractorsList;
