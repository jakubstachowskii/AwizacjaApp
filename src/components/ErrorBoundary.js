import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Remove console.error in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ mb: 3 }}>
              <FaExclamationTriangle 
                size={64} 
                style={{ color: '#ef4444', marginBottom: '16px' }} 
              />
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
              Wystąpił błąd
            </Typography>
            
            <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
              Przepraszamy, wystąpił nieoczekiwany błąd w aplikacji. 
              Spróbuj odświeżyć stronę lub skontaktuj się z administratorem.
            </Typography>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                background: '#fef2f2', 
                borderRadius: 2, 
                border: '1px solid #fecaca',
                textAlign: 'left'
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#dc2626', mb: 1 }}>
                  Szczegóły błędu (tylko w trybie deweloperskim):
                </Typography>
                <Typography variant="body2" sx={{ color: '#991b1b', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<FaRedo />}
                onClick={this.handleReset}
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
                  }
                }}
              >
                Spróbuj ponownie
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: '#64748b',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#475569',
                    backgroundColor: '#f1f5f9'
                  }
                }}
              >
                Odśwież stronę
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 