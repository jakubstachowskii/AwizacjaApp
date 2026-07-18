import React, { useMemo, useState, Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import WarehouseLayout from './WarehouseLayout';
import OverviewView from './views/OverviewView';

const Inventory = lazy(() => import('./views/InventoryView'));
const Batches = lazy(() => import('./views/BatchesView'));
const Movements = lazy(() => import('./views/MovementsView'));
const Reports = lazy(() => import('./views/ReportsView'));
const Transfers = lazy(() => import('./views/TransfersView'));
const Inventories = lazy(() => import('./views/InventoriesView'));
const PeripheralEnvironment = lazy(() => import('../../components/peripherals/PeripheralEnvironment'));

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
      case 'transfers':
        return <Suspense fallback={<LoadingFallback />}><Transfers /></Suspense>;
      case 'inventories':
        return <Suspense fallback={<LoadingFallback />}><Inventories /></Suspense>;
      case 'devices':
        return <Suspense fallback={<LoadingFallback />}><PeripheralEnvironment moduleId="magazyn" /></Suspense>;
      case 'reports':
        return <Suspense fallback={<LoadingFallback />}><Reports /></Suspense>;
      default:
        return <OverviewView onNavigate={setView} />;
    }
  }, [view]);

  return (
    <WarehouseLayout value={view} onChange={setView}>
      {content}
    </WarehouseLayout>
  );
};

export default WarehouseApp;


