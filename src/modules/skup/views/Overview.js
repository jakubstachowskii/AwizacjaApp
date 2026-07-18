import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, List, ListItem, ListItemText } from '@mui/material';
import { FaSeedling, FaFileAlt, FaTags, FaSync } from 'react-icons/fa';
import ContractAlerts from './ContractAlerts';
import PriceHistory from './PriceHistory';

const Overview = ({ onNavigate }) => {
  const [stats, setStats] = useState([
    { title: 'Przyjęcia dzisiaj', value: '0', icon: FaSeedling, color: '#10b981', change: '0' },
    { title: 'Dokumenty', value: '0', icon: FaFileAlt, color: '#0891b2', change: '0' },
    { title: 'Aktywne cenniki', value: '0', icon: FaTags, color: '#ea580c', change: '0' }
  ]);
  const [recentIntakes, setRecentIntakes] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [intakes, documents, prices] = await Promise.all([
        window.electronAPI.dbGetAll('skup_intakes', 'intake_datetime'),
        window.electronAPI.dbGetAll('skup_documents', 'doc_date'),
        window.electronAPI.dbGetAll('skup_prices', 'valid_from')
      ]);

      const todayIntakes = (intakes || []).filter((i) => String(i.intake_datetime || '').startsWith(today));
      const activePrices = (prices || []).filter((p) => {
        const now = today;
        return p.valid_from <= now && (!p.valid_to || p.valid_to >= now);
      });

      setStats([
        { title: 'Przyjęcia dzisiaj', value: String(todayIntakes.length), icon: FaSeedling, color: '#10b981', change: `${intakes?.length || 0} łącznie` },
        { title: 'Dokumenty', value: String((documents || []).length), icon: FaFileAlt, color: '#0891b2', change: 'w systemie' },
        { title: 'Aktywne cenniki', value: String(activePrices.length), icon: FaTags, color: '#ea580c', change: `${prices?.length || 0} wpisów` }
      ]);

      setRecentIntakes((intakes || []).slice(-5).reverse());
    } catch (e) {
      console.error('Błąd ładowania przeglądu skupu:', e);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <FaSeedling size={32} color="#10b981" />
          <Typography variant="h4" sx={{ ml: 2, fontWeight: 700, color: '#1e293b' }}>
            Przegląd Skupu
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FaSync />} onClick={loadData}
          sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' } }}>
          Odśwież
        </Button>
      </Box>

      <ContractAlerts />

      <Grid container spacing={3}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconComponent size={24} color="white" />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>{stat.title}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>{stat.change}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Ostatnie przyjęcia</Typography>
              {recentIntakes.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Brak przyjęć.</Typography>
              ) : (
                <List dense>
                  {recentIntakes.map((i) => (
                    <ListItem key={i.id} divider>
                      <ListItemText
                        primary={`#${i.id} – ${i.document_number || 'bez numeru'}`}
                        secondary={`${i.intake_datetime} | ${i.net_weight || '—'} t`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Button size="small" sx={{ mt: 1 }} onClick={() => onNavigate?.('intakes')}>Zobacz wszystkie</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <PriceHistory />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview;
