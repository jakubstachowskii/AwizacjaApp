import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = React.memo(({ message = 'Ładowanie...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: 2
      }}
    >
      <CircularProgress 
        size={40} 
        sx={{ 
          color: '#2563eb',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          fontWeight: 500,
          textAlign: 'center'
        }}
      >
        {message}
      </Typography>
    </Box>
  );
});

export default LoadingSpinner;
