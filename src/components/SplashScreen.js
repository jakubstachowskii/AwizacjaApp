import React, { useContext, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardActionArea, CardContent, Dialog, DialogTitle,
  DialogContent, Tabs, Tab, Button, Divider, Alert
} from '@mui/material';
import { FaCog, FaArrowRight } from 'react-icons/fa';
import { AppContext } from '../App';
import Settings from './Settings';
import DatabaseTest from './DatabaseTest';
import {
  MODULE_LIST, APP_BACKGROUND, SHADOW_SM, SURFACE_BORDER, SIDEBAR_BG
} from '../theme/designTokens';
import { UI_VERSION_LABEL } from '../theme/uiVersion';
import UiVersionBadge from './UiVersionBadge';

const SplashScreen = () => {
  const { setCurrentView } = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: APP_BACKGROUND, display: 'flex', flexDirection: 'column' }}>
      {/* Ciemny pasek nagłówka — od razu widać nowy wygląd */}
      <Box
        sx={{
          bgcolor: SIDEBAR_BG,
          color: '#fff',
          px: { xs: 2, md: 4 },
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Grain Logistics
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', mt: 0.5 }}>
            System zarządzania logistyką zbożową · {UI_VERSION_LABEL}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <UiVersionBadge sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#93c5fd', border: '1px solid rgba(147,197,253,0.35)' }} />
          <Button
            variant="contained"
            size="small"
            startIcon={<FaCog size={13} />}
            onClick={() => setModalOpen(true)}
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }, boxShadow: 'none' }}
          >
            Ustawienia
          </Button>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 1080 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Nowy interfejs {UI_VERSION_LABEL} — ciemne menu boczne, jaśniejszy obszar roboczy.
          </Alert>

          <Box sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' } }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, letterSpacing: '-0.03em', mb: 1, fontSize: { xs: '1.375rem', md: '1.75rem' } }}
            >
              Wybierz moduł
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520, mx: { md: 'auto' } }}>
              Awizacje, skup, magazyn, jakość i sprzedaż.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {MODULE_LIST.map((m) => {
              const Icon = m.icon;
              return (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: `1px solid ${SURFACE_BORDER}`,
                      borderRadius: 3,
                      boxShadow: SHADOW_SM,
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 32px ${m.accent}20`,
                        borderColor: `${m.accent}50`
                      }
                    }}
                  >
                    <CardActionArea onClick={() => setCurrentView(m.view)} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2.5,
                              flexShrink: 0,
                              bgcolor: m.accent,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: `0 4px 14px ${m.accent}44`
                            }}
                          >
                            <Icon size={20} />
                          </Box>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {m.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55 }}>
                              {m.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ my: 2, opacity: 0.5 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: m.accent }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>Otwórz moduł</Typography>
                          <FaArrowRight size={12} />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pb: 1 }}>
          {isDev ? (
            <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
              <Tab label="Ustawienia" sx={{ textTransform: 'none', fontWeight: 600 }} />
              <Tab label="Test bazy danych" sx={{ textTransform: 'none', fontWeight: 600 }} />
            </Tabs>
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Ustawienia</Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto', pt: 2 }}>
          {(tab === 0 || !isDev) && <Settings />}
          {isDev && tab === 1 && <DatabaseTest />}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SplashScreen;
