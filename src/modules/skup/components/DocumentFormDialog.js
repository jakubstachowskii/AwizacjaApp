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
import { FaFileAlt } from 'react-icons/fa';

const DocumentFormDialog = ({ open, onClose, editingDocument, onSubmit }) => {
  const [formData, setFormData] = useState({
    document_type: 'faktura',
    document_number: '',
    contractor_id: '',
    amount: '',
    currency: 'PLN',
    issue_date: '',
    due_date: '',
    status: 'oczekujaca',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editingDocument) {
        setFormData({
          document_type: editingDocument.document_type || 'faktura',
          document_number: editingDocument.document_number || '',
          contractor_id: editingDocument.contractor_id || '',
          amount: editingDocument.amount || '',
          currency: editingDocument.currency || 'PLN',
          issue_date: editingDocument.issue_date || '',
          due_date: editingDocument.due_date || '',
          status: editingDocument.status || 'oczekujaca',
          notes: editingDocument.notes || ''
        });
      } else {
        setFormData({
          document_type: 'faktura',
          document_number: '',
          contractor_id: '',
          amount: '',
          currency: 'PLN',
          issue_date: '',
          due_date: '',
          status: 'oczekujaca',
          notes: ''
        });
      }
      setErrors({});
    }
  }, [open, editingDocument]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.document_type) newErrors.document_type = 'Typ dokumentu jest wymagany';
    if (!formData.document_number || formData.document_number.trim().length < 2) {
      newErrors.document_number = 'Numer dokumentu musi mieć co najmniej 2 znaki';
    }
    if (!formData.contractor_id) newErrors.contractor_id = 'Kontrahent jest wymagany';
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Kwota musi być większa od 0';
    }
    if (!formData.issue_date) newErrors.issue_date = 'Data wystawienia jest wymagana';

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
          <FaFileAlt color="#0891b2" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {editingDocument ? 'Edytuj dokument' : 'Nowy dokument'}
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
                color: '#0891b2',
                fontWeight: 700,
                borderBottom: '3px solid #0891b2',
                pb: 1,
                fontSize: '1.1rem'
              }}>
                📄 Podstawowe informacje dokumentu
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required error={!!errors.document_type}>
                    <InputLabel>Typ dokumentu</InputLabel>
                    <Select
                      value={formData.document_type}
                      onChange={handleChange('document_type')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      }}
                    >
                      <MenuItem value="faktura">Faktura</MenuItem>
                      <MenuItem value="rachunek">Rachunek</MenuItem>
                      <MenuItem value="paragon">Paragon</MenuItem>
                      <MenuItem value="umowa">Umowa</MenuItem>
                      <MenuItem value="inne">Inne</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} lg={8}>
                  <TextField
                    fullWidth
                    label="Numer dokumentu"
                    value={formData.document_number}
                    onChange={handleChange('document_number')}
                    error={!!errors.document_number}
                    helperText={errors.document_number}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} lg={8}>
                  <FormControl fullWidth required error={!!errors.contractor_id}>
                    <InputLabel>Kontrahent</InputLabel>
                    <Select
                      value={formData.contractor_id}
                      onChange={handleChange('contractor_id')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      }}
                    >
                      <MenuItem value="kontrahent1">Kontrahent 1</MenuItem>
                      <MenuItem value="kontrahent2">Kontrahent 2</MenuItem>
                      <MenuItem value="kontrahent3">Kontrahent 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={handleChange('status')}
                      sx={{
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      }}
                    >
                      <MenuItem value="oczekujaca">Oczekująca</MenuItem>
                      <MenuItem value="wyslana">Wysłana</MenuItem>
                      <MenuItem value="oplacona">Opłacona</MenuItem>
                      <MenuItem value="anulowana">Anulowana</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Kwota"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange('amount')}
                    error={!!errors.amount}
                    helperText={errors.amount}
                    inputProps={{ min: 0, step: 0.01 }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
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
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      }}
                    >
                      <MenuItem value="PLN">PLN</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Data wystawienia"
                    type="date"
                    value={formData.issue_date}
                    onChange={handleChange('issue_date')}
                    error={!!errors.issue_date}
                    helperText={errors.issue_date}
                    InputLabelProps={{ shrink: true }}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Termin płatności"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange('due_date')}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
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
                    placeholder="Dodatkowe informacje o dokumencie..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: '#ffffff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#0891b2',
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
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e7490 0%, #155e75 100%)',
              boxShadow: '0 6px 16px rgba(8, 145, 178, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {editingDocument ? 'Zaktualizuj' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentFormDialog;
