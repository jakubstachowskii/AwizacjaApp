import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { FaClipboardList, FaUsers, FaSeedling, FaClock, FaCalendarDay } from 'react-icons/fa';

const StatusBar = ({ counters, isSidebarOpen }) => {
  const drawerWidth = 280;
  const collapsedWidth = 80;
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 0,
      left: { xs: 0, lg: isSidebarOpen ? `${drawerWidth}px` : `${collapsedWidth}px` },
      right: 0,
      width: {
        xs: '100%',
        lg: isSidebarOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${collapsedWidth}px)`
      },
      height: { xs: '24px', sm: '32px' },
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: { xs: 1, sm: 2 },
      zIndex: 1000,
      boxShadow: '0 -2px 8px rgba(30, 41, 59, 0.15)',
      transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ 
          color: 'white', 
          fontWeight: 600,
          fontSize: { xs: '0.7rem', sm: '0.75rem' }
        }}>
          Moduł Awizacji
        </Typography>
        <Chip
          icon={<FaCalendarDay style={{ fontSize: '0.6rem' }} />}
          label={formatDate(currentDate)}
          size="small"
          sx={{
            height: { xs: '16px', sm: '20px' },
            fontSize: { xs: '0.6rem', sm: '0.7rem' },
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '& .MuiChip-icon': {
              color: 'white',
              fontSize: { xs: '0.6rem', sm: '0.7rem' }
            }
          }}
        />
        <Chip
          icon={<FaClock style={{ fontSize: '0.6rem' }} />}
          label={formatTime(currentTime)}
          size="small"
          sx={{
            height: { xs: '16px', sm: '20px' },
            fontSize: { xs: '0.6rem', sm: '0.7rem' },
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '& .MuiChip-icon': {
              color: 'white',
              fontSize: { xs: '0.6rem', sm: '0.7rem' }
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        {counters && (
          <>
            <Chip
              icon={<FaClipboardList style={{ fontSize: '0.7rem' }} />}
              label={`${counters.appointments || 0} awizacji`}
              size="small"
              sx={{
                height: { xs: '16px', sm: '20px' },
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }
              }}
            />
            <Chip
              icon={<FaUsers style={{ fontSize: '0.7rem' }} />}
              label={`${counters.contractors || 0} kontrahentów`}
              size="small"
              sx={{
                height: { xs: '16px', sm: '20px' },
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }
              }}
            />
            <Chip
              icon={<FaSeedling style={{ fontSize: '0.7rem' }} />}
              label={`${counters.grains || 0} zbóż`}
              size="small"
              sx={{
                height: { xs: '16px', sm: '20px' },
                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-icon': {
                  color: 'white',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' }
                }
              }}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default StatusBar;
