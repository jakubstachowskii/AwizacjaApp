import React from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { SHADOW_SM, SURFACE_BORDER } from '../theme/designTokens';

export default function StatCard({ title, value, accent, onOpen }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${SURFACE_BORDER}`,
        borderRadius: 3,
        height: '100%',
        boxShadow: SHADOW_SM,
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: `${accent}33`,
          boxShadow: `0 8px 24px ${accent}18`
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, color: accent, letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${accent}12`,
              border: `1px solid ${accent}22`,
              flexShrink: 0
            }}
          />
        </Box>
        <Button
          size="small"
          variant="text"
          onClick={onOpen}
          sx={{ color: accent, fontWeight: 600, px: 0, mt: 2, '&:hover': { bgcolor: `${accent}0a` } }}
        >
          Otwórz →
        </Button>
      </CardContent>
    </Card>
  );
}
