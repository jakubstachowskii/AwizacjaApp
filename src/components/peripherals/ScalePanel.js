import React from 'react';
import {
  Box, Card, CardContent, Typography, Button, Chip, Alert, Grid
} from '@mui/material';
import { FaWeight, FaSync, FaCheck, FaCog } from 'react-icons/fa';
import useScaleReading from '../../hooks/useScaleReading';

const formatWeight = (value) => {
  if (value == null || value === '') return '0.00';
  return Number(value).toFixed(2);
};

export default function ScalePanel({
  compact = false,
  onWeightSelect,
  showConfigButton,
  onOpenConfig,
  autoStart = true
}) {
  const { reading, status, loading, error, start, readOnce } = useScaleReading({ autoStart, pollMs: 2000 });
  const connected = status.connected;
  const isMock = status.mode === 'mock' || !status.mode;

  const handleApply = () => {
    if (reading?.value != null && onWeightSelect) {
      onWeightSelect(Number(reading.value), reading.unit || 'kg');
    }
  };

  return (
    <Card variant="outlined" sx={{ height: compact ? 'auto' : '100%' }}>
      <CardContent sx={{ p: compact ? 1.5 : 2, '&:last-child': { pb: compact ? 1.5 : 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <FaWeight style={{ color: '#2563eb' }} />
          <Typography variant={compact ? 'subtitle2' : 'h6'} sx={{ fontWeight: 600 }}>
            Waga mostowa
          </Typography>
          {isMock && <Chip label="Symulacja" size="small" color="warning" />}
          {!isMock && connected && <Chip label={status.mode?.toUpperCase()} size="small" color="info" />}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            {showConfigButton && (
              <Button size="small" startIcon={<FaCog />} onClick={onOpenConfig}>
                Konfiguracja
              </Button>
            )}
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

        <Box sx={{
          textAlign: 'center',
          py: compact ? 1 : 2,
          px: 1,
          border: '2px dashed #e2e8f0',
          borderRadius: 2,
          backgroundColor: connected ? '#f0f9ff' : '#f8fafc',
          mb: 1.5
        }}>
          <Typography variant={compact ? 'h5' : 'h3'} sx={{ fontWeight: 700, color: connected ? '#2563eb' : '#64748b' }}>
            {formatWeight(reading?.value)} {reading?.unit || 'kg'}
          </Typography>
          <Chip
            icon={connected ? <FaCheck /> : undefined}
            label={connected ? 'Połączono' : 'Rozłączono'}
            color={connected ? 'success' : 'default'}
            size="small"
            sx={{ mt: 0.5 }}
          />
          {reading?.reading_datetime && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {new Date(reading.reading_datetime).toLocaleTimeString('pl-PL')}
              {reading.stable === 0 ? ' · niestabilna' : ''}
            </Typography>
          )}
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={onWeightSelect ? 6 : 12}>
            <Button
              variant="contained"
              fullWidth
              size="small"
              disabled={loading}
              startIcon={<FaSync />}
              onClick={connected ? readOnce : start}
            >
              {loading ? '…' : (connected ? 'Odśwież' : 'Połącz')}
            </Button>
          </Grid>
          {onWeightSelect && (
            <Grid item xs={6}>
              <Button variant="outlined" fullWidth size="small" disabled={!reading?.value} onClick={handleApply}>
                Pobierz wagę
              </Button>
            </Grid>
          )}
        </Grid>

        {status.host && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {status.host}:{status.port}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
