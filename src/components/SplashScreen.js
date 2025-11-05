import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, Avatar, IconButton, Dialog, DialogTitle, DialogContent, Tabs, Tab } from '@mui/material';
import { FaClipboardList, FaStore, FaCog, FaWarehouse } from 'react-icons/fa';
import { AppContext } from '../App';
import Settings from './Settings';
import DatabaseTest from './DatabaseTest';

const SplashScreen = () => {
  const { setCurrentView } = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    // Okno już jest w trybie aplikacji od startu, nie trzeba przełączać
    // if (window?.electronAPI?.setWindowMode) {
    //   window.electronAPI.setWindowMode('splash');
    // }
  }, []);

  const goAwizacje = () => {
    // Okno już jest w trybie aplikacji, tylko przełącz widok
    setCurrentView('dashboard');
  };

  const goSkup = () => {
    // Okno już jest w trybie aplikacji, tylko przełącz widok
    setCurrentView('skup');
  };
  const goWarehouse = () => {
    setCurrentView('magazyn');
  };

  const modules = [
    {
      key: 'awizacje',
      title: 'Awizacje',
      description: 'Przejdź do istniejącej aplikacji Awizacje',
      icon: FaClipboardList,
      color: '#dc2626',
      onClick: goAwizacje
    },
    {
      key: 'skup',
      title: 'Skup',
      description: 'Nowy moduł – w przygotowaniu',
      icon: FaStore,
      color: '#0ea5e9',
      onClick: goSkup
    },
    {
      key: 'magazyn',
      title: 'Magazyn',
      description: 'Stany, ruchy, inwentaryzacja',
      icon: FaWarehouse,
      color: '#10b981',
      onClick: goWarehouse
    }
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none'
      }
    }}>
      {/* Settings button */}
      <IconButton
        onClick={() => setModalOpen(true)}
        sx={{ position: 'absolute', top: 16, left: 16, color: '#64748b', '&:hover': { background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' } }}
        title="Ustawienia i test bazy"
        aria-label="Ustawienia"
      >
        <FaCog />
      </IconButton>

      <Box sx={{ width: '100%', maxWidth: 1000, px: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>
            Wybierz moduł
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#475569' }}>
            To ekran startowy całej aplikacji. Wybierz, z którym modułem chcesz pracować.
          </Typography>
        </Box>

        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Grid item xs={12} sm={6} md={5} lg={4} key={m.key} display="flex">
                <Card elevation={3} sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  width: '100%'
                }}>
                  <CardActionArea onClick={m.onClick} sx={{
                    p: 3,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 10px 20px ${m.color}22`
                    }
                  }}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Avatar sx={{
                        width: 56,
                        height: 56,
                        background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}dd 100%)`,
                        boxShadow: `0 6px 14px ${m.color}44`
                      }}>
                        <Icon style={{ color: '#fff', fontSize: 24 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {m.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#475569', mt: 0.5 }}>
                          {m.description}
                        </Typography>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
            <Tab label="Ustawienia" />
            <Tab label="Test bazy danych" />
          </Tabs>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflow: 'auto', pt: 2 }}>
          {tab === 0 && (
            <Box sx={{ p: { xs: 0, md: 1 } }}>
              <Settings />
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ p: { xs: 0, md: 1 } }}>
              <DatabaseTest />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SplashScreen;
