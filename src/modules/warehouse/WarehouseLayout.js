import React, { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import WarehouseNavigation from './WarehouseNavigation';
import WarehouseAppBar from './WarehouseAppBar';
import WarehouseStatusBar from './WarehouseStatusBar';

const drawerWidth = 260;
const collapsedWidth = 80;

const WarehouseLayout = ({ value, onChange, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [counters, setCounters] = useState({ warehouses: 0, stocks: 0, movements: 0 });
  const toggleSidebar = useCallback(() => setIsSidebarOpen(s => !s), []);

  const loadCounters = useCallback(async () => {
    try {
      const [wh, st, mv] = await Promise.all([
        window.electronAPI.dbGetAll('magazyn_warehouses', 'id'),
        window.electronAPI.dbGetAll('magazyn_stock_levels', 'id'),
        window.electronAPI.dbGetAll('magazyn_movements', 'id')
      ]);
      setCounters({ warehouses: wh.length, stocks: st.length, movements: mv.length });
    } catch {}
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <WarehouseNavigation value={value} onChange={onChange} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
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
        <WarehouseAppBar isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} drawerWidth={drawerWidth} collapsedWidth={collapsedWidth} />
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
            background: 'rgba(14, 165, 233, 0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(14, 165, 233, 0.5)',
            },
          },
        }}>
          {children}
        </Box>
        <WarehouseStatusBar isSidebarOpen={isSidebarOpen} counters={counters} />
      </Box>
    </Box>
  );
};

export default WarehouseLayout;



