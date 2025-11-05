import React, { useContext } from 'react';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { FaBell, FaSearch, FaUserCircle, FaBars, FaThLarge } from 'react-icons/fa';
import { AppContext } from '../App';
import { useTheme, useMediaQuery } from '@mui/material';

const AppBarCustom = () => {
  const { toggleSidebar, isSidebarOpen, setCurrentView } = useContext(AppContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleSidebarToggle = () => {
    // W trybie mobile używamy toggleSidebar, który będzie obsługiwany przez Navigation
    // W trybie desktop używamy toggleSidebar bezpośrednio
    toggleSidebar();
  };

  const goToModules = () => {
    setCurrentView('splash');
  };

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: 'none',
        width: { 
          xs: '100%',
          sm: '100%',
          md: '100%',
          lg: isSidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)' 
        },
        ml: { 
          xs: 0,
          sm: 0,
          md: 0,
          lg: isSidebarOpen ? '280px' : '80px' 
        },
        left: { lg: 0 },
        borderRadius: 0,
        zIndex: 1200,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 }, py: 1 }}>
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          {/* Sidebar Toggle Button */}
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              color: '#64748b',
              '&:hover': {
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb'
              }
            }}
          >
            <FaBars />
          </IconButton>

          {/* Back to Modules */}
          <IconButton
            onClick={goToModules}
            sx={{
              color: '#64748b',
              '&:hover': {
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb'
              }
            }}
            title="Moduły"
          >
            <FaThLarge />
          </IconButton>

          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: '#1e293b',
            fontSize: { xs: '1.25rem', md: '1.5rem' }
          }}>
            AwizaxjaApp
          </Typography>

          <Box sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1,
            ml: 3,
            px: 2,
            py: 0.5,
            background: 'rgba(37, 99, 235, 0.1)',
            borderRadius: 2,
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}>
            <Typography variant="caption" sx={{
              color: '#2563eb',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}>
              System zarządzania awizacjami
            </Typography>
          </Box>
        </Box>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Search */}
          <IconButton
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': {
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb'
              }
            }}
          >
            <FaSearch />
          </IconButton>

          {/* Notifications */}
          <IconButton
            size="small"
            sx={{
              color: '#64748b',
              '&:hover': {
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb'
              }
            }}
          >
            <Badge badgeContent={0} color="error">
              <FaBell />
            </Badge>
          </IconButton>

          {/* User */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 2,
            px: 2,
            py: 1,
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.1)'
            }
          }}>
            <Avatar sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
            }}>
              <FaUserCircle />
            </Avatar>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="body2" sx={{
                fontWeight: 600,
                color: '#1e293b',
                fontSize: '0.875rem',
                lineHeight: 1.2
              }}>
                Administrator
              </Typography>
              <Typography variant="caption" sx={{
                color: '#64748b',
                fontSize: '0.75rem'
              }}>
                admin@awizaxja.pl
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBarCustom; 