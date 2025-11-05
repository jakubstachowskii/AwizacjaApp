import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaPlus,
  FaHistory,
  FaSeedling,
  FaBuilding,
  FaTachometerAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaCalendarAlt
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';

const Dashboard = () => {
  const { appointments, contractors, grains, loading, setCurrentView } = useContext(AppContext);
  const { showSuccess, showError } = useNotification();
  const [activeTab, setActiveTab] = useState(0);
  
  // Filtry
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [contractorFilter, setContractorFilter] = useState('all');
  const [grainFilter, setGrainFilter] = useState('all');
  
  // Funkcja filtrowania
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    // Filtrowanie po dacie
    if (dateFilter !== 'all') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(app => {
            const appDate = new Date(app.datetime);
            return appDate >= startOfDay && appDate < endOfDay;
          });
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(app => new Date(app.datetime) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          filtered = filtered.filter(app => new Date(app.datetime) >= monthAgo);
          break;
      }
    }
    
    // Filtrowanie po statusie
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Filtrowanie po typie
    if (typeFilter !== 'all') {
      filtered = filtered.filter(app => app.type === typeFilter);
    }
    
    // Filtrowanie po kontrahencie
    if (contractorFilter !== 'all') {
      filtered = filtered.filter(app => app.contractor_id === parseInt(contractorFilter));
    }
    
    // Filtrowanie po zbożu
    if (grainFilter !== 'all') {
      filtered = filtered.filter(app => app.grain_id === parseInt(grainFilter));
    }
    
    return filtered;
  }, [appointments, dateFilter, statusFilter, typeFilter, contractorFilter, grainFilter]);
  
  // Obliczanie zaawansowanych statystyk
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const active = filteredAppointments.filter(app => app.status === 'w_trakcie').length;
    const completed = filteredAppointments.filter(app => app.status === 'zakończona').length;
    const pending = filteredAppointments.filter(app => app.status === 'oczekująca').length;
    const cancelled = filteredAppointments.filter(app => app.status === 'anulowana').length;
    
    const deliveries = filteredAppointments.filter(app => app.type === 'dostawa').length;
    const pickups = filteredAppointments.filter(app => app.type === 'odbiór').length;
    
    const totalQuantity = filteredAppointments
      .filter(app => app.quantity)
      .reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = filteredAppointments.filter(app => 
      app.datetime && app.datetime.startsWith(today)
    ).length;
    
    return { 
      total, active, completed, pending, cancelled, 
      deliveries, pickups, totalQuantity, todayAppointments 
    };
  }, [filteredAppointments]);

  // Najnowsze awizacje z dodatkowymi informacjami
  const recentAppointments = useMemo(() => {
    return filteredAppointments
      .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
      .slice(0, 8)
      .map(app => ({
        id: app.id,
        plate: app.plate_number,
        contractor: contractors.find(c => c.id === app.contractor_id)?.name || 'Nieznany',
        status: app.status,
        datetime: new Date(app.datetime).toLocaleString('pl-PL'),
        type: app.type,
        quantity: app.quantity,
        grain: grains.find(g => g.id === app.grain_id)?.name || 'Nieznane',
        grainUnit: grains.find(g => g.id === app.grain_id)?.unit || 't',
        notes: app.notes
      }));
  }, [filteredAppointments, contractors, grains]);

  // Statystyki kontrahentów
  const contractorStats = useMemo(() => {
    const stats = {};
    filteredAppointments.forEach(app => {
      const contractor = contractors.find(c => c.id === app.contractor_id);
      if (contractor) {
        if (!stats[contractor.name]) {
          stats[contractor.name] = { count: 0, totalQuantity: 0 };
        }
        stats[contractor.name].count++;
        if (app.quantity) {
          stats[contractor.name].totalQuantity += parseFloat(app.quantity);
        }
      }
    });
    return Object.entries(stats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 5);
  }, [filteredAppointments, contractors]);

  // Statystyki zbóż
  const grainStats = useMemo(() => {
    const stats = {};
    filteredAppointments.forEach(app => {
      const grain = grains.find(g => g.id === app.grain_id);
      if (grain && app.quantity) {
        if (!stats[grain.name]) {
          stats[grain.name] = { quantity: 0, unit: grain.unit };
        }
        stats[grain.name].quantity += parseFloat(app.quantity);
      }
    });
    return Object.entries(stats)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredAppointments, grains]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'w_trakcie': return 'success';
      case 'oczekująca': return 'warning';
      case 'zakończona': return 'info';
      case 'anulowana': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'w_trakcie': return 'W trakcie';
      case 'oczekująca': return 'Oczekuje';
      case 'zakończona': return 'Zakończone';
      case 'anulowana': return 'Anulowane';
      default: return 'Nieznany';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'dostawa': return 'Dostawa';
      case 'odbiór': return 'Odbiór';
      default: return 'Nieznany';
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'new-appointment':
        setCurrentView('appointments');
        break;
      case 'contractors':
        setCurrentView('contractors');
        break;
      case 'reports':
        setCurrentView('reports');
        break;
      case 'grains':
        setCurrentView('grains');
        break;
      default:
        break;
    }
  };

  const handleAppointmentAction = (appointmentId, action) => {
    switch (action) {
      case 'view':
        setCurrentView('appointments');
        break;
      case 'edit':
        setCurrentView('appointments');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Nagłówek Dashboard */}
      <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#1e293b', 
          mb: 1,
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
        }}>
          <FaTachometerAlt style={{ marginRight: '12px', verticalAlign: 'middle' }} />
          Panel Kontrolny
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}>
          Przegląd awizacji i statystyk systemu zarządzania punktem skupu zbóż
        </Typography>
      </Box>

      {/* Filtry */}
      <Card sx={{ mb: { xs: 2, sm: 3, md: 4 }, p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          mb: 2,
          fontSize: { xs: '1rem', sm: '1.25rem' }
        }}>
          🔍 Filtry
        </Typography>
        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Okres</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Okres"
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="today">Dzisiaj</MenuItem>
                <MenuItem value="week">Ostatni tydzień</MenuItem>
                <MenuItem value="month">Ostatni miesiąc</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="oczekująca">Oczekujące</MenuItem>
                <MenuItem value="w_trakcie">W trakcie</MenuItem>
                <MenuItem value="zakończona">Zakończone</MenuItem>
                <MenuItem value="anulowana">Anulowane</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Typ</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Typ"
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="dostawa">Dostawa</MenuItem>
                <MenuItem value="odbiór">Odbiór</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Kontrahent</InputLabel>
              <Select
                value={contractorFilter}
                onChange={(e) => setContractorFilter(e.target.value)}
                label="Kontrahent"
              >
                <MenuItem value="all">Wszyscy kontrahenci</MenuItem>
                {contractors.map((contractor) => (
                  <MenuItem key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Zboże</InputLabel>
              <Select
                value={grainFilter}
                onChange={(e) => setGrainFilter(e.target.value)}
                label="Zboże"
              >
                <MenuItem value="all">Wszystkie zboża</MenuItem>
                {grains.map((grain) => (
                  <MenuItem key={grain.id} value={grain.id}>
                    {grain.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
              <Chip 
                label={`Wyniki: ${filteredAppointments.length}`} 
                color="primary" 
                size="small" 
              />
              {(dateFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || contractorFilter !== 'all' || grainFilter !== 'all') && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setDateFilter('all');
                    setStatusFilter('all');
                    setTypeFilter('all');
                    setContractorFilter('all');
                    setGrainFilter('all');
                  }}
                >
                  Wyczyść filtry
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Karty statystyk */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Wszystkie awizacje
                  </Typography>
                </Box>
                <FaTruck size={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.active}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    W trakcie realizacji
                  </Typography>
                </Box>
                <FaClock size={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Oczekujące
                  </Typography>
                </Box>
                <FaHistory size={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '50%'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.completed}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Zakończone
                  </Typography>
                </Box>
                <FaCheckCircle size={32} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dodatkowe statystyki */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#10b981' }}>
                  <FaArrowDown />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.deliveries}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dostawy
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#f59e0b' }}>
                  <FaArrowUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.pickups}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Odbiory
          </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#8b5cf6' }}>
                  <FaSeedling />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.totalQuantity.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tys. ton łącznie
                  </Typography>
                </Box>
          </Box>
        </CardContent>
      </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
      <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#2563eb' }}>
                  <FaCalendarAlt />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {stats.todayAppointments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dzisiaj
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Główna zawartość z zakładkami */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Najnowsze awizacje" />
            <Tab label="Top kontrahenci" />
            <Tab label="Statystyki zbóż" />
          </Tabs>
        </Box>

        <CardContent>
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Najnowsze awizacje
            </Typography>
                <Button
                  variant="contained"
                  startIcon={<FaPlus />}
                  onClick={() => handleQuickAction('new-appointment')}
                  sx={{ borderRadius: 2 }}
                >
                  Nowa awizacja
                </Button>
          </Box>

              {recentAppointments.length > 0 ? (
                <TableContainer 
                  component={Paper} 
                  variant="outlined"
                  sx={{ 
                    overflowX: 'auto',
                    '& .MuiTable-root': {
                      minWidth: { xs: 700, md: 'auto' }
                    }
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: 120 }}>Numer rej.</TableCell>
                        <TableCell sx={{ minWidth: 150 }}>Kontrahent</TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>Typ</TableCell>
                        <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>Zboże</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                        <TableCell sx={{ minWidth: 120, display: { xs: 'none', sm: 'table-cell' } }}>Data</TableCell>
                        <TableCell sx={{ minWidth: 100 }}>Akcje</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentAppointments.map((appointment) => (
                        <TableRow key={appointment.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {appointment.plate}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {appointment.contractor}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getTypeText(appointment.type)}
                              size="small"
                              color={appointment.type === 'dostawa' ? 'primary' : 'secondary'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FaSeedling size={14} />
                              <Typography variant="body2">
                                {appointment.grain}
                                {appointment.quantity && ` (${appointment.quantity} ${appointment.grainUnit})`}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusText(appointment.status)}
                              color={getStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {appointment.datetime}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Zobacz szczegóły">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleAppointmentAction(appointment.id, 'view')}
                                >
                                  <FaEye />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edytuj">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleAppointmentAction(appointment.id, 'edit')}
                                >
                                  <FaEdit />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Brak awizacji do wyświetlenia
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Top kontrahenci
              </Typography>
              {contractorStats.length > 0 ? (
                <List>
                  {contractorStats.map(([name, data], index) => (
                    <ListItem key={name} sx={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2, 
                      mb: 2,
                      background: '#fafafa'
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          background: `linear-gradient(135deg, ${['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} 0%, ${['#1d4ed8', '#059669', '#d97706', '#7c3aed', '#dc2626'][index % 5]} 100%)`
                        }}>
                          <FaBuilding />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {name}
                        </Typography>
                            <Chip label={`#${index + 1}`} size="small" color="primary" />
                      </Box>
                    }
                    secondary={
                      <Box>
                            <Typography variant="body2" color="text.secondary">
                              {data.count} awizacji • {data.totalQuantity.toFixed(1)} tys. ton
                        </Typography>
                      </Box>
                    }
                  />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Brak danych o kontrahentach
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Statystyki zbóż
              </Typography>
              {grainStats.length > 0 ? (
                <List>
                  {grainStats.map(([name, data], index) => (
                    <ListItem key={name} sx={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: 2, 
                      mb: 2,
                      background: '#fafafa'
                    }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          background: `linear-gradient(135deg, ${['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#2563eb'][index % 5]} 0%, ${['#059669', '#d97706', '#7c3aed', '#dc2626', '#1d4ed8'][index % 5]} 100%)`
                        }}>
                          <FaSeedling />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {name}
                            </Typography>
                            <Chip label={`#${index + 1}`} size="small" color="primary" />
                  </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {data.quantity.toFixed(1)} {data.unit}
                          </Typography>
                        }
                      />
                </ListItem>
            ))}
          </List>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Brak danych o zbożach
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard; 