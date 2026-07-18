import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Potwierdzenie',
  message,
  content,
  confirmText = 'Potwierdź',
  cancelText = 'Anuluj'
}) {
  const text = message || content || 'Czy na pewno chcesz wykonać tę akcję?';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FaExclamationTriangle color="#dc2626" size={18} />
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{text}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
