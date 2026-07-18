import React, { useMemo, useState, Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import QualityLayout from './QualityLayout';
import OverviewView from './views/OverviewView';

const TestsView = lazy(() => import('./views/TestsView'));
const CertificatesView = lazy(() => import('./views/CertificatesView'));
const ProcessesView = lazy(() => import('./views/ProcessesView'));
const DevicesView = lazy(() => import('./views/DevicesView'));

const QualityApp = () => {
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
      case 'tests':
        return <Suspense fallback={<LoadingFallback />}><TestsView /></Suspense>;
      case 'certificates':
        return <Suspense fallback={<LoadingFallback />}><CertificatesView /></Suspense>;
      case 'processes':
        return <Suspense fallback={<LoadingFallback />}><ProcessesView /></Suspense>;
      case 'devices':
        return <Suspense fallback={<LoadingFallback />}><DevicesView /></Suspense>;
      default:
        return <OverviewView onNavigate={setView} />;
    }
  }, [view]);

  return (
    <QualityLayout value={view} onChange={setView}>
      {content}
    </QualityLayout>
  );
};

export default QualityApp;
