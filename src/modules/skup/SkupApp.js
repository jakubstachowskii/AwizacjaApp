import React, { useMemo, useState, Suspense, lazy, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import SkupLayout from './SkupLayout';
import Overview from './views/Overview';

// Lazy loading dla widoków skup
const Intakes = lazy(() => import('./views/Intakes'));
const Deliveries = lazy(() => import('./views/Deliveries'));
const Contractors = lazy(() => import('./views/Contractors'));
const Pricing = lazy(() => import('./views/Pricing'));
const Reports = lazy(() => import('./views/Reports'));
const Documents = lazy(() => import('./views/Documents'));
const Contracts = lazy(() => import('./views/Contracts'));
const QualityRules = lazy(() => import('./views/QualityRules'));
const PeripheralEnvironment = lazy(() => import('../../components/peripherals/PeripheralEnvironment'));

const SkupApp = React.memo(() => {
  const [view, setView] = useState('overview');

  useEffect(() => {
    let mounted = true;
    const applyStartView = async () => {
      try {
        const v = await window.electronAPI.getSelectedSkupView?.();
        if (mounted && v) {
          setView(v);
          // wyczyść po użyciu, żeby nie trzymać stanu globalnie
          await window.electronAPI.setSelectedSkupView?.(null);
        }
      } catch {}
    };
    applyStartView();
    return () => { mounted = false; };
  }, []);

  const content = useMemo(() => {
    const LoadingFallback = () => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );

    switch (view) {
      case 'overview':
        return <Overview onNavigate={setView} />;
      case 'intakes':
        return <Suspense fallback={<LoadingFallback />}><Intakes /></Suspense>;
      case 'deliveries':
        return <Suspense fallback={<LoadingFallback />}><Deliveries /></Suspense>;
      case 'contractors':
        return <Suspense fallback={<LoadingFallback />}><Contractors /></Suspense>;
      case 'pricing':
        return <Suspense fallback={<LoadingFallback />}><Pricing /></Suspense>;
      case 'documents':
        return <Suspense fallback={<LoadingFallback />}><Documents /></Suspense>;
      case 'reports':
        return <Suspense fallback={<LoadingFallback />}><Reports /></Suspense>;
      case 'contracts':
        return <Suspense fallback={<LoadingFallback />}><Contracts /></Suspense>;
      case 'quality_rules':
        return <Suspense fallback={<LoadingFallback />}><QualityRules /></Suspense>;
      case 'devices':
        return <Suspense fallback={<LoadingFallback />}><PeripheralEnvironment moduleId="skup" /></Suspense>;
      default:
        return <Overview onNavigate={setView} />;
    }
  }, [view]);

  return (
    <SkupLayout value={view} onChange={setView}>
      {content}
    </SkupLayout>
  );
});

export default SkupApp;
