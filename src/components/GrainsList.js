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
  FaSeedling,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';
import { validateGrain } from '../utils/validation';

const GrainsList = () => {
  const { grains, loading, addGrain, updateGrain, deleteGrain } = useContext(AppContext);
  const { showSuccess, showError } = useNotification();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrain, setEditingGrain] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    unit: 't'
  });

  // Filtrowanie danych na podstawie wyszukiwania
  const filteredGrains = useMemo(() => {
    if (!searchTerm) return grains;
    return grains.filter(grain => 
      grain.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grain.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [grains, searchTerm]);

  // Paginacja
  const paginatedGrains = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredGrains.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredGrains, page, rowsPerPage]);

  const handleOpenDialog = (grain = null) => {
    if (grain) {
      setEditingGrain(grain);
      setFormData({
        name: grain.name,
        unit: grain.unit
      });
    } else {
      setEditingGrain(null);
      setFormData({
        name: '',
        unit: 't'
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGrain(null);
    setFormData({
      name: '',
      unit: 't'
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
      const validation = validateGrain(formData);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        showError('Proszę poprawić błędy w formularzu');
        return;
      }

      if (editingGrain) {
        await updateGrain(editingGrain.id, formData);
        showSuccess('Zboże zostało zaktualizowane');
      } else {
        await addGrain(formData);
        showSuccess('Zboże zostało dodane');
      }
      
      handleCloseDialog();
    } catch (error) {
      showError('Wystąpił błąd podczas zapisywania zboża');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGrain(id);
      showSuccess('Zboże zostało usunięte');
    } catch (error) {
      showError('Wystąpił błąd podczas usuwania zboża');
    }
  };

  const getUnitColor = (unit) => {
    switch (unit) {
      case 't': return 'primary';
      case 'kg': return 'success';
      case 'g': return 'warning';
      default: return 'default';
    }
  };

  const getUnitText = (unit) => {
    switch (unit) {
      case 't': return 'Tony';
      case 'kg': return 'Kilogramy';
      case 'g': return 'Gramy';
      default: return 'Nieznane';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Ładowanie zbóż...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Lista zbóż
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj zboże
        </Button>
      </Box>

      {/* Filtry */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Szukaj po nazwie zboża..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                {filteredGrains.length} wyników
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista zbóż */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nazwa zboża</TableCell>
                <TableCell>Jednostka</TableCell>
                <TableCell>Data utworzenia</TableCell>
                <TableCell>Akcje</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedGrains.map((grain) => (
                <TableRow key={grain.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        width: 32,
                        height: 32
                      }}>
                        <FaSeedling />
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {grain.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getUnitText(grain.unit)}
                      color={getUnitColor(grain.unit)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(grain.created_at).toLocaleDateString('pl-PL')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(grain)}
                        color="primary"
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(grain.id)}
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
          count={filteredGrains.length}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingGrain ? 'Edytuj zboże' : 'Dodaj nowe zboże'}
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
                  🌾 Podstawowe informacje
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nazwa zboża"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      error={!!formErrors.name}
                      helperText={formErrors.name}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Jednostka miary"
                      select
                      value={formData.unit}
                      onChange={(e) => handleFormChange('unit', e.target.value)}
                      error={!!formErrors.unit}
                      helperText={formErrors.unit}
                    >
                      <MenuItem value="t">Tony (t)</MenuItem>
                      <MenuItem value="kg">Kilogramy (kg)</MenuItem>
                      <MenuItem value="g">Gramy (g)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingGrain ? 'Zapisz zmiany' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GrainsList;