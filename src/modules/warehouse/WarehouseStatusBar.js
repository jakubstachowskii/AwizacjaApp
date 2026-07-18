import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FaWarehouse, FaIndustry, FaExchangeAlt, FaClock, FaCalendarDay } from 'react-icons/fa';
import { statusBarBoxStyles, statusChipSx } from '../../theme/statusBarStyles';

const WarehouseStatusBar = ({ counters }) => {
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
          Magazyn
        </Typography>
        <Chip icon={<FaCalendarDay size={10} />} label={formatDate(currentDate)} size="small" sx={statusChipSx} />
        <Chip icon={<FaClock size={10} />} label={formatTime(currentTime)} size="small" sx={{ ...statusChipSx, display: { xs: 'none', sm: 'inline-flex' } }} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        <Chip icon={<FaWarehouse size={12} />} label={`Magazyny: ${counters?.warehouses || 0}`} size="small" sx={statusChipSx} />
        <Chip icon={<FaIndustry size={12} />} label={`Stany: ${counters?.stocks || 0}`} size="small" sx={statusChipSx} />
        <Chip icon={<FaExchangeAlt size={12} />} label={`Ruchy: ${counters?.movements || 0}`} size="small" sx={statusChipSx} />
      </Box>
    </Box>
  );
};

export default WarehouseStatusBar;
