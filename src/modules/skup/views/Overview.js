import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { FaSeedling, FaFileAlt, FaTags, FaSync } from 'react-icons/fa';

const Overview = () => {
  const stats = [
    {
      title: 'Przyjęcia dzisiaj',
      value: '12',
      icon: FaSeedling,
      color: '#10b981',
      change: '+3'
    },
    {
      title: 'Dokumenty',
      value: '45',
      icon: FaFileAlt,
      color: '#0891b2',
      change: '+2'
    },
    {
      title: 'Aktywne cenniki',
      value: '8',
      icon: FaTags,
      color: '#ea580c',
      change: '0'
    }
  ];

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <FaSeedling size={32} color="#10b981" />
          <Typography variant="h4" sx={{ ml: 2, fontWeight: 700, color: '#1e293b' }}>
            Przegląd Skupu
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<FaSync />}
          sx={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            },
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}
        >
          Odśwież
        </Button>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${stat.color}30`
                    }}>
                      <IconComponent size={24} color="white" />
                    </Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700, 
                      color: stat.color,
                      fontSize: '2rem'
                    }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: '#1e293b',
                    mb: 1
                  }}>
                    {stat.title}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: stat.change.startsWith('+') ? '#10b981' : '#64748b',
                    fontWeight: 500
                  }}>
                    {stat.change.startsWith('+') ? '↗' : stat.change.startsWith('-') ? '↘' : '→'} {stat.change}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Box mt={4}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1e293b',
              mb: 2
            }}>
              Ostatnie działania
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Brak ostatnich działań w module skupu.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Overview;
