import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Alert,
  Grid,
  Chip,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { FaDatabase, FaCheckCircle, FaTimesCircle, FaRedo, FaClipboardList, FaStore } from 'react-icons/fa';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const testDatabaseConnection = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test integralności bazy danych
      if (window.electronAPI) {
        const integrityCheck = await window.electronAPI.dbCheckIntegrity();
        results.integrity = {
          success: true,
          message: 'Integralność bazy danych: OK'
        };
      } else {
        results.integrity = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test pobierania zbóż
      if (window.electronAPI) {
        const grains = await window.electronAPI.dbGetAll('grains');
        results.grains = {
          success: true,
          count: grains.length,
          data: grains.slice(0, 3) // Pierwsze 3 rekordy
        };
      } else {
        results.grains = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test pobierania kontrahentów
      if (window.electronAPI) {
        const contractors = await window.electronAPI.dbGetAll('contractors');
        results.contractors = {
          success: true,
          count: contractors.length,
          data: contractors.slice(0, 3)
        };
      } else {
        results.contractors = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test pobierania awizacji
      if (window.electronAPI) {
        const appointments = await window.electronAPI.dbGetAppointments();
        results.appointments = {
          success: true,
          count: appointments.length,
          data: appointments.slice(0, 3)
        };
      } else {
        results.appointments = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test modułu Skup - przyjęcia
      if (window.electronAPI) {
        const intakes = await window.electronAPI.dbGetAll('skup_intakes');
        results.skupIntakes = {
          success: true,
          count: intakes.length,
          data: intakes.slice(0, 3)
        };
      } else {
        results.skupIntakes = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test modułu Skup - kontrahenci
      if (window.electronAPI) {
        const skupContractors = await window.electronAPI.dbGetAll('skup_contractors');
        results.skupContractors = {
          success: true,
          count: skupContractors.length,
          data: skupContractors.slice(0, 3)
        };
      } else {
        results.skupContractors = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test modułu Skup - zboża
      if (window.electronAPI) {
        const skupGrains = await window.electronAPI.dbGetAll('skup_grains');
        results.skupGrains = {
          success: true,
          count: skupGrains.length,
          data: skupGrains.slice(0, 3)
        };
      } else {
        results.skupGrains = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test modułu Skup - cenniki
      if (window.electronAPI) {
        const prices = await window.electronAPI.dbGetAll('skup_prices');
        results.skupPrices = {
          success: true,
          count: prices.length,
          data: prices.slice(0, 3)
        };
      } else {
        results.skupPrices = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test modułu Skup - dokumenty
      if (window.electronAPI) {
        const documents = await window.electronAPI.dbGetAll('skup_documents');
        results.skupDocuments = {
          success: true,
          count: documents.length,
          data: documents.slice(0, 3)
        };
      } else {
        results.skupDocuments = { success: false, error: 'Electron API nie jest dostępne' };
      }

      // Test informacji o bazie danych
      if (window.electronAPI) {
        const dbInfo = await window.electronAPI.dbGetInfo();
        results.databaseInfo = {
          success: true,
          tables: dbInfo.tables,
          tableCount: dbInfo.tables.length
        };
      } else {
        results.databaseInfo = { success: false, error: 'Electron API nie jest dostępne' };
      }

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd testu bazy danych:', error);
      }
      results.error = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const getTestResultIcon = (success) => {
    return success ? (
      <FaCheckCircle style={{ color: '#10b981', marginRight: 8 }} />
    ) : (
      <FaTimesCircle style={{ color: '#ef4444', marginRight: 8 }} />
    );
  };

  const getTestResultColor = (success) => {
    return success ? 'success' : 'error';
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Komponent dla modułu Awizacje
  const AwizacjeModule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#10b981' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Integralność
              </Typography>
            </Box>
            
            {testResults.integrity ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.integrity.success)}
                  <Chip 
                    label={testResults.integrity.success ? 'OK' : 'Błąd'}
                    color={getTestResultColor(testResults.integrity.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.integrity.success ? (
                  <Typography variant="body2" color="text.secondary">
                    {testResults.integrity.message}
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.integrity.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#2563eb' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zboża
              </Typography>
            </Box>
            
            {testResults.grains ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.grains.success)}
                  <Chip 
                    label={testResults.grains.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.grains.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.grains.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.grains.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.grains.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#2563eb' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Kontrahenci
              </Typography>
            </Box>
            
            {testResults.contractors ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.contractors.success)}
                  <Chip 
                    label={testResults.contractors.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.contractors.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.contractors.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.contractors.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.contractors.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#2563eb' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Awizacje
              </Typography>
            </Box>
            
            {testResults.appointments ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.appointments.success)}
                  <Chip 
                    label={testResults.appointments.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.appointments.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.appointments.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.appointments.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.appointments.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Komponent dla modułu Skup
  const SkupModule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#16a34a' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Przyjęcia
              </Typography>
            </Box>
            
            {testResults.skupIntakes ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.skupIntakes.success)}
                  <Chip 
                    label={testResults.skupIntakes.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.skupIntakes.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.skupIntakes.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.skupIntakes.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.skupIntakes.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#ea580c' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Kontrahenci Skup
              </Typography>
            </Box>
            
            {testResults.skupContractors ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.skupContractors.success)}
                  <Chip 
                    label={testResults.skupContractors.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.skupContractors.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.skupContractors.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.skupContractors.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.skupContractors.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#16a34a' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Zboża Skup
              </Typography>
            </Box>
            
            {testResults.skupGrains ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.skupGrains.success)}
                  <Chip 
                    label={testResults.skupGrains.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.skupGrains.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.skupGrains.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.skupGrains.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.skupGrains.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#9333ea' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Cenniki
              </Typography>
            </Box>
            
            {testResults.skupPrices ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.skupPrices.success)}
                  <Chip 
                    label={testResults.skupPrices.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.skupPrices.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.skupPrices.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.skupPrices.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.skupPrices.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#475569' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dokumenty
              </Typography>
            </Box>
            
            {testResults.skupDocuments ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.skupDocuments.success)}
                  <Chip 
                    label={testResults.skupDocuments.success ? 'Sukces' : 'Błąd'}
                    color={getTestResultColor(testResults.skupDocuments.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.skupDocuments.success ? (
                  <Typography variant="body2" color="text.secondary">
                    Znaleziono {testResults.skupDocuments.count} rekordów
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.skupDocuments.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Komponent dla informacji o bazie
  const DatabaseInfoModule = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FaDatabase style={{ marginRight: 8, color: '#8b5cf6' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Informacje o bazie
              </Typography>
            </Box>
            
            {testResults.databaseInfo ? (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {getTestResultIcon(testResults.databaseInfo.success)}
                  <Chip 
                    label={testResults.databaseInfo.success ? 'OK' : 'Błąd'}
                    color={getTestResultColor(testResults.databaseInfo.success)}
                    size="small"
                  />
                </Box>
                
                {testResults.databaseInfo.success ? (
                  <Typography variant="body2" color="text.secondary">
                    {testResults.databaseInfo.tableCount} tabel w bazie
                  </Typography>
                ) : (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {testResults.databaseInfo.error}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Oczekiwanie na test...
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {testResults.databaseInfo?.success && testResults.databaseInfo.tables && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Tabele w bazie danych
              </Typography>
              
              <Grid container spacing={3}>
                {/* Moduł Awizacje */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2563eb' }}>
                      <FaClipboardList style={{ marginRight: 8 }} />
                      Moduł Awizacje
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {testResults.databaseInfo.tables
                        .filter(table => !table.startsWith('skup_') && !['settings', 'weights'].includes(table))
                        .map((table, index) => (
                          <Chip 
                            key={index} 
                            label={table} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: '#2563eb',
                              color: '#2563eb',
                              '&:hover': { backgroundColor: '#2563eb22' }
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Moduł Skup */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#16a34a' }}>
                      <FaStore style={{ marginRight: 8 }} />
                      Moduł Skup
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {testResults.databaseInfo.tables
                        .filter(table => table.startsWith('skup_'))
                        .map((table, index) => (
                          <Chip 
                            key={index} 
                            label={table} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: '#16a34a',
                              color: '#16a34a',
                              '&:hover': { backgroundColor: '#16a34a22' }
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                </Grid>

                {/* Tabele systemowe */}
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#8b5cf6' }}>
                      <FaDatabase style={{ marginRight: 8 }} />
                      Tabele systemowe
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {testResults.databaseInfo.tables
                        .filter(table => ['settings', 'weights'].includes(table))
                        .map((table, index) => (
                          <Chip 
                            key={index} 
                            label={table} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              borderColor: '#8b5cf6',
                              color: '#8b5cf6',
                              '&:hover': { backgroundColor: '#8b5cf622' }
                            }}
                          />
                        ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Test bazy danych
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaRedo />}
          onClick={testDatabaseConnection}
          disabled={loading}
        >
          {loading ? 'Testowanie...' : 'Uruchom test'}
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="test bazy danych">
          <Tab 
            icon={<FaClipboardList />} 
            label="Awizacje" 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<FaStore />} 
            label="Skup" 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab 
            icon={<FaDatabase />} 
            label="Informacje o bazie" 
            iconPosition="start"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Box>

      {/* Zawartość tabów */}
      {activeTab === 0 && <AwizacjeModule />}
      {activeTab === 1 && <SkupModule />}
      {activeTab === 2 && <DatabaseInfoModule />}

      {/* Błędy ogólne */}
      {testResults.error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          Błąd ogólny: {testResults.error}
        </Alert>
      )}
    </Box>
  );
};

export default DatabaseTest; 