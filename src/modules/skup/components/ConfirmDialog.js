import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Potwierdź', cancelText = 'Anuluj' }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaExclamationTriangle color="#ef4444" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title || 'Potwierdzenie'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" sx={{ mt: 1 }}>
          {message || 'Czy na pewno chcesz wykonać tę akcję?'}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
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
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color="error"
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
