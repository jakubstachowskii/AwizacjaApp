import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from '../components/Navigation';
import AppBarCustom from './AppBar';
import StatusBar from '../components/StatusBar';
import { AppContext } from '../App';

const MainLayout = ({ children }) => {
  const { isSidebarOpen } = useContext(AppContext);
  const drawerWidth = 280;
  const collapsedWidth = 80;

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      overflow: 'hidden',
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
      <CssBaseline />
      <Navigation />
      
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
        <AppBarCustom />
        
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: { xs: 1, sm: 2, md: 2, lg: 4 }, 
          mt: { xs: 7, sm: 8, md: 8 },
          mb: { xs: '24px', sm: '32px' }, // Responsywny margines na dole dla StatusBar
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
        
        <StatusBar isSidebarOpen={isSidebarOpen} />
      </Box>
    </Box>
  );
};

export default MainLayout; 