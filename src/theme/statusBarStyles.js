export const statusBarBoxStyles = {
  flexShrink: 0,
  width: '100%',
  height: { xs: 32, sm: 36 },
  bgcolor: '#0f172a',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: { xs: 1.5, sm: 2 },
  overflow: 'hidden'
};

export const statusChipSx = {
  height: { xs: 20, sm: 22 },
  fontSize: { xs: '0.6875rem', sm: '0.75rem' },
  bgcolor: 'rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }
};
