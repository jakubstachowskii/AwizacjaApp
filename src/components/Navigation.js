import React, { useContext, useState, useMemo, useCallback } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fade,
  Avatar,
  Badge
} from '@mui/material';
import { 
  FaTachometerAlt, 
  FaClipboardList, 
  FaSeedling, 
  FaUsers, 
  FaChartBar, 
  FaCog,
  FaBars,
  FaBell,
  FaUserCircle,
  FaTruck,
  FaDatabase
} from 'react-icons/fa';
import { AppContext } from '../App';

const drawerWidth = 280;

const Navigation = () => {
  const { currentView, setCurrentView, isSidebarOpen, toggleSidebar } = useContext(AppContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const handleDrawerToggle = useCallback(() => {
    toggleSidebar();
  }, [toggleSidebar]);

  const navItems = useMemo(() => [
    { 
      key: 'dashboard', 
      label: 'Dashboard', 
      icon: FaTachometerAlt, 
      color: '#2563eb',
      description: 'Przegląd aplikacji'
    },
    { 
      key: 'appointments', 
      label: 'Awizacje', 
      icon: FaClipboardList, 
      color: '#dc2626',
      description: 'Zarządzanie awizacjami'
    },
    { 
      key: 'grains', 
      label: 'Słownik zbóż', 
      icon: FaSeedling, 
      color: '#16a34a',
      description: 'Rodzaje zbóż'
    },
    { 
      key: 'contractors', 
      label: 'Kontrahenci', 
      icon: FaUsers, 
      color: '#ea580c',
      description: 'Zarządzanie kontrahentami'
    },
    { 
      key: 'shippers', 
      label: 'Nadawcy', 
      icon: FaTruck, 
      color: '#0891b2',
      description: 'Zarządzanie nadawcami'
    },
    { 
      key: 'reports', 
      label: 'Raporty', 
      icon: FaChartBar, 
      color: '#9333ea',
      description: 'Analizy i raporty'
    }
  ], []);

  const handleNavigation = useCallback((viewKey) => {
    setCurrentView(viewKey);
    if (isMobile) {
      // W trybie mobile zamykamy sidebar po wybraniu elementu
      toggleSidebar();
    }
  }, [setCurrentView, isMobile, toggleSidebar]);

  const drawer = useMemo(() => (
    <>
      {/* Header */}
      <Box sx={{ 
        px: isSidebarOpen ? 3 : 2,
        py: 1.5, // Zwiększony padding pionowy
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: '68px', // Nieco wyższy niż AppBar (64px)
        display: 'flex',
        alignItems: 'center'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Avatar sx={{ 
            width: 48, 
            height: 48, 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <FaTachometerAlt />
          </Avatar>
          
          {/* Zawsze w DOM, animujemy opacity i max-width */}
          <Box sx={{ 
            flexGrow: 1,
            overflow: 'hidden',
            maxWidth: isSidebarOpen ? 200 : 0,
            opacity: isSidebarOpen ? 1 : 0,
            transition: 'max-width 0.2s ease, opacity 0.15s linear',
            willChange: 'max-width, opacity'
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#ffffff',
              fontSize: '1.125rem',
              lineHeight: 1.2,
              whiteSpace: 'nowrap'
            }}>
              AwizaxjaApp
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Navigation Items */}
      <List sx={{ pt: 2, pb: 2 }}>
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          const isActive = currentView === item.key;
          
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <Tooltip title={!isSidebarOpen ? item.description : ''} placement="right">
                <ListItemButton
                  onClick={() => handleNavigation(item.key)}
                  sx={{
                    borderRadius: 8,
                    background: isActive 
                      ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` 
                      : 'transparent',
                    color: isActive ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    py: 0.75,
                    px: isSidebarOpen ? 3 : 2,
                    // Zawsze wyrównuj do lewej, zmniejszamy jank podczas expand
                    justifyContent: 'flex-start',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` 
                        : 'transparent',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      zIndex: -1
                    },
                    '&:hover': {
                      background: isActive 
                        ? `linear-gradient(135deg, ${item.color}dd 0%, ${item.color} 100%)` 
                        : `linear-gradient(135deg, ${item.color}0a 0%, ${item.color}05 100%)`,
                      color: isActive ? '#ffffff' : '#1e293b',
                      transform: 'translateX(4px)',
                      boxShadow: isActive 
                        ? `0 4px 12px ${item.color}40` 
                        : `0 2px 8px ${item.color}20`
                    },
                    '&:active': {
                      transform: 'translateX(2px) scale(0.98)',
                      transition: 'all 0.1s ease'
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: isSidebarOpen ? 40 : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Box sx={{
                      width: isSidebarOpen ? 36 : 36,
                      height: isSidebarOpen ? 36 : 36,
                      borderRadius: '50%',
                      background: isActive ? item.color : `${item.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        invisible={!item.badge}
                      >
                        <IconComponent style={{ 
                          fontSize: isSidebarOpen ? '1.1rem' : '1.2rem',
                          color: isActive ? '#ffffff' : 'inherit',
                          filter: isActive ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'
                        }} />
                      </Badge>
                    </Box>
                  </ListItemIcon>
                  
                  {/* Zostawiamy etykietę zawsze w DOM i animujemy szerokość/opacity */}
                  <Box
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      ml: 2,
                      maxWidth: isSidebarOpen ? 200 : 0,
                      opacity: isSidebarOpen ? 1 : 0,
                      transition: 'max-width 0.2s ease, opacity 0.15s linear',
                      willChange: 'max-width, opacity'
                    }}
                  >
                    <ListItemText 
                      primary={item.label} 
                      secondary={item.description}
                      sx={{ 
                        '& .MuiTypography-root': {
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '0.875rem',
                          textShadow: isActive ? '0 1px 2px rgba(0,0,0,0.3)' : 'none'
                        },
                        '& .MuiListItemText-secondary': {
                          fontSize: '0.75rem',
                          color: isActive ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                          fontWeight: 400
                        }
                      }}
                    />
                  </Box>
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

    </>
  ), [navItems, currentView, isMobile, handleNavigation, isSidebarOpen]);

  return (
    <>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { lg: isSidebarOpen ? drawerWidth : 80 }, 
          flexShrink: { lg: 0 },
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          zIndex: 1100
        }}
      >
        {/* Mobile drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={isSidebarOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                color: '#1e293b',
                borderRadius: 0,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '4px 0 12px rgba(0,0,0,0.15)',
                height: '100vh',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          /* Desktop drawer */
          <Drawer
            variant="permanent"
            sx={{
              width: isSidebarOpen ? drawerWidth : 80,
              flexShrink: 0,
              height: '100vh',
              '& .MuiDrawer-paper': {
                width: isSidebarOpen ? drawerWidth : 80,
                boxSizing: 'border-box',
                background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                color: '#1e293b',
                height: '100vh',
                borderRadius: 0,
                borderRight: '1px solid rgba(0,0,0,0.1)',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                position: 'fixed',
                top: 0,
                left: 0,
                transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>
    </>
  );
};

export default Navigation;