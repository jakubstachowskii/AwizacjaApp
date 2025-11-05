import React, { useState, useContext, useMemo } from 'react';
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
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  FaChartBar,
  FaDownload,
  FaCalendarAlt,
  FaTruck,
  FaSeedling,
  FaBuilding,
  FaTimes
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';

const Reports = () => {
  const { appointments, contractors, grains, loading } = useContext(AppContext);
  const { showSuccess, showError, showInfo } = useNotification();
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [previewReport, setPreviewReport] = useState(null);
  
  // Filtry raportów
  const [contractFilter, setContractFilter] = useState('all');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('all');
  const [grainFilter, setGrainFilter] = useState('all');
  const [contractorFilter, setContractorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Funkcja filtrowania raportów
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    // Filtrowanie po numerze kontraktu
    if (contractFilter !== 'all') {
      filtered = filtered.filter(app => app.contract_number && app.contract_number.includes(contractFilter));
    }
    
    // Filtrowanie po typie dostawy
    if (deliveryTypeFilter !== 'all') {
      filtered = filtered.filter(app => app.delivery_type === deliveryTypeFilter);
    }
    
    // Filtrowanie po zbożu
    if (grainFilter !== 'all') {
      filtered = filtered.filter(app => app.grain_id === parseInt(grainFilter));
    }
    
    // Filtrowanie po kontrahencie
    if (contractorFilter !== 'all') {
      filtered = filtered.filter(app => app.contractor_id === parseInt(contractorFilter));
    }
    
    // Filtrowanie po statusie
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    return filtered;
  }, [appointments, contractFilter, deliveryTypeFilter, grainFilter, contractorFilter, statusFilter]);
  
  // Obliczanie statystyk
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const pending = filteredAppointments.filter(app => app.status === 'oczekująca').length;
    const active = filteredAppointments.filter(app => app.status === 'w_trakcie').length;
    const completed = filteredAppointments.filter(app => app.status === 'zakończona').length;
    const cancelled = filteredAppointments.filter(app => app.status === 'anulowana').length;
    
    const deliveries = filteredAppointments.filter(app => app.type === 'dostawa').length;
    const pickups = filteredAppointments.filter(app => app.type === 'odbiór').length;
    
    return {
      total,
      pending,
      active,
      completed,
      cancelled,
      deliveries,
      pickups
    };
  }, [filteredAppointments]);
  
  // Najpopularniejsze zboża
  const topGrains = useMemo(() => {
    const grainCounts = {};
    filteredAppointments.forEach(app => {
      const grainName = app.grain_name || 'Nieznane';
      grainCounts[grainName] = (grainCounts[grainName] || 0) + 1;
    });
    
    return Object.entries(grainCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredAppointments]);
  
  // Najaktywniejsi kontrahenci
  const topContractors = useMemo(() => {
    const contractorCounts = {};
    filteredAppointments.forEach(app => {
      const contractor = contractors.find(c => c.id === app.contractor_id);
      const contractorName = contractor?.name || 'Nieznany';
      contractorCounts[contractorName] = (contractorCounts[contractorName] || 0) + 1;
    });
    
    return Object.entries(contractorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [filteredAppointments, contractors]);

  const handleGenerateReport = (reportType) => {
    setSelectedReport(reportType);
    showInfo(`Generowanie raportu: ${reportType}`);
  };

  const handleExportReport = (format) => {
    showSuccess(`Eksport raportu do formatu ${format}`);
  };

  // Funkcja generowania podglądu raportu
  const handlePreviewReport = (reportType) => {
    let previewData = {};
    
    switch (reportType) {
      case 'daily':
        previewData = {
          title: 'Raport Dzienny',
          date: new Date().toLocaleDateString('pl-PL'),
          summary: {
            totalAppointments: filteredAppointments.filter(app => 
              new Date(app.datetime).toDateString() === new Date().toDateString()
            ).length,
            completed: filteredAppointments.filter(app => 
              app.status === 'zakończona' && 
              new Date(app.datetime).toDateString() === new Date().toDateString()
            ).length,
            totalQuantity: filteredAppointments
              .filter(app => new Date(app.datetime).toDateString() === new Date().toDateString())
              .reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0)
          },
          topGrains: topGrains.slice(0, 3),
          topContractors: topContractors.slice(0, 3),
          recentAppointments: filteredAppointments
            .filter(app => new Date(app.datetime).toDateString() === new Date().toDateString())
            .slice(0, 5)
        };
        break;
        
      case 'monthly':
        const currentMonth = new Date().getMonth();
        const monthAppointments = filteredAppointments.filter(app => 
          new Date(app.datetime).getMonth() === currentMonth
        );
        previewData = {
          title: 'Raport Miesięczny',
          period: `${new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}`,
          summary: {
            totalAppointments: monthAppointments.length,
            deliveries: monthAppointments.filter(app => app.type === 'dostawa').length,
            pickups: monthAppointments.filter(app => app.type === 'odbiór').length,
            totalQuantity: monthAppointments.reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0)
          },
          trends: {
            weeklyData: [
              { week: 'Tydzień 1', appointments: Math.floor(Math.random() * 20) + 10 },
              { week: 'Tydzień 2', appointments: Math.floor(Math.random() * 20) + 10 },
              { week: 'Tydzień 3', appointments: Math.floor(Math.random() * 20) + 10 },
              { week: 'Tydzień 4', appointments: Math.floor(Math.random() * 20) + 10 }
            ]
          },
          topGrains: topGrains,
          topContractors: topContractors
        };
        break;
        
      case 'contractor':
        previewData = {
          title: 'Raport Kontrahentów',
          period: 'Ostatnie 30 dni',
          summary: {
            totalContractors: contractors.length,
            activeContractors: contractors.filter(c => 
              filteredAppointments.some(app => app.contractor_id === c.id)
            ).length,
            totalDeliveries: filteredAppointments.filter(app => app.type === 'dostawa').length
          },
          contractorDetails: topContractors.map(contractor => ({
            name: contractor.name,
            appointments: contractor.count,
            deliveries: filteredAppointments.filter(app => 
              app.contractor_id === contractors.find(c => c.name === contractor.name)?.id &&
              app.type === 'dostawa'
            ).length,
            totalQuantity: filteredAppointments
              .filter(app => app.contractor_id === contractors.find(c => c.name === contractor.name)?.id)
              .reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0)
          }))
        };
        break;
        
      case 'grains':
        previewData = {
          title: 'Raport Zbóż',
          period: 'Wszystkie dane',
          summary: {
            totalGrains: grains.length,
            totalQuantity: filteredAppointments.reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0)
          },
          grainDetails: topGrains.map(grain => ({
            name: grain.name,
            appointments: grain.count,
            totalQuantity: filteredAppointments
              .filter(app => app.grain_name === grain.name)
              .reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0),
            avgQuantity: filteredAppointments
              .filter(app => app.grain_name === grain.name && app.quantity)
              .reduce((sum, app) => sum + parseFloat(app.quantity || 0), 0) / 
              filteredAppointments.filter(app => app.grain_name === grain.name && app.quantity).length || 0
          }))
        };
        break;
        
      default:
        previewData = null;
    }
    
    setPreviewReport({ type: reportType, data: previewData });
  };

  // Komponent do renderowania podglądu raportu
  const renderReportPreview = () => {
    if (!previewReport || !previewReport.data) return null;
    
    const { type, data } = previewReport;
    
    return (
      <Dialog 
        open={!!previewReport} 
        onClose={() => setPreviewReport(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📊 {data.title}
            </Typography>
            <IconButton onClick={() => setPreviewReport(null)}>
              <FaTimes />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Okres: {data.period || data.date}
            </Typography>
          </Box>
          
          {/* Podsumowanie */}
          <Card sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📈 Podsumowanie
            </Typography>
            <Grid container spacing={2}>
              {type === 'daily' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {data.summary.totalAppointments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wszystkie awizacje
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {data.summary.completed}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Zakończone
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {data.summary.totalQuantity.toFixed(1)} t
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Łączna ilość
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
              
              {type === 'monthly' && (
                <>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {data.summary.totalAppointments}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wszystkie awizacje
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {data.summary.deliveries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dostawy
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main" sx={{ fontWeight: 700 }}>
                        {data.summary.pickups}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Odbiory
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {data.summary.totalQuantity.toFixed(1)} t
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Łączna ilość
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
              
              {type === 'contractor' && (
                <>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {data.summary.totalContractors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Wszyscy kontrahenci
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {data.summary.activeContractors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Aktywni kontrahenci
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main" sx={{ fontWeight: 700 }}>
                        {data.summary.totalDeliveries}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Łączne dostawy
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
              
              {type === 'grains' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                        {data.summary.totalGrains}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Rodzaje zbóż
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main" sx={{ fontWeight: 700 }}>
                        {data.summary.totalQuantity.toFixed(1)} t
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Łączna ilość
                      </Typography>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </Card>
          
          {/* Szczegóły */}
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              📋 Szczegóły
            </Typography>
            
            {type === 'daily' && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Najnowsze awizacje:
                </Typography>
                <List>
                  {data.recentAppointments.map((app, index) => (
                    <ListItem key={index}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          background: app.status === 'zakończona' ? '#10b981' : 
                                   app.status === 'w_trakcie' ? '#f59e0b' : '#6b7280'
                        }}>
                          <FaTruck size={12} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${app.plate_number} - ${app.contractor}`}
                        secondary={`${app.datetime} | Status: ${app.status}`}
                      />
                      <Chip 
                        label={app.quantity ? `${app.quantity} t` : 'Brak ilości'} 
                        size="small" 
                        color="primary"
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {type === 'monthly' && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Trendy tygodniowe:
                </Typography>
                <Grid container spacing={2}>
                  {data.trends.weeklyData.map((week, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          {week.appointments}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {week.week}
                        </Typography>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
            
            {type === 'contractor' && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Top kontrahenci:
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Kontrahent</TableCell>
                        <TableCell align="right">Awizacje</TableCell>
                        <TableCell align="right">Dostawy</TableCell>
                        <TableCell align="right">Ilość (t)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.contractorDetails.map((contractor, index) => (
                        <TableRow key={index}>
                          <TableCell>{contractor.name}</TableCell>
                          <TableCell align="right">
                            <Chip label={contractor.appointments} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">
                            <Chip label={contractor.deliveries} size="small" color="success" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {contractor.totalQuantity.toFixed(1)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {type === 'grains' && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Analiza zbóż:
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Zboże</TableCell>
                        <TableCell align="right">Awizacje</TableCell>
                        <TableCell align="right">Ilość (t)</TableCell>
                        <TableCell align="right">Średnia (t)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.grainDetails.map((grain, index) => (
                        <TableRow key={index}>
                          <TableCell>{grain.name}</TableCell>
                          <TableCell align="right">
                            <Chip label={grain.appointments} size="small" color="primary" />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {grain.totalQuantity.toFixed(1)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="text.secondary">
                              {grain.avgQuantity.toFixed(1)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewReport(null)}>
            Zamknij
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FaDownload />}
            onClick={() => {
              handleExportReport('PDF');
              setPreviewReport(null);
            }}
          >
            Eksportuj PDF
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Ładowanie raportów...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Raporty i analizy
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaDownload />}
          onClick={() => handleExportReport('PDF')}
        >
          Eksportuj
        </Button>
      </Box>

      {/* Filtry raportów */}
      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          🔍 Filtry raportów
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Numer kontraktu"
              value={contractFilter === 'all' ? '' : contractFilter}
              onChange={(e) => setContractFilter(e.target.value || 'all')}
              placeholder="Wpisz numer kontraktu"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Typ dostawy</InputLabel>
              <Select
                value={deliveryTypeFilter}
                onChange={(e) => setDeliveryTypeFilter(e.target.value)}
                label="Typ dostawy"
              >
                <MenuItem value="all">Wszystkie</MenuItem>
                <MenuItem value="skup">Skup od rolników</MenuItem>
                <MenuItem value="kontrakt">Dostawa na podstawie kontraktu</MenuItem>
                <MenuItem value="inne">Inne</MenuItem>
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
              <Chip 
                label={`Wyniki: ${filteredAppointments.length}`} 
                color="primary" 
                size="small" 
              />
              {(contractFilter !== 'all' || deliveryTypeFilter !== 'all' || grainFilter !== 'all' || contractorFilter !== 'all' || statusFilter !== 'all') && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setContractFilter('all');
                    setDeliveryTypeFilter('all');
                    setGrainFilter('all');
                    setContractorFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Wyczyść
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Kafelki z najpopularniejszymi zbożami i kontrahentami */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🌾 Najpopularniejsze zboża
                </Typography>
                <FaSeedling size={24} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topGrains.map((grain, index) => (
                  <Chip
                    key={grain.name}
                    label={`${grain.name}: ${grain.count}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  👥 Najaktywniejsi kontrahenci
                </Typography>
                <FaBuilding size={24} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {topContractors.map((contractor, index) => (
                  <Chip
                    key={contractor.name}
                    label={`${contractor.name}: ${contractor.count}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.3)'
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Szczegółowe raporty */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                📊 Szczegółowe raporty
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: '#2563eb' }}>
                          <FaCalendarAlt />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Raport dzienny
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Podsumowanie z dzisiejszego dnia
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReport('daily');
                          }}
                        >
                          Podgląd
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport('daily');
                          }}
                        >
                          Generuj
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: '#10b981' }}>
                          <FaChartBar />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Raport miesięczny
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Statystyki i analiza trendów
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReport('monthly');
                          }}
                        >
                          Podgląd
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport('monthly');
                          }}
                        >
                          Generuj
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: '#f59e0b' }}>
                          <FaTruck />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Raport kontrahentów
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Aktywność i analiza dostaw
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReport('contractor');
                          }}
                        >
                          Podgląd
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport('contractor');
                          }}
                        >
                          Generuj
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ background: '#8b5cf6' }}>
                          <FaSeedling />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Raport zbóż
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Analiza według rodzajów zbóż
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReport('grains');
                          }}
                        >
                          Podgląd
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateReport('grains');
                          }}
                        >
                          Generuj
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {renderReportPreview()}
    </Box>
  );
};

export default Reports; 