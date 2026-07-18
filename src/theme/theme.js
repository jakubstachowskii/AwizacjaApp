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
      secondary: '#475569',
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
    body1: { fontSize: '0.875rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.45, color: '#475569' },
    button: { fontWeight: 600, textTransform: 'none', fontSize: '0.875rem' },
  },
  shape: { borderRadius: 6 },
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
          borderRadius: 6,
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
          borderColor: '#94a3b8',
          color: '#0f172a',
          '&:hover': {
            borderColor: '#64748b',
            bgcolor: 'rgba(248, 250, 252, 0.9)',
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
          borderRadius: 8,
          boxShadow: SHADOW_SM,
          border: `1px solid ${SURFACE_BORDER}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 8 },
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
          borderRadius: 6,
          bgcolor: '#fff',
          transition: 'background-color 0.15s, box-shadow 0.15s',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
          '&.Mui-focused': {
            bgcolor: '#fff',
            boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
          },
        },
        input: { padding: '9px 12px' },
        inputSizeSmall: { padding: '7px 10px', fontSize: '0.875rem' },
        notchedOutline: { borderColor: '#94a3b8' },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#475569',
          lineHeight: 1.3,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          color: '#475569',
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textOverflow: 'unset',
          maxWidth: 'none',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.85)',
            maxWidth: 'none',
            backgroundColor: '#fff',
            padding: '0 6px',
            color: '#334155',
          },
        },
        outlined: {
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#fff',
            padding: '0 6px',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontSize: '0.75rem',
          lineHeight: 1.35,
          marginTop: 4,
          color: '#475569',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 700,
          lineHeight: 1.35,
          color: '#0f172a',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          minHeight: 36,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          lineHeight: 1.35,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#334155',
          '&:hover': { bgcolor: 'rgba(15, 23, 42, 0.06)' },
        },
        sizeSmall: { padding: 6 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4, fontWeight: 600 },
        sizeSmall: { height: 22, fontSize: '0.75rem' },
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
          padding: '5px 10px',
          fontSize: '0.8125rem',
          lineHeight: 1.35,
          color: '#0f172a',
          borderColor: '#e2e8f0',
          '& .MuiTypography-root': { fontSize: 'inherit', lineHeight: 'inherit' },
          '& .MuiChip-root': { height: 22, fontSize: '0.75rem' },
          '& .MuiIconButton-root': { padding: 5 },
          '& .MuiButton-root': { minHeight: 26, padding: '2px 8px', fontSize: '0.75rem' },
        },
        head: {
          padding: '7px 10px',
          fontSize: '0.8125rem',
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color: '#1e293b',
          backgroundColor: '#e8eef6',
          borderBottom: '1px solid #cbd5e1',
          whiteSpace: 'nowrap',
        },
        footer: { padding: '5px 10px' },
        sizeSmall: {
          padding: '5px 10px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.1s ease',
          '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.05)' },
          '&:nth-of-type(even)': { bgcolor: 'rgba(248, 250, 252, 0.85)' },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: `1px solid ${SURFACE_BORDER}` },
        toolbar: { minHeight: 40, paddingLeft: 8, paddingRight: 8 },
        selectLabel: { fontSize: '0.8125rem', margin: 0, color: '#475569' },
        displayedRows: { fontSize: '0.8125rem', margin: 0, color: '#475569' },
        select: { fontSize: '0.8125rem' },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: { fontSize: 'inherit', color: 'inherit' },
        icon: { fontSize: '0.875rem', marginLeft: 2, opacity: 0.7 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
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
        root: { borderRadius: 6 },
      },
    },
  },
});
