import React from 'react';
import { Box } from '@mui/material';
import { APP_BACKGROUND, shellColumnStyles, shellMainStyles } from '../theme/designTokens';
import ModuleNavigation from './ModuleNavigation';
import ModuleAppBar from './ModuleAppBar';
import { useShellSidebar } from '../hooks/useShellSidebar';

export default function ModuleShellLayout({
  moduleId,
  navItems,
  value,
  onChange,
  children,
  statusBar: StatusBarComponent,
  statusBarProps = {}
}) {
  const { isSidebarOpen, toggleSidebar } = useShellSidebar();

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100%', bgcolor: APP_BACKGROUND, overflow: 'hidden' }}>
      <ModuleNavigation
        moduleId={moduleId}
        items={navItems}
        value={value}
        onChange={onChange}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
      />
      <Box sx={shellColumnStyles}>
        <Box sx={{ height: 3, bgcolor: 'primary.main', flexShrink: 0, width: '100%' }} />
        <ModuleAppBar moduleId={moduleId} isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <Box component="main" sx={shellMainStyles}>
          <Box sx={{ width: '100%', maxWidth: '100%' }}>
            {children}
          </Box>
        </Box>
        {StatusBarComponent && (
          <StatusBarComponent isSidebarOpen={isSidebarOpen} {...statusBarProps} />
        )}
      </Box>
    </Box>
  );
}
