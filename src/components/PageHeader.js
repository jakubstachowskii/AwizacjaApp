import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

export default function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ mb: { xs: 2, md: 2.5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.375rem' },
              lineHeight: 1.3,
              wordBreak: 'break-word'
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75, maxWidth: 720, lineHeight: 1.5, fontSize: '0.875rem' }}
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
