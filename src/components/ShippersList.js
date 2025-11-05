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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSearch,
  FaUser,
  FaTruck
} from 'react-icons/fa';
import { AppContext } from '../App';
import { validateContractor } from '../utils/validation';

const ShippersList = () => {
  const { shippers, loading, addShipper, updateShipper, deleteShipper } = useContext(AppContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    address: '',
    phone: '',
    email: '',
    type: 'firma'
  });

  // Filtrowanie danych na podstawie wyszukiwania
  const filteredShippers = useMemo(() => {
    if (!searchTerm) return shippers;
    return shippers.filter(shipper => 
      shipper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipper.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [shippers, searchTerm]);

  // Paginacja
  const paginatedShippers = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredShippers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredShippers, page, rowsPerPage]);

  const handleOpenDialog = (shipper = null) => {
    if (shipper) {
      setEditingShipper(shipper);
      setFormData({
        name: shipper.name,
        nip: shipper.nip || '',
        address: shipper.address || '',
        phone: shipper.phone || '',
        email: shipper.email || '',
        type: shipper.type || 'firma'
      });
    } else {
      setEditingShipper(null);
      setFormData({
        name: '',
        nip: '',
        address: '',
        phone: '',
        email: '',
        type: 'firma'
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingShipper(null);
    setFormData({
      name: '',
      nip: '',
      address: '',
      phone: '',
      email: '',
      type: 'firma'
    });
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    try {
      // Walidacja formularza
      const validation = validateContractor(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        alert('Proszę poprawić błędy w formularzu');
        return;
      }

      if (editingShipper) {
        await updateShipper(editingShipper.id, formData);
        alert('Nadawca został zaktualizowany');
      } else {
        await addShipper(formData);
        alert('Nadawca został dodany');
      }
      
      handleCloseDialog();
    } catch (error) {
      alert('Wystąpił błąd podczas zapisywania nadawcy');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteShipper(id);
      alert('Nadawca został usunięty');
    } catch (error) {
      alert('Wystąpił błąd podczas usuwania nadawcy');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'rolnik': return 'success';
      case 'firma': return 'primary';
      case 'transport': return 'warning';
      default: return 'default';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'rolnik': return 'Rolnik';
      case 'firma': return 'Firma';
      case 'transport': return 'Transport';
      default: return 'Nieznany';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Ładowanie nadawców...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Lista nadawców
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj nadawcę
        </Button>
      </Box>

      {/* Filtry */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Szukaj po nazwie, NIP, telefonie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredShippers.length} wyników
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista nadawców */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa</TableCell>
                <TableCell>NIP</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShippers.map((shipper) => (
                <TableRow key={shipper.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        width: 32,
                        height: 32
                      }}>
                        <FaTruck />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {shipper.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {shipper.nip || '-'}
                  </TableCell>
                  <TableCell>
                    {shipper.phone || '-'}
                  </TableCell>
                  <TableCell>
                    {shipper.email || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getTypeText(shipper.type)}
                      color={getTypeColor(shipper.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(shipper)}
                        color="primary"
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(shipper.id)}
                        color="error"
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
          component="div"
          count={filteredShippers.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Wierszy na stronę:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
        />
      </Card>

      {/* Dialog formularza */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingShipper ? 'Edytuj nadawcę' : 'Dodaj nowego nadawcę'}
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
          <Grid container spacing={3}>
            {/* Sekcja 1: Podstawowe informacje */}
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
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  📦 Podstawowe informacje
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nazwa"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={4}>
                    <FormControl fullWidth error={!!formErrors.type}>
                      <InputLabel>Typ nadawcy</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        label="Typ nadawcy"
                      >
                        <MenuItem value="rolnik">Rolnik</MenuItem>
                        <MenuItem value="firma">Firma</MenuItem>
                        <MenuItem value="transport">Transport</MenuItem>
                      </Select>
                      {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Sekcja 2: Dane kontaktowe */}
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
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  📞 Dane kontaktowe
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Sekcja 3: Dane adresowe i prawne */}
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
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  🏢 Dane adresowe i prawne
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="NIP"
                      value={formData.nip}
                      onChange={(e) => handleFormChange('nip', e.target.value)}
                      error={!!formErrors.nip}
                      helperText={formErrors.nip}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adres"
                      multiline
                      rows={3}
                      value={formData.address}
                      onChange={(e) => handleFormChange('address', e.target.value)}
                      error={!!formErrors.address}
                      helperText={formErrors.address}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingShipper ? 'Zapisz zmiany' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShippersList; 