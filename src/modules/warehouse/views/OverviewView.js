import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Chip, Avatar, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import { FaWarehouse, FaExchangeAlt, FaIndustry, FaChartBar, FaPlus, FaEye, FaFileAlt } from 'react-icons/fa';

const OverviewView = ({ onNavigate }) => {
  const [counters, setCounters] = useState({ warehouses: 0, stocks: 0, movements: 0 });
  const [recentMovements, setRecentMovements] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [warehouses, stocks, movements] = await Promise.all([
        window.electronAPI.dbGetAll('magazyn_warehouses', 'id'),
        window.electronAPI.dbGetAll('magazyn_stock_levels', 'id'),
        window.electronAPI.dbGetAll('magazyn_movements', 'id')
      ]);
      
      setCounters({ 
        warehouses: warehouses.length, 
        stocks: stocks.length, 
        movements: movements.length 
      });

      // Pobierz ostatnie 5 ruchów
      const recent = movements.slice(-5).reverse();
      setRecentMovements(recent);
    } catch (error) {
      console.error('Błąd ładowania danych:', error);
    }
  };

  const quickActions = [
    {
      title: 'Nowy magazyn',
      description: 'Dodaj nowy magazyn do systemu',
      icon: FaIndustry,
      color: '#2563eb',
      action: () => onNavigate('inventory')
    },
    {
      title: 'Nowy ruch',
      description: 'Zarejestruj ruch magazynowy',
      icon: FaExchangeAlt,
      color: '#10b981',
      action: () => onNavigate('movements')
    },
    {
      title: 'Raporty',
      description: 'Wygeneruj raporty magazynowe',
      icon: FaChartBar,
      color: '#7c3aed',
      action: () => onNavigate('reports')
    }
  ];

  const statsCards = [
    {
      title: 'Magazyny',
      value: counters.warehouses,
      icon: FaIndustry,
      color: '#2563eb',
      description: 'Aktywne magazyny'
    },
    {
      title: 'Stany',
      value: counters.stocks,
      icon: FaWarehouse,
      color: '#10b981',
      description: 'Pozycje magazynowe'
    },
    {
      title: 'Ruchy',
      value: counters.movements,
      icon: FaExchangeAlt,
      color: '#0891b2',
      description: 'Ruchy magazynowe'
    }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Przegląd Magazynu
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Zarządzaj magazynami, śledź stany i ruchy magazynowe
        </Typography>
      </Box>

      {/* Statystyki */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ 
                height: '100%',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ 
                      width: 48, 
                      height: 48, 
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                      mr: 2
                    }}>
                      <Icon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {stat.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {stat.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Szybkie akcje */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 3 }}>
                Szybkie akcje
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outlined"
                      startIcon={<Icon />}
                      onClick={action.action}
                      sx={{
                        justifyContent: 'flex-start',
                        p: 2,
                        borderRadius: 2,
                        borderColor: `${action.color}40`,
                        color: action.color,
                        '&:hover': {
                          borderColor: action.color,
                          background: `${action.color}10`,
                          transform: 'translateX(4px)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {action.description}
                        </Typography>
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Ostatnie ruchy */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Ostatnie ruchy
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onNavigate('movements')}
                  sx={{ color: '#0ea5e9' }}
                >
                  Zobacz wszystkie
                </Button>
              </Box>
              
              {recentMovements.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentMovements.map((movement, index) => (
                    <React.Fragment key={movement.id}>
                      <ListItem sx={{ px: 0, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            background: movement.movement_type === 'przyjecie' 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                          }}>
                            <FaExchangeAlt size={14} />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {movement.movement_type === 'przyjecie' ? 'Przyjęcie' : 'Wydanie'}
                              </Typography>
                              <Chip
                                label={movement.quantity + ' ' + movement.unit}
                                size="small"
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.7rem',
                                  background: movement.movement_type === 'przyjecie' 
                                    ? 'rgba(16, 185, 129, 0.1)' 
                                    : 'rgba(239, 68, 68, 0.1)',
                                  color: movement.movement_type === 'przyjecie' 
                                    ? '#10b981' 
                                    : '#ef4444'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {new Date(movement.created_at).toLocaleDateString('pl-PL')} • 
                              {movement.document_number && ` Dok: ${movement.document_number}`}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentMovements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <FaExchangeAlt size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Brak ostatnich ruchów magazynowych
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewView;
