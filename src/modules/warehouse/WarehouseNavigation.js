import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Tooltip, Badge, useTheme, useMediaQuery } from '@mui/material';
import { FaHome, FaWarehouse, FaExchangeAlt, FaIndustry, FaChartBar, FaLayerGroup } from 'react-icons/fa';

const drawerWidth = 260;
const collapsedWidth = 80;

const items = [
  { key: 'overview', label: 'Przegląd', icon: FaHome, color: '#2563eb', description: 'Start modułu' },
  { key: 'inventory', label: 'Magazyny', icon: FaIndustry, color: '#16a34a', description: 'Lista magazynów i stany' },
  { key: 'batches', label: 'Partie', icon: FaLayerGroup, color: '#0ea5e9', description: 'Partie i mieszanie' },
  { key: 'movements', label: 'Ruchy', icon: FaExchangeAlt, color: '#0891b2', description: 'Ruchy magazynowe' },
  { key: 'reports', label: 'Raporty', icon: FaChartBar, color: '#059669', description: 'Raporty magazynowe' }
];

const WarehouseNavigation = ({ value, onChange, isSidebarOpen, onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerContent = (
    <>
      <Box sx={{ 
        px: isSidebarOpen ? 3 : 2,
        py: 1,
        minHeight: '64px',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%)' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
          <Avatar sx={{ width: isSidebarOpen ? 40 : 28, height: isSidebarOpen ? 40 : 28, background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 3px 10px rgba(14, 165, 233, 0.25)' }}>
            <FaWarehouse />
          </Avatar>
          <Box sx={{
            flexGrow: 1,
            overflow: 'hidden',
            maxWidth: isSidebarOpen ? 200 : 0,
            opacity: isSidebarOpen ? 1 : 0,
            transition: 'max-width 0.2s ease, opacity 0.15s linear',
            whiteSpace: 'nowrap',
            willChange: 'max-width, opacity'
          }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.125rem', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>
              Magazyn
            </Typography>
          </Box>
        </Box>
      </Box>
      <List sx={{ pt: 2, pb: 2 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = value === item.key;
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5, px: 2 }}>
              <Tooltip title={!isSidebarOpen ? item.description : ''} placement="right">
                <ListItemButton
                  onClick={() => {
                    onChange(item.key);
                    if (isMobile && onToggleSidebar) {
                      onToggleSidebar();
                    }
                  }}
                  selected={active}
                  sx={{
                    borderRadius: 8,
                    background: active ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)` : 'transparent',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    py: 0.65,
                    px: isSidebarOpen ? 2 : 1.25,
                    justifyContent: 'flex-start',
            '&:hover': {
                      background: active 
                        ? `linear-gradient(135deg, ${item.color}dd 0%, ${item.color} 100%)` 
                        : `linear-gradient(135deg, ${item.color}0a 0%, ${item.color}05 100%)`,
                      color: active ? '#ffffff' : '#1e293b',
              transform: 'translateX(2px)',
              boxShadow: active ? `0 3px 10px ${item.color}35` : `0 1px 6px ${item.color}15`
                    },
                    '&:active': {
              transform: 'translateX(1px) scale(0.99)',
                      transition: 'all 0.1s ease'
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isSidebarOpen ? 32 : 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: isSidebarOpen ? 1.5 : 0
                    }}
                  >
                    <Box sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: active ? 'rgba(255,255,255,0.22)' : `${item.color}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      border: active ? `1px solid rgba(255,255,255,0.35)` : '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <Icon style={{
                        fontSize: isSidebarOpen ? '0.95rem' : '1rem',
                        color: active ? '#ffffff' : item.color
                      }} />
                    </Box>
                  </ListItemIcon>
                  {isSidebarOpen && (
                    <ListItemText
                      primary={item.label}
                      secondary={item.description}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: active ? 600 : 500,
                          fontSize: '0.9rem',
                          color: active ? '#ffffff' : '#1e293b'
                        }
                      }}
                      secondaryTypographyProps={{
                        sx: {
                          fontSize: '0.75rem',
                          color: active ? 'rgba(255,255,255,0.8)' : '#64748b',
                          mt: 0.25
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box component="nav" sx={{ 
      width: { lg: isSidebarOpen ? drawerWidth : collapsedWidth }, 
      flexShrink: { lg: 0 }, 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0, 
      zIndex: 1100 
    }}>
      {isMobile ? (
        <Drawer 
          variant="temporary" 
          open={isSidebarOpen} 
          onClose={onToggleSidebar} 
          ModalProps={{ keepMounted: true }} 
          sx={{ 
            display: { xs: 'block', md: 'none' }, 
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRight: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '4px 0 12px rgba(0,0,0,0.08)'
            } 
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer 
          variant="permanent" 
          sx={{ 
            width: isSidebarOpen ? drawerWidth : collapsedWidth, 
            flexShrink: 0, 
            height: '100vh', 
            '& .MuiDrawer-paper': { 
              width: isSidebarOpen ? drawerWidth : collapsedWidth, 
              boxSizing: 'border-box', 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              borderRadius: 0,
              background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRight: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '4px 0 12px rgba(0,0,0,0.08)',
              transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            } 
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default WarehouseNavigation;


