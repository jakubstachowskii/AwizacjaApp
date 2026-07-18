import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton } from '@mui/material';
import { useTheme } from '@mui/material';
import { FaBars } from 'react-icons/fa';
import { MODULES } from '../theme/designTokens';
import ModuleSwitcher from '../components/shell/ModuleSwitcher';
import UiVersionBadge from '../components/UiVersionBadge';

export default function ModuleAppBar({
  moduleId,
  onToggleSidebar
}) {
  const theme = useTheme();
  const mod = MODULES[moduleId] || MODULES.awizacje;

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        width: '100%',
        top: 0,
        bgcolor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: theme.zIndex.appBar
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 2, md: 3 }, minHeight: { xs: 56, sm: 60 }, gap: 1.5 }}>
        <IconButton
          edge="start"
          onClick={onToggleSidebar}
          sx={{ color: 'text.secondary', bgcolor: 'rgba(15,23,42,0.04)', '&:hover': { bgcolor: 'rgba(15,23,42,0.07)' } }}
          aria-label="Menu"
        >
          <FaBars size={15} />
        </IconButton>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}
          >
            {mod.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.3 }}
          >
            {mod.subtitle}
          </Typography>
        </Box>

        <ModuleSwitcher currentModuleId={moduleId} />
        <UiVersionBadge sx={{ display: { xs: 'none', md: 'flex' } }} />
      </Toolbar>
    </AppBar>
  );
}
