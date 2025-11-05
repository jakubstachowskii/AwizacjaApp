import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  Box, Button, Card, CardContent, Grid, MenuItem, Select, Typography,
  FormControl, InputLabel, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { FaFileAlt, FaDownload, FaChartBar } from 'react-icons/fa';

const Reports = () => {
  const [reportType, setReportType] = useState('intakes');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [grainId, setGrainId] = useState('');
  const [contractId, setContractId] = useState('');
  const [contractors, setContractors] = useState([]);
  const [grains, setGrains] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'intakes', label: 'Raport przyjęć' },
    { value: 'contractors', label: 'Raport kontrahentów' },
    { value: 'grains', label: 'Raport zbóż' },
    { value: 'prices', label: 'Raport cen' }
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [contractorsData, grainsData, contractsData] = await Promise.all([
        window.electronAPI.dbGetAll('skup_contractors'),
        window.electronAPI.dbGetAll('skup_grains'),
        window.electronAPI.dbGetAll('skup_contracts')
      ]);
      setContractors(contractorsData || []);
      setGrains(grainsData || []);
      setContracts(contractsData || []);
    } catch (error) {
      console.error('Błąd ładowania danych:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];

      switch (reportType) {
        case 'intakes':
          data = await window.electronAPI.dbGetAll('skup_intakes');
          break;
        case 'contractors':
          data = await window.electronAPI.dbGetAll('skup_contractors');
          break;
        case 'grains':
          data = await window.electronAPI.dbGetAll('skup_grains');
          break;
        case 'prices':
          data = await window.electronAPI.dbGetAll('skup_prices');
          break;
        default:
          data = [];
      }

      // Filtrowanie według dat
      if (dateFrom && dateTo) {
        data = data.filter(item => {
          const itemDate = new Date(item.created_at || item.date);
          return itemDate >= new Date(dateFrom) && itemDate <= new Date(dateTo);
        });
      }

      // Filtrowanie według kontrahenta
      if (contractorId) {
        data = data.filter(item => item.contractor_id === parseInt(contractorId));
      }

      // Filtrowanie według zboża
      if (grainId) {
        data = data.filter(item => item.grain_id === parseInt(grainId));
      }

      // Filtrowanie według kontraktu
      if (contractId) {
        data = data.filter(item => item.contract_id === parseInt(contractId));
      }

      setReportData(data);
    } catch (error) {
      console.error('Błąd generowania raportu:', error);
    } finally {
      setLoading(false);
    }
  }, [reportType, dateFrom, dateTo, contractorId, grainId, contractId]);

  const exportReport = useCallback(() => {
    if (reportData.length === 0) return;

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `raport_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [reportData, reportType]);

  const getReportTitle = () => {
    const type = reportTypes.find(t => t.value === reportType);
    return type ? type.label : 'Raport';
  };

  const renderReportTable = () => {
    if (reportData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Brak danych do wyświetlenia
          </Typography>
        </Box>
      );
    }

    const headers = Object.keys(reportData[0]);

    return (
      <TableContainer 
        component={Paper}
        sx={{ 
          overflowX: 'auto',
          '& .MuiTable-root': {
            minWidth: { xs: 600, md: 'auto' }
          }
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell 
                  key={header} 
                  sx={{ 
                    fontWeight: 600,
                    minWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {header.replace(/_/g, ' ').toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell 
                    key={header}
                    sx={{
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {row[header] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Raporty Skup
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaDownload />}
          onClick={exportReport}
          disabled={reportData.length === 0}
        >
          Eksportuj CSV
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Filtry */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <FaChartBar />
                Filtry raportu
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Typ raportu</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Typ raportu"
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Data od"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  label="Data do"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Kontrahent</InputLabel>
                  <Select
                    value={contractorId}
                    onChange={(e) => setContractorId(e.target.value)}
                    label="Kontrahent"
                  >
                    <MenuItem value="">Wszyscy</MenuItem>
                    {contractors.map((contractor) => (
                      <MenuItem key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Zboże</InputLabel>
                  <Select
                    value={grainId}
                    onChange={(e) => setGrainId(e.target.value)}
                    label="Zboże"
                  >
                    <MenuItem value="">Wszystkie</MenuItem>
                    {grains.map((grain) => (
                      <MenuItem key={grain.id} value={grain.id}>
                        {grain.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Kontrakt</InputLabel>
                  <Select
                    value={contractId}
                    onChange={(e) => setContractId(e.target.value)}
                    label="Kontrakt"
                  >
                    <MenuItem value="">Wszystkie</MenuItem>
                    {contracts.map((contract) => (
                      <MenuItem key={contract.id} value={contract.id}>
                        {contract.contract_number || `Kontrakt #${contract.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  onClick={generateReport}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Generowanie...' : 'Generuj raport'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Wyniki */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaFileAlt />
                  {getReportTitle()}
                </Typography>
                {reportData.length > 0 && (
                  <Chip 
                    label={`${reportData.length} rekordów`} 
                    color="primary" 
                    size="small" 
                  />
                )}
              </Box>
              
              {renderReportTable()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
 
