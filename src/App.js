import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import MainLayout from './layouts/MainLayout';
import LoadingSpinner from './components/LoadingSpinner';
import { theme } from './theme/theme';
import { NotificationProvider } from './components/NotificationProvider';
import { useAppData } from './hooks/useAppData';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';

// Lazy loading komponentów dla lepszej wydajności
const Dashboard = lazy(() => import('./components/Dashboard'));
const AppointmentsList = lazy(() => import('./components/AppointmentsList'));
const ContractorsList = lazy(() => import('./components/ContractorsList'));
const ShippersList = lazy(() => import('./components/ShippersList'));
const GrainsList = lazy(() => import('./components/GrainsList'));
const Reports = lazy(() => import('./components/Reports'));
const Settings = lazy(() => import('./components/Settings'));
const DatabaseTest = lazy(() => import('./components/DatabaseTest'));
const SkupApp = lazy(() => import('./modules/skup/SkupApp'));
const WarehouseApp = lazy(() => import('./modules/warehouse/WarehouseApp'));

export const AppContext = React.createContext();

function App() {
  const [currentView, setCurrentView] = useState('splash');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Użycie custom hook do zarządzania danymi
  const appData = useAppData();

  useEffect(() => {
    // Udostępnij globalny setter widoku dla modułów (np. powrót do splash)
    window.appSetCurrentView = (view) => setCurrentView(view);
    return () => { delete window.appSetCurrentView; };
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Optymalizacja contextValue z useMemo
  const contextValue = useMemo(() => ({
    currentView,
    setCurrentView,
    isSidebarOpen,
    toggleSidebar,
    ...appData
  }), [
    currentView,
    isSidebarOpen,
    toggleSidebar,
    appData
  ]);

  // Optymalizacja renderCurrentView z useMemo i Suspense dla lazy loading
  const renderCurrentView = useMemo(() => {
    const ComponentWrapper = ({ children }) => (
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    );

    switch (currentView) {
      case 'dashboard':
        return <ComponentWrapper><Dashboard /></ComponentWrapper>;
      case 'appointments':
        return <ComponentWrapper><AppointmentsList /></ComponentWrapper>;
      case 'contractors':
        return <ComponentWrapper><ContractorsList /></ComponentWrapper>;
      case 'shippers':
        return <ComponentWrapper><ShippersList /></ComponentWrapper>;
      case 'grains':
        return <ComponentWrapper><GrainsList /></ComponentWrapper>;
      case 'reports':
        return <ComponentWrapper><Reports /></ComponentWrapper>;
      case 'settings':
        return <ComponentWrapper><Settings /></ComponentWrapper>;
      case 'database-test':
        return <ComponentWrapper><DatabaseTest /></ComponentWrapper>;
      default:
        return <ComponentWrapper><Dashboard /></ComponentWrapper>;
    }
  }, [currentView]);

  if (appData.loading) {
    return <LoadingSpinner />;
  }

  // SplashScreen jako niezależny ekran startowy, bez MainLayout
  if (currentView === 'splash') {
    return (
      <ErrorBoundary>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <AppContext.Provider value={contextValue}>
              <SplashScreen />
            </AppContext.Provider>
          </NotificationProvider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  // SkupApp jako niezależny moduł poza MainLayout Awizacje
  if (currentView === 'skup') {
    return (
      <ErrorBoundary>
        <AppContext.Provider value={contextValue}>
          <Suspense fallback={<LoadingSpinner />}>
            <SkupApp />
          </Suspense>
        </AppContext.Provider>
      </ErrorBoundary>
    );
  }

  // Magazyn jako niezależny moduł poza MainLayout Awizacje
  if (currentView === 'magazyn') {
    return (
      <ErrorBoundary>
        <AppContext.Provider value={contextValue}>
          <Suspense fallback={<LoadingSpinner />}>
            <WarehouseApp />
          </Suspense>
        </AppContext.Provider>
      </ErrorBoundary>
    );
  }

  // Domyślnie – aplikacja Awizacje z MainLayout
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AppContext.Provider value={contextValue}>
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
                background: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
                pointerEvents: 'none',
              }
            }}>
              <MainLayout>
                {renderCurrentView}
              </MainLayout>
            </Box>
          </AppContext.Provider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;