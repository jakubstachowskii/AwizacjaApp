export const statusBarBoxStyles = {
  flexShrink: 0,
  width: '100%',
  height: { xs: 34, sm: 38 },
  bgcolor: '#0f172a',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  px: { xs: 1.5, sm: 2 },
  overflow: 'hidden',
  gap: 1
};

export const statusChipSx = {
  height: { xs: 22, sm: 24 },
  fontSize: { xs: '0.75rem', sm: '0.8125rem' },
  fontWeight: 600,
  bgcolor: 'rgba(255,255,255,0.14)',
  color: '#f8fafc',
  border: '1px solid rgba(255,255,255,0.2)',
  '& .MuiChip-label': { px: 1 },
  '& .MuiChip-icon': { color: '#e2e8f0', fontSize: '0.8125rem' }
};
