import React, { useCallback, useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Button, Chip, Alert, Divider, List, ListItem, ListItemText
} from '@mui/material';
import { FaNetworkWired, FaFlask, FaPrint } from 'react-icons/fa';
import PageHeader from '../PageHeader';
import DataPanel from '../DataPanel';
import ScalePanel from './ScalePanel';
import ScaleConfigDialog from '../../modules/skup/components/ScaleConfigDialog';

const MODULE_COPY = {
  awizacje: {
    title: 'Środowisko urządzeń — Awizacje',
    subtitle: 'Waga mostowa i drukarka WZ przy bramie wjazdowej'
  },
  skup: {
    title: 'Środowisko urządzeń — Skup',
    subtitle: 'Waga mostowa przy przyjęciach i stanowisko ważenia'
  },
  magazyn: {
    title: 'Środowisko urządzeń — Magazyn',
    subtitle: 'Waga przy wydaniach WZ/PZ i czytnik kodów partii'
  },
  sprzedaz: {
    title: 'Środowisko urządzeń — Sprzedaż',
    subtitle: 'Waga przy załadunku i drukarka dokumentów wysyłkowych'
  }
};

export default function PeripheralEnvironment({ moduleId = 'awizacje' }) {
  const copy = MODULE_COPY[moduleId] || MODULE_COPY.awizacje;
  const [scaleConfigOpen, setScaleConfigOpen] = useState(false);
  const [scaleStatus, setScaleStatus] = useState(null);
  const [savedHint, setSavedHint] = useState('');

  const refreshScaleStatus = useCallback(async () => {
    if (window.electronAPI?.scaleGetStatus) {
      setScaleStatus(await window.electronAPI.scaleGetStatus());
    }
  }, []);

  useEffect(() => { refreshScaleStatus(); }, [refreshScaleStatus]);

  const handleConfigSaved = () => {
    setScaleConfigOpen(false);
    setSavedHint('Konfiguracja wagi zapisana. Uruchom ponownie połączenie.');
    refreshScaleStatus();
    setTimeout(() => setSavedHint(''), 4000);
  };

  return (
    <Box>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      {savedHint && <Alert severity="success" sx={{ mb: 2 }}>{savedHint}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <ScalePanel
            autoStart
            showConfigButton
            onOpenConfig={() => setScaleConfigOpen(true)}
          />
        </Grid>

        <Grid item xs={12} md={7}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Status połączeń sieciowych</Typography>
          <DataPanel>
            <List dense disablePadding sx={{ px: 2, pt: 1 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaNetworkWired />
                      <Typography variant="subtitle2">Waga mostowa (TCP/RS232)</Typography>
                      <Chip
                        size="small"
                        label={scaleStatus?.connected ? 'Online' : 'Offline'}
                        color={scaleStatus?.connected ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    scaleStatus?.mode === 'tcp'
                      ? `${scaleStatus.host || '—'}:${scaleStatus.port || '—'}`
                      : `Tryb: ${scaleStatus?.mode || 'symulacja'}`
                  }
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FaPrint />
                      <Typography variant="subtitle2">Drukarka dokumentów</Typography>
                      <Chip size="small" label="Ręczny eksport PDF" />
                    </Box>
                  }
                  secondary="Integracja sieciowa drukarki — planowana w kolejnej wersji"
                />
              </ListItem>
              {(moduleId === 'magazyn' || moduleId === 'sprzedaz') && (
                <>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaFlask />
                          <Typography variant="subtitle2">Czytnik kodów / RFID</Typography>
                          <Chip size="small" label="Przygotowane" color="info" />
                        </Box>
                      }
                      secondary="Skaner sieciowy USB/Ethernet — mapowanie partii i numerów WZ"
                    />
                  </ListItem>
                </>
              )}
            </List>

            <Box sx={{ mt: 2, mx: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="outlined" size="small" onClick={() => setScaleConfigOpen(true)}>
                Konfiguruj wagę
              </Button>
              <Button variant="outlined" size="small" onClick={refreshScaleStatus}>
                Odśwież status
              </Button>
            </Box>

            <Alert severity="info" sx={{ mt: 2, mx: 2, mb: 2 }}>
              Urządzenia sieciowe (TCP/IP) łączą się z aplikacją przez proces Electron.
              Waga Radwag/Sartorius/Mettler: ustaw adres IP i port w konfiguracji, następnie kliknij „Połącz”.
            </Alert>
          </DataPanel>
        </Grid>
      </Grid>

      <ScaleConfigDialog
        open={scaleConfigOpen}
        onClose={() => setScaleConfigOpen(false)}
        onSaved={handleConfigSaved}
      />
    </Box>
  );
}
