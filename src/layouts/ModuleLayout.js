import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import ModuleNavigation from './ModuleNavigation';
import ModuleAppBar from './ModuleAppBar';
import { DRAWER_WIDTH, DRAWER_COLLAPSED, APP_BACKGROUND, mainScrollStyles } from '../theme/designTokens';

export default function ModuleLayout({
  moduleTitle,
  moduleIcon,
  accentColor,
  subtitle,
  navItems,
  value,
  onChange,
  children,
  statusBar
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((s) => !s), []);

  const offset = isSidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: APP_BACKGROUND }}>
      <ModuleNavigation
        moduleTitle={moduleTitle}
        moduleIcon={moduleIcon}
        accentColor={accentColor}
        items={navItems}
        value={value}
        onChange={onChange}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, lg: `${offset}px` },
          width: { xs: '100%', lg: `calc(100% - ${offset}px)` },
          height: '100vh',
          overflow: 'hidden',
          transition: 'margin-left 0.2s ease, width 0.2s ease'
        }}
      >
        <ModuleAppBar
          title={moduleTitle}
          subtitle={subtitle}
          accentColor={accentColor}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, md: 3 },
            mt: { xs: 7, sm: 8 },
            mb: statusBar ? { xs: 3, sm: 4 } : 0,
            ...mainScrollStyles
          }}
        >
          {children}
        </Box>
        {typeof statusBar === 'function' ? statusBar({ isSidebarOpen }) : statusBar}
      </Box>
    </Box>
  );
}
