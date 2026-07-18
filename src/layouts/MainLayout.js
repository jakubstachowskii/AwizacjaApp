import React, { useContext } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Navigation from '../components/Navigation';
import AppBarCustom from './AppBar';
import StatusBar from '../components/StatusBar';
import { AppContext } from '../App';
import { APP_BACKGROUND, shellColumnStyles, shellMainStyles } from '../theme/designTokens';

const MainLayout = ({ children }) => {
  const { isSidebarOpen, appointments, contractors, grains } = useContext(AppContext);

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', bgcolor: APP_BACKGROUND, overflow: 'hidden' }}>
      <CssBaseline />
      <Navigation />

      <Box sx={shellColumnStyles}>
        <Box sx={{ height: 3, bgcolor: 'primary.main', flexShrink: 0, width: '100%' }} />
        <AppBarCustom />
        <Box component="main" sx={shellMainStyles}>
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {children}
          </Box>
        </Box>
        <StatusBar
          counters={{
            appointments: appointments?.length || 0,
            contractors: contractors?.length || 0,
            grains: grains?.length || 0
          }}
        />
      </Box>
    </Box>
  );
};

export default MainLayout;
