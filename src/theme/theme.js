import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          minWidth: '220px', // Zwiększona minimalna szerokość
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            minWidth: '220px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textOverflow: 'unset',
            maxWidth: 'none',
            minWidth: 'fit-content',
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            maxWidth: 'calc(150% - 24px)', // Zwiększone maksimum
            minWidth: 'fit-content',
          },
          '& .MuiInputLabel-outlined': {
            '&.MuiInputLabel-shrink': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0 8px',
              borderRadius: '4px',
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          minWidth: '220px', // Zwiększona minimalna szerokość
          '& .MuiOutlinedInput-root': {
            minWidth: '220px',
          },
          '& .MuiInputLabel-root': {
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textOverflow: 'unset',
            maxWidth: 'none',
            width: 'auto',
            minWidth: 'fit-content',
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            maxWidth: 'calc(150% - 24px)', // Zwiększone maksimum
            width: 'auto',
          },
          '& .MuiInputLabel-outlined': {
            '&.MuiInputLabel-shrink': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0 8px',
              borderRadius: '4px',
            },
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.95rem',
          whiteSpace: 'nowrap',
          overflow: 'visible',
          textOverflow: 'unset',
          maxWidth: 'none',
          width: 'auto',
          minWidth: 'fit-content',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            maxWidth: 'calc(133% - 24px)',
            width: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '0 8px',
            borderRadius: '4px',
          },
          '&.MuiInputLabel-outlined': {
            '&.MuiInputLabel-shrink': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '0 8px',
              borderRadius: '4px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
  },
});
