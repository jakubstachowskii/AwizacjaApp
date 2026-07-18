import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.025em',
              fontSize: { xs: '1.0625rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: 1.3
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75, maxWidth: 640, lineHeight: 1.55 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && (
          <Box sx={{ flexShrink: 0, '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
            {action}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
