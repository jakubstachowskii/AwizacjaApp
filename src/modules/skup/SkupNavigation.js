import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Tooltip, Badge, useTheme, useMediaQuery } from '@mui/material';
import { FaHome, FaDownload, FaTruck, FaUsers, FaTags, FaChartBar, FaFileAlt, FaWarehouse, FaBoxes } from 'react-icons/fa';

const drawerWidth = 260;
const collapsedWidth = 80;

const items = [
  { key: 'overview', label: 'Przegląd', icon: FaHome, color: '#2563eb', description: 'Start modułu' },
  { key: 'intakes', label: 'Przyjęcia', icon: FaDownload, color: '#16a34a', description: 'Rejestr przyjęć' },
  { key: 'deliveries', label: 'Dostawy', icon: FaTruck, color: '#0891b2', description: 'Wydania/dostawy' },
  { key: 'contractors', label: 'Kontrahenci', icon: FaUsers, color: '#ea580c', description: 'Słownik kontrahentów' },
  { key: 'pricing', label: 'Cenniki', icon: FaTags, color: '#9333ea', description: 'Ceny skupu' },
  { key: 'documents', label: 'Dokumenty', icon: FaFileAlt, color: '#475569', description: 'Dokumenty powiązane' },
  { key: 'contracts', label: 'Kontrakty', icon: FaFileAlt, color: '#dc2626', description: 'Zarządzanie kontraktami' },
  { key: 'quality_rules', label: 'Reguły potrąceń', icon: FaTags, color: '#7c3aed', description: 'Reguły jakości' },
  { key: 'warehouse', label: 'Magazyn', icon: FaBoxes, color: '#0ea5e9', description: 'Stany i ruchy' },
  { key: 'reports', label: 'Raporty', icon: FaChartBar, color: '#059669', description: 'Analiza i raporty' }
];

const SkupNavigation = ({ value, onChange, isSidebarOpen, onToggleSidebar }) => {
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
        <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)' }} />
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
          <Avatar sx={{ width: isSidebarOpen ? 48 : 32, height: isSidebarOpen ? 48 : 32, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.125rem', lineHeight: 1.2 }}>
              Skup
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ pt: 2, pb: 2 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = value === item.key;
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5, px: 1 }}>
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
                    py: 0.75,
                    px: isSidebarOpen ? 3 : 2,
                    justifyContent: 'flex-start',
                    '&:hover': {
                      background: active 
                        ? `linear-gradient(135deg, ${item.color}dd 0%, ${item.color} 100%)` 
                        : `linear-gradient(135deg, ${item.color}0a 0%, ${item.color}05 100%)`,
                      color: active ? '#ffffff' : '#1e293b',
                      transform: 'translateX(4px)',
                      boxShadow: active ? `0 4px 12px ${item.color}40` : `0 2px 8px ${item.color}20`
                    },
                    '&:active': {
                      transform: 'translateX(2px) scale(0.98)',
                      transition: 'all 0.1s ease'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: isSidebarOpen ? 40 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: active ? item.color : `${item.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Badge>
                        <Icon style={{ fontSize: isSidebarOpen ? '1.1rem' : '1.2rem', color: active ? '#ffffff' : 'inherit', filter: active ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none' }} />
                      </Badge>
                    </Box>
                  </ListItemIcon>
                  <Box sx={{
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    ml: 2,
                    maxWidth: isSidebarOpen ? 200 : 0,
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'max-width 0.2s ease, opacity 0.15s linear',
                    willChange: 'max-width, opacity'
                  }}>
                    <ListItemText 
                      primary={item.label} 
                      secondary={item.description}
                      sx={{ 
                        '& .MuiTypography-root': { fontWeight: active ? 600 : 500, fontSize: '0.875rem', textShadow: active ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' },
                        '& .MuiListItemText-secondary': { fontSize: '0.75rem', color: active ? 'rgba(255,255,255,0.7)' : '#94a3b8', fontWeight: 400 }
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
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { lg: isSidebarOpen ? drawerWidth : collapsedWidth }, 
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
          onClose={onToggleSidebar}
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
          {drawerContent}
        </Drawer>
      ) : (
        /* Desktop drawer */
        <Drawer
          variant="permanent"
          sx={{
            width: isSidebarOpen ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            height: '100vh',
            '& .MuiDrawer-paper': {
              width: isSidebarOpen ? drawerWidth : collapsedWidth,
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
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default SkupNavigation;