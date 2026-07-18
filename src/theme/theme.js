import { createTheme } from '@mui/material/styles';
import { SURFACE_BORDER, SHADOW_SM } from './designTokens';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    success: { main: '#10b981', light: '#34d399', dark: '#059669' },
    error: { main: '#ef4444', light: '#f87171', dark: '#dc2626' },
    warning: { main: '#f59e0b', light: '#fbbf24', dark: '#d97706' },
    info: { main: '#3b82f6', light: '#60a5fa', dark: '#2563eb' },
    background: {
      default: '#eef1f6',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: SURFACE_BORDER,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.25, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, fontSize: '1.625rem', lineHeight: 1.3, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, fontSize: '1.375rem', lineHeight: 1.35, letterSpacing: '-0.02em' },
    h4: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.45 },
    subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.55 },
    caption: { fontSize: '0.75rem', lineHeight: 1.45, color: '#64748b' },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    SHADOW_SM,
    '0 2px 4px rgba(15, 23, 42, 0.05), 0 4px 12px rgba(15, 23, 42, 0.07)',
    '0 4px 8px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.08)',
    ...Array(21).fill('0 4px 16px rgba(15, 23, 42, 0.1)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#eef1f6' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: 'none',
          padding: '7px 16px',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          },
        },
        outlined: {
          borderColor: SURFACE_BORDER,
          '&:hover': {
            borderColor: '#cbd5e1',
            bgcolor: 'rgba(248, 250, 252, 0.8)',
          },
        },
        sizeSmall: {
          fontSize: '0.8125rem',
          padding: '5px 12px',
          minHeight: 32,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: SHADOW_SM,
          border: `1px solid ${SURFACE_BORDER}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 12 },
        elevation0: {
          boxShadow: SHADOW_SM,
          border: `1px solid ${SURFACE_BORDER}`,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: 8,
          bgcolor: '#fafbfc',
          transition: 'background-color 0.15s, box-shadow 0.15s',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
          '&.Mui-focused': {
            bgcolor: '#fff',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
          },
        },
        input: { padding: '10px 14px' },
        inputSizeSmall: { padding: '8px 12px', fontSize: '0.875rem' },
        notchedOutline: { borderColor: SURFACE_BORDER },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.875rem' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
        sizeSmall: { height: 20, fontSize: '0.6875rem' },
      },
    },
    MuiTable: {
      defaultProps: { size: 'small' },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: { width: '100%' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '2px 8px',
          fontSize: '0.75rem',
          lineHeight: 1.25,
          borderColor: 'rgba(15, 23, 42, 0.06)',
          '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' },
          '& .MuiChip-root': { height: 20, fontSize: '0.6875rem' },
          '& .MuiIconButton-root': { padding: 3 },
          '& .MuiButton-root': { minHeight: 24, padding: '1px 6px', fontSize: '0.6875rem' },
        },
        head: {
          padding: '4px 8px',
          fontSize: '0.6875rem',
          fontWeight: 600,
          lineHeight: 1.2,
          letterSpacing: '0.02em',
          textTransform: 'none',
          color: '#64748b',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid rgba(15, 23, 42, 0.08)',
          whiteSpace: 'nowrap',
        },
        footer: { padding: '2px 8px' },
        sizeSmall: {
          padding: '1px 6px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.1s ease',
          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.04)' },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: `1px solid ${SURFACE_BORDER}` },
        toolbar: { minHeight: 36, paddingLeft: 8, paddingRight: 8 },
        selectLabel: { fontSize: '0.75rem', margin: 0 },
        displayedRows: { fontSize: '0.75rem', margin: 0 },
        select: { fontSize: '0.75rem' },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: { fontSize: 'inherit' },
        icon: { fontSize: '0.75rem', marginLeft: 2 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: `1px solid ${SURFACE_BORDER}` },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});
