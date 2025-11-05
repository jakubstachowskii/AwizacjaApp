import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  TextField,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import { FaWeight, FaSync, FaCheck } from 'react-icons/fa';

const ScaleWidget = () => {
  const [weight, setWeight] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [lastReading, setLastReading] = useState(null);
  const [error, setError] = useState(null);

  const connectToScale = async () => {
    try {
      setIsReading(true);
      setError(null);
      
      // Symulacja połączenia z wagą
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Symulacja odczytu wagi
      const simulatedWeight = Math.random() * 1000 + 100; // 100-1100 kg
      setWeight(simulatedWeight);
      setLastReading(new Date());
      setIsConnected(true);
      
    } catch (err) {
      setError('Błąd połączenia z wagą');
      setIsConnected(false);
    } finally {
      setIsReading(false);
    }
  };

  const readWeight = async () => {
    if (!isConnected) return;
    
    try {
      setIsReading(true);
      setError(null);
      
      // Symulacja odczytu
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newWeight = Math.random() * 1000 + 100;
      setWeight(newWeight);
      setLastReading(new Date());
      
    } catch (err) {
      setError('Błąd odczytu wagi');
    } finally {
      setIsReading(false);
    }
  };

  const formatWeight = (weight) => {
    if (!weight) return '0.00';
    return weight.toFixed(2);
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pl-PL');
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FaWeight style={{ color: '#2563eb' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Waga
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ 
              textAlign: 'center', 
              py: 2,
              border: '2px dashed #e2e8f0',
              borderRadius: 2,
              backgroundColor: isConnected ? '#f0f9ff' : '#f8fafc'
            }}>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: isConnected ? '#2563eb' : '#64748b',
                mb: 1
              }}>
                {formatWeight(weight)} kg
              </Typography>
              
              <Chip
                icon={isConnected ? <FaCheck /> : null}
                label={isConnected ? 'Połączono' : 'Rozłączono'}
                color={isConnected ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                onClick={connectToScale}
                disabled={isReading}
                startIcon={<FaSync />}
                fullWidth
                sx={{
                  background: isConnected 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  '&:hover': {
                    background: isConnected 
                      ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                      : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                  }
                }}
              >
                {isReading ? 'Łączenie...' : (isConnected ? 'Odśwież' : 'Połącz')}
              </Button>
              
              {isConnected && (
                <Button
                  variant="outlined"
                  onClick={readWeight}
                  disabled={isReading}
                  startIcon={<FaWeight />}
                  fullWidth
                >
                  {isReading ? 'Odczyt...' : 'Odczytaj'}
                </Button>
              )}
            </Box>
          </Grid>

          {lastReading && (
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                Ostatni odczyt: {formatTime(lastReading)}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8fafc', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Instrukcja:</strong><br />
            1. Kliknij "Połącz" aby nawiązać połączenie z wagą<br />
            2. Użyj "Odczytaj" aby pobrać aktualną wagę<br />
            3. Waga automatycznie aktualizuje się co 5 sekund
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ScaleWidget;
