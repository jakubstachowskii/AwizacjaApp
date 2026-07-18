import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { theme } from './theme/theme';
import { NotificationProvider } from './components/NotificationProvider';
import { useAppData } from './hooks/useAppData';
import { useShellSidebar } from './hooks/useShellSidebar';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AppointmentsList = lazy(() => import('./components/AppointmentsList'));
const ContractorsList = lazy(() => import('./components/ContractorsList'));
const ShippersList = lazy(() => import('./components/ShippersList'));
const GrainsList = lazy(() => import('./components/GrainsList'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const DevicesEnvironment = lazy(() => import('./components/peripherals/PeripheralEnvironment'));
const DatabaseTest = lazy(() => import('./components/DatabaseTest'));
const SkupApp = lazy(() => import('./modules/skup/SkupApp'));
const WarehouseApp = lazy(() => import('./modules/warehouse/WarehouseApp'));
const QualityApp = lazy(() => import('./modules/quality/QualityApp'));
const SalesApp = lazy(() => import('./modules/sales/SalesApp'));

export const AppContext = React.createContext();

function AppContent() {
  const [currentView, setCurrentView] = useState('splash');
  const { isSidebarOpen, toggleSidebar } = useShellSidebar();
  const appData = useAppData();

  useEffect(() => {
    window.appSetCurrentView = (view) => setCurrentView(view);
    return () => { delete window.appSetCurrentView; };
  }, []);

  const contextValue = useMemo(() => ({
    currentView,
    setCurrentView,
    isSidebarOpen,
    toggleSidebar,
    ...appData
  }), [currentView, isSidebarOpen, toggleSidebar, appData]);

  const renderCurrentView = useMemo(() => {
    const ComponentWrapper = ({ children }) => (
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    );

    switch (currentView) {
      case 'dashboard': return <ComponentWrapper><Dashboard /></ComponentWrapper>;
      case 'appointments': return <ComponentWrapper><AppointmentsList /></ComponentWrapper>;
      case 'contractors': return <ComponentWrapper><ContractorsList /></ComponentWrapper>;
      case 'shippers': return <ComponentWrapper><ShippersList /></ComponentWrapper>;
      case 'grains': return <ComponentWrapper><GrainsList /></ComponentWrapper>;
      case 'reports': return <ComponentWrapper><Reports /></ComponentWrapper>;
      case 'devices': return <ComponentWrapper><DevicesEnvironment moduleId="awizacje" /></ComponentWrapper>;
      case 'settings': return <ComponentWrapper><Settings /></ComponentWrapper>;
      case 'database-test': return <ComponentWrapper><DatabaseTest /></ComponentWrapper>;
      default: return <ComponentWrapper><Dashboard /></ComponentWrapper>;
    }
  }, [currentView]);

  let body = null;
  if (currentView === 'splash') {
    body = (
      <AppContext.Provider value={contextValue}>
        <SplashScreen />
      </AppContext.Provider>
    );
  } else if (currentView === 'skup') {
    body = (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingSpinner />}><SkupApp /></Suspense>
      </AppContext.Provider>
    );
  } else if (currentView === 'magazyn') {
    body = (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingSpinner />}><WarehouseApp /></Suspense>
      </AppContext.Provider>
    );
  } else if (currentView === 'jakosc') {
    body = (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingSpinner />}><QualityApp /></Suspense>
      </AppContext.Provider>
    );
  } else if (currentView === 'sprzedaz') {
    body = (
      <AppContext.Provider value={contextValue}>
        <Suspense fallback={<LoadingSpinner />}><SalesApp /></Suspense>
      </AppContext.Provider>
    );
  } else {
    body = (
      <AppContext.Provider value={contextValue}>
        <MainLayout>{renderCurrentView}</MainLayout>
      </AppContext.Provider>
    );
  }

  return <NotificationProvider>{body}</NotificationProvider>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
