import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FaClipboardList, FaUsers, FaSeedling, FaClock, FaCalendarDay } from 'react-icons/fa';
import { statusBarBoxStyles, statusChipSx } from '../theme/statusBarStyles';
import UiVersionBadge from '../components/UiVersionBadge';

const StatusBar = ({ counters }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentDate(now);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Box component="footer" sx={statusBarBoxStyles}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8125rem' }, whiteSpace: 'nowrap' }}>
          Awizacje
        </Typography>
        <Chip icon={<FaCalendarDay style={{ fontSize: '0.75rem' }} />} label={formatDate(currentDate)} size="small" sx={statusChipSx} />
        <Chip icon={<FaClock style={{ fontSize: '0.75rem' }} />} label={formatTime(currentTime)} size="small" sx={{ ...statusChipSx, display: { xs: 'none', sm: 'inline-flex' } }} />
      </Box>

      {counters && (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          <Chip icon={<FaClipboardList style={{ fontSize: '0.7rem' }} />} label={`${counters.appointments || 0} awizacji`} size="small" sx={statusChipSx} />
          <Chip icon={<FaUsers style={{ fontSize: '0.7rem' }} />} label={`${counters.contractors || 0} kontrahentów`} size="small" sx={statusChipSx} />
          <Chip icon={<FaSeedling style={{ fontSize: '0.7rem' }} />} label={`${counters.grains || 0} zbóż`} size="small" sx={statusChipSx} />
        </Box>
      )}
      <UiVersionBadge sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#93c5fd', border: '1px solid rgba(147,197,253,0.3)' }} />
    </Box>
  );
};

export default StatusBar;
