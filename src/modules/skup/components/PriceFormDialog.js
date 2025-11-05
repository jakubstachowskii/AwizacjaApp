import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { FaTags } from 'react-icons/fa';

const PriceFormDialog = ({ open, onClose, editingPrice, onSubmit }) => {
  const [formData, setFormData] = useState({
    grain_id: '',
    price_per_ton: '',
    currency: 'PLN',
    valid_from: '',
    valid_to: '',
    min_quantity: '',
    quality_grade: 'A',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editingPrice) {
        setFormData({
          grain_id: editingPrice.grain_id || '',
          price_per_ton: editingPrice.price_per_ton || '',
          currency: editingPrice.currency || 'PLN',
          valid_from: editingPrice.valid_from || '',
          valid_to: editingPrice.valid_to || '',
          min_quantity: editingPrice.min_quantity || '',
          quality_grade: editingPrice.quality_grade || 'A',
          notes: editingPrice.notes || ''
        });
      } else {
        setFormData({
          grain_id: '',
          price_per_ton: '',
          currency: 'PLN',
          valid_from: '',
          valid_to: '',
          min_quantity: '',
          quality_grade: 'A',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [open, editingPrice]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.grain_id) newErrors.grain_id = 'Zboże jest wymagane';
    if (!formData.price_per_ton || formData.price_per_ton <= 0) {
      newErrors.price_per_ton = 'Cena musi być większa od 0';
    }
    if (!formData.valid_from) newErrors.valid_from = 'Data rozpoczęcia jest wymagana';
    if (formData.min_quantity && formData.min_quantity < 0) {
      newErrors.min_quantity = 'Minimalna ilość nie może być ujemna';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaTags color="#ea580c" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingPrice ? 'Edytuj cenę' : 'Nowa cena'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ maxHeight: '80vh', overflow: 'auto' }}>
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
                color: '#ea580c',
                fontWeight: 700,
                borderBottom: '3px solid #ea580c',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                💰 Podstawowe informacje cennika
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.grain_id}>
                    <InputLabel>Zboże</InputLabel>
                    <Select
                      value={formData.grain_id}
                      onChange={handleChange('grain_id')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      }}
                    >
                      <MenuItem value="pszenica">Pszenica</MenuItem>
                      <MenuItem value="zyto">Żyto</MenuItem>
                      <MenuItem value="jeczmien">Jęczmień</MenuItem>
                      <MenuItem value="owies">Owies</MenuItem>
                      <MenuItem value="kukurydza">Kukurydza</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Klasa jakości</InputLabel>
                    <Select
                      value={formData.quality_grade}
                      onChange={handleChange('quality_grade')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      }}
                    >
                      <MenuItem value="A">Klasa A</MenuItem>
                      <MenuItem value="B">Klasa B</MenuItem>
                      <MenuItem value="C">Klasa C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Cena za tonę"
                    type="number"
                    value={formData.price_per_ton}
                    onChange={handleChange('price_per_ton')}
                    error={!!errors.price_per_ton}
                    helperText={errors.price_per_ton}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Waluta</InputLabel>
                    <Select
                      value={formData.currency}
                      onChange={handleChange('currency')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      }}
                    >
                      <MenuItem value="PLN">PLN</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Data rozpoczęcia"
                    type="date"
                    value={formData.valid_from}
                    onChange={handleChange('valid_from')}
                    error={!!errors.valid_from}
                    helperText={errors.valid_from}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Data zakończenia"
                    type="date"
                    value={formData.valid_to}
                    onChange={handleChange('valid_to')}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} lg={8}>
                  <TextField
                    fullWidth
                    label="Minimalna ilość (tony)"
                    type="number"
                    value={formData.min_quantity}
                    onChange={handleChange('min_quantity')}
                    error={!!errors.min_quantity}
                    helperText={errors.min_quantity}
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notatki"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange('notes')}
                    placeholder="Dodatkowe informacje o cenniku..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#ea580c',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0'
      }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{
            borderColor: '#64748b',
            color: '#64748b',
            '&:hover': {
              borderColor: '#475569',
              backgroundColor: '#f1f5f9'
            }
          }}
        >
          Anuluj
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
              boxShadow: '0 6px 16px rgba(234, 88, 12, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {editingPrice ? 'Zaktualizuj' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PriceFormDialog;
