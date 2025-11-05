import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box } from '@mui/material';
import SkupNavigation from './SkupNavigation';
import SkupAppBar from './SkupAppBar';
import SkupStatusBar from './SkupStatusBar';

const drawerWidth = 260;
const collapsedWidth = 80;

const SkupLayout = ({ value, onChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [counters, setCounters] = useState({ intakes: 0, documents: 0, prices: 0, contractors: 0, grains: 0 });
  const toggleSidebar = useCallback(() => setIsSidebarOpen(s => !s), []);

  const loadCounters = useCallback(async () => {
    try {
      const [intakes, documents, prices, contractors, grains] = await Promise.all([
        window.electronAPI.dbGetAll('skup_intakes', 'id'),
        window.electronAPI.dbGetAll('skup_documents', 'id'),
        window.electronAPI.dbGetAll('skup_prices', 'id'),
        window.electronAPI.dbGetAll('skup_contractors', 'id'),
        window.electronAPI.dbGetAll('skup_grains', 'id')
      ]);
      setCounters({
        intakes: intakes.length,
        documents: documents.length,
        prices: prices.length,
        contractors: contractors.length,
        grains: grains.length
      });
    } catch (e) {
      // silent fail to keep statusbar non-blocking
      if (process.env.NODE_ENV === 'development') console.error(e);
    }
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  useEffect(() => {
    const handler = () => loadCounters();
    window.addEventListener('skup:refresh', handler);
    return () => window.removeEventListener('skup:refresh', handler);
  }, [loadCounters]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SkupNavigation value={value} onChange={onChange} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        ml: { 
          xs: 0, 
          sm: 0,
          md: 0,
          lg: isSidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px` 
        },
        width: { 
          xs: '100%', 
          sm: '100%',
          md: '100%',
          lg: isSidebarOpen 
            ? `calc(100% - ${drawerWidth}px)` 
            : `calc(100% - ${collapsedWidth}px)` 
        },
        height: '100vh',
        overflow: 'hidden',
        transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <SkupAppBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} drawerWidth={drawerWidth} collapsedWidth={collapsedWidth} />
        <Box component="main" sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 2, lg: 4 },
          mt: { xs: 7, sm: 8, md: 8 },
          mb: { xs: '24px', sm: '32px' },
          height: { 
            xs: 'calc(100vh - 56px - 24px)', // Mobile: mniejszy AppBar i StatusBar
            sm: 'calc(100vh - 64px - 32px)'  // Desktop: standardowe wysokości
          },
          width: '100%',
          position: 'relative',
          zIndex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: { xs: '4px', sm: '8px' },
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(37, 99, 235, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(37, 99, 235, 0.5)',
            },
          },
        }}>
          {children}
        </Box>
        <SkupStatusBar isSidebarOpen={isSidebarOpen} counters={counters} />
      </Box>
    </Box>
  );
};

export default SkupLayout;
