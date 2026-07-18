import React from 'react';
import { Chip } from '@mui/material';
import { UI_VERSION_LABEL } from '../theme/uiVersion';

export default function UiVersionBadge({ sx }) {
  return (
    <Chip
      label={UI_VERSION_LABEL}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.6875rem',
        fontWeight: 700,
        bgcolor: 'rgba(37, 99, 235, 0.12)',
        color: '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        ...sx
      }}
    />
  );
}
