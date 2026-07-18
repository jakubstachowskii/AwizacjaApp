import React, { useMemo, useState, Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import SalesLayout from './SalesLayout';
import OverviewView from './views/OverviewView';

const CustomersView = lazy(() => import('./views/CustomersView'));
const OrdersView = lazy(() => import('./views/OrdersView'));
const InvoicesView = lazy(() => import('./views/InvoicesView'));
const PeripheralEnvironment = lazy(() => import('../../components/peripherals/PeripheralEnvironment'));

const SalesApp = () => {
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
      case 'customers':
        return <Suspense fallback={<LoadingFallback />}><CustomersView /></Suspense>;
      case 'orders':
        return <Suspense fallback={<LoadingFallback />}><OrdersView /></Suspense>;
      case 'invoices':
        return <Suspense fallback={<LoadingFallback />}><InvoicesView /></Suspense>;
      case 'devices':
        return <Suspense fallback={<LoadingFallback />}><PeripheralEnvironment moduleId="sprzedaz" /></Suspense>;
      default:
        return <OverviewView onNavigate={setView} />;
    }
  }, [view]);

  return (
    <SalesLayout value={view} onChange={setView}>
      {content}
    </SalesLayout>
  );
};

export default SalesApp;
