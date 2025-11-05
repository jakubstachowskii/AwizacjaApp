import React, { useMemo, useState, Suspense, lazy } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { theme } from '../../theme/theme';
import WarehouseLayout from './WarehouseLayout';
import OverviewView from './views/OverviewView';

const Inventory = lazy(() => import('./views/InventoryView'));
const Batches = lazy(() => import('./views/BatchesView'));
const Movements = lazy(() => import('./views/MovementsView'));
const Reports = lazy(() => import('./views/ReportsView'));

const WarehouseApp = () => {
  const [view, setView] = useState('overview');

  const content = useMemo(() => {
    const LoadingFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );

    switch (view) {
      case 'overview':
        return <OverviewView onNavigate={setView} />;
      case 'inventory':
        return <Suspense fallback={<LoadingFallback />}><Inventory /></Suspense>;
      case 'batches':
        return <Suspense fallback={<LoadingFallback />}><Batches /></Suspense>;
      case 'movements':
        return <Suspense fallback={<LoadingFallback />}><Movements /></Suspense>;
      case 'reports':
        return <Suspense fallback={<LoadingFallback />}><Reports /></Suspense>;
      default:
        return <OverviewView onNavigate={setView} />;
    }
  }, [view]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(14, 165, 233, 0.05) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}>
        <WarehouseLayout value={view} onChange={setView}>
          {content}
        </WarehouseLayout>
      </Box>
    </ThemeProvider>
  );
};

export default WarehouseApp;


