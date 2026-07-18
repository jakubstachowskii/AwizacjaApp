import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FaClock, FaCalendarDay } from 'react-icons/fa';
import { DRAWER_WIDTH, DRAWER_COLLAPSED } from '../theme/designTokens';

export default function ModuleStatusBar({ moduleLabel, isSidebarOpen, stats = [] }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const offset = isSidebarOpen ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: { xs: 0, lg: `${offset}px` },
        right: 0,
        width: { xs: '100%', lg: `calc(100% - ${offset}px)` },
        height: { xs: 28, sm: 32 },
        bgcolor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 2 },
        zIndex: 1000,
        transition: 'left 0.2s ease, width 0.2s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
          {moduleLabel}
        </Typography>
        <Chip
          icon={<FaCalendarDay size={10} />}
          label={now.toLocaleDateString('pl-PL')}
          size="small"
          sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', '& .MuiChip-icon': { color: '#fff' } }}
        />
        <Chip
          icon={<FaClock size={10} />}
          label={now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          size="small"
          sx={{ height: 20, fontSize: '0.65rem', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', '& .MuiChip-icon': { color: '#fff' }, display: { xs: 'none', sm: 'inline-flex' } }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, overflow: 'hidden' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Chip
              key={i}
              icon={Icon ? <Icon size={10} /> : undefined}
              label={s.label}
              size="small"
              sx={{
                height: { xs: 20, sm: 22 },
                fontSize: '0.65rem',
                bgcolor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '& .MuiChip-icon': { color: '#fff' },
                display: { xs: i > 1 ? 'none' : 'inline-flex', md: 'inline-flex' }
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
