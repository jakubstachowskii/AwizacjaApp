import React from 'react';
import { Paper, Box } from '@mui/material';
import { SHADOW_SM, SURFACE_BORDER } from '../theme/designTokens';

export default function DataPanel({ children, noPadding }) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${SURFACE_BORDER}`,
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        width: '100%',
        boxShadow: SHADOW_SM
      }}
    >
      <Box sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        ...(noPadding ? {} : { p: 0 })
      }}>
        {children}
      </Box>
    </Paper>
  );
}
