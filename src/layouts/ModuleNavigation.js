import React, { useContext } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Tooltip, useTheme, useMediaQuery, Divider
} from '@mui/material';
import { FaThLarge } from 'react-icons/fa';
import { AppContext } from '../App';
import {
  DRAWER_WIDTH, DRAWER_COLLAPSED, MODULES,
  SIDEBAR_BG, SIDEBAR_TEXT, SIDEBAR_MUTED, SIDEBAR_HOVER
} from '../theme/designTokens';

export default function ModuleNavigation({
  moduleId,
  items = [],
  value,
  onChange,
  isSidebarOpen,
  onToggleSidebar
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { setCurrentView } = useContext(AppContext) || {};
  const mod = MODULES[moduleId] || MODULES.awizacje;
  const ModuleIcon = mod.icon;

  const navExpanded = isMobile || isSidebarOpen;
  const drawerWidth = isMobile ? DRAWER_WIDTH : (isSidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED);

  const handleItemClick = (item) => {
    if (item.externalView) {
      setCurrentView?.(item.externalView);
    } else {
      onChange(item.key);
    }
    if (isMobile) onToggleSidebar?.();
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          px: navExpanded ? 2 : 1.5,
          py: 2.25,
          minHeight: 68,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', width: '100%' }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: mod.accent,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${mod.accent}55`
            }}
          >
            <ModuleIcon size={17} />
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              maxWidth: navExpanded ? 180 : 0,
              opacity: navExpanded ? 1 : 0,
              transition: 'max-width 0.2s ease, opacity 0.15s linear'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.25, whiteSpace: 'nowrap', color: SIDEBAR_TEXT }}>
              {mod.title}
            </Typography>
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap', color: SIDEBAR_MUTED }}>
              Grain Logistics
            </Typography>
          </Box>
        </Box>
      </Box>

      <List sx={{ px: 1.25, py: 1.5, flex: 1, overflowY: 'auto' }}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = value === item.key && !item.externalView;
          const button = (
            <ListItemButton
              selected={active}
              onClick={() => handleItemClick(item)}
              sx={{
                borderRadius: 2,
                py: 1,
                px: navExpanded ? 1.5 : 1,
                minHeight: 42,
                mb: 0.25,
                color: active ? '#fff' : SIDEBAR_TEXT,
                bgcolor: active ? mod.accent : 'transparent',
                boxShadow: active ? `0 2px 8px ${mod.accent}66` : 'none',
                '&.Mui-selected': {
                  bgcolor: mod.accent,
                  color: '#fff',
                  '&:hover': { bgcolor: mod.accent, filter: 'brightness(1.08)' },
                  '& .MuiListItemIcon-root': { color: '#fff' }
                },
                '&:hover': {
                  bgcolor: active ? mod.accent : SIDEBAR_HOVER,
                  color: active ? '#fff' : SIDEBAR_TEXT
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: navExpanded ? 34 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                <Icon size={16} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  opacity: navExpanded ? 1 : 0,
                  maxWidth: navExpanded ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'opacity 0.15s linear, max-width 0.2s ease',
                  '& .MuiTypography-root': { fontWeight: active ? 600 : 500, fontSize: '0.875rem', lineHeight: 1.3 }
                }}
              />
            </ListItemButton>
          );

          return (
            <ListItem key={item.key} disablePadding>
              {!isMobile && !navExpanded ? (
                <Tooltip title={item.label} placement="right">{button}</Tooltip>
              ) : button}
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 1.25, py: 1.25 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => {
              setCurrentView?.('splash');
              if (isMobile) onToggleSidebar?.();
            }}
            sx={{
              borderRadius: 2,
              py: 1,
              color: SIDEBAR_MUTED,
              minHeight: 42,
              '&:hover': { bgcolor: SIDEBAR_HOVER, color: SIDEBAR_TEXT }
            }}
          >
            <ListItemIcon sx={{ minWidth: navExpanded ? 34 : 'auto', justifyContent: 'center', color: 'inherit' }}>
              <FaThLarge size={14} />
            </ListItemIcon>
            <ListItemText
              primary="Ekran startowy"
              sx={{
                opacity: navExpanded ? 1 : 0,
                maxWidth: navExpanded ? 200 : 0,
                overflow: 'hidden',
                transition: 'opacity 0.15s linear, max-width 0.2s ease',
                '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 500 }
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  const paperSx = {
    width: drawerWidth,
    boxSizing: 'border-box',
    position: 'fixed',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    transition: isMobile ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    bgcolor: SIDEBAR_BG,
    color: SIDEBAR_TEXT,
    borderRight: 'none'
  };

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={onToggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: theme.zIndex.drawer + 2,
          '& .MuiDrawer-paper': { ...paperSx, width: DRAWER_WIDTH }
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': paperSx
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
