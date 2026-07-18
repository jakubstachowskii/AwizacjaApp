import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FaFlask, FaCertificate, FaClipboardCheck, FaClock, FaCalendarDay } from 'react-icons/fa';
import { statusBarBoxStyles, statusChipSx } from '../../theme/statusBarStyles';

const QualityStatusBar = ({ counters }) => {
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
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '0.65rem', sm: '0.75rem' }, whiteSpace: 'nowrap' }}>
          Jakość
        </Typography>
        <Chip icon={<FaCalendarDay size={10} />} label={formatDate(currentDate)} size="small" sx={statusChipSx} />
        <Chip icon={<FaClock size={10} />} label={formatTime(currentTime)} size="small" sx={{ ...statusChipSx, display: { xs: 'none', sm: 'inline-flex' } }} />
      </Box>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        <Chip icon={<FaFlask size={12} />} label={`Badania: ${counters?.tests || 0}`} size="small" sx={statusChipSx} />
        <Chip icon={<FaCertificate size={12} />} label={`Certyfikaty: ${counters?.certificates || 0}`} size="small" sx={statusChipSx} />
        <Chip icon={<FaClipboardCheck size={12} />} label={`Procesy: ${counters?.processes || 0}`} size="small" sx={statusChipSx} />
      </Box>
    </Box>
  );
};

export default QualityStatusBar;
