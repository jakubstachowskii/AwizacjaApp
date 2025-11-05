import React, { useState, useContext, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormHelperText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSearch,
  FaPrint,
  FaDownload,
  FaFileInvoiceDollar
} from 'react-icons/fa';
import { AppContext } from '../App';
import { useNotification } from './NotificationProvider';
import { validateAppointment } from '../utils/validation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ScaleConfigDialog from '../modules/skup/components/ScaleConfigDialog';

const AppointmentsList = () => {
  const { 
    appointments, 
    contractors, 
    grains, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    loading 
  } = useContext(AppContext);
  const { showSuccess, showError, showWarning } = useNotification();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formErrors, setFormErrors] = useState({});
  const [previewReport, setPreviewReport] = useState(null);
  const [wzDocument, setWzDocument] = useState(null);
  const [showWzDialog, setShowWzDialog] = useState(false);
  
  // Filtry raportów

  // Form state - pełny formularz ze wszystkimi polami
  const [formData, setFormData] = useState({
    type: '',
    datetime: '',
    grain_id: '',
    quantity: '',
    plate_number: '',
    contractor_id: '',
    notes: '',
    status: 'oczekująca',
    // Dodatkowe pola z oryginalnej wersji
    driver_name: '',
    phone: '',
    trailer_plate: '',
    expected_duration: '',
    special_instructions: '',
    company: '',
    entry_time: '',
    expected_exit_time: '',
    gate: '',
    purpose: '',
    cargo_type: '',
    cargo_weight: '',
    cargo_unit: '',
    wz_number: '',
    wz_date: '',
    contractor_name: '',
    contractor_address: '',
    delivery_address: '',
    shipper_name: '',
    shipper_address: '',
    is_return: false,
    return_reason: '',
    return_quantity: '',
    return_unit: '',
    original_delivery_date: '',
    original_delivery_number: '',
    // Nowe pola dla kontraktów i typu dostaw
    contract_number: '',
    delivery_type: 'skup',
    
    // Pola jakościowe zboża
    moisture_content: '',
    impurities_content: '',
    protein_content: '',
    falling_number: '',
    hectoliter_weight: '',
    test_weight: '',
    grain_class: '',
    quality_notes: ''
  });

  // Filtrowanie danych na podstawie wyszukiwania
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (searchTerm) {
      filtered = filtered.filter(appointment => 
        appointment.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contractors.find(c => c.id === appointment.contractor_id)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === statusFilter);
    }
    
    return filtered;
  }, [appointments, searchTerm, statusFilter, contractors]);

  // Paginacja
  const paginatedAppointments = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAppointments, page, rowsPerPage]);

  const handleOpenDialog = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        type: appointment.type,
        datetime: appointment.datetime ? new Date(appointment.datetime).toISOString().slice(0, 16) : '',
        grain_id: appointment.grain_id,
        quantity: appointment.quantity || '',
        plate_number: appointment.plate_number,
        contractor_id: appointment.contractor_id,
        notes: appointment.notes || '',
        status: appointment.status,
        // Dodatkowe pola z oryginalnej wersji
        driver_name: appointment.driver_name || '',
        phone: appointment.phone || '',
        trailer_plate: appointment.trailer_plate || '',
        expected_duration: appointment.expected_duration || '',
        special_instructions: appointment.special_instructions || '',
        company: appointment.company || '',
        entry_time: appointment.entry_time || '',
        expected_exit_time: appointment.expected_exit_time || '',
        gate: appointment.gate || '',
        purpose: appointment.purpose || '',
        cargo_type: appointment.cargo_type || '',
        cargo_weight: appointment.cargo_weight || '',
        cargo_unit: appointment.cargo_unit || '',
        wz_number: appointment.wz_number || '',
        wz_date: appointment.wz_date || '',
        contractor_name: appointment.contractor_name || '',
        contractor_address: appointment.contractor_address || '',
        delivery_address: appointment.delivery_address || '',
        shipper_name: appointment.shipper_name || '',
        shipper_address: appointment.shipper_address || '',
        is_return: appointment.is_return || false,
        return_reason: appointment.return_reason || '',
        return_quantity: appointment.return_quantity || '',
        return_unit: appointment.return_unit || '',
        original_delivery_date: appointment.original_delivery_date || '',
        original_delivery_number: appointment.original_delivery_number || '',
        // Nowe pola dla kontraktów i typu dostaw
        contract_number: appointment.contract_number || '',
        delivery_type: appointment.delivery_type || 'skup',
        // Pola jakościowe zboża
        moisture_content: appointment.moisture_content || '',
        impurities_content: appointment.impurities_content || '',
        protein_content: appointment.protein_content || '',
        falling_number: appointment.falling_number || '',
        hectoliter_weight: appointment.hectoliter_weight || '',
        test_weight: appointment.test_weight || '',
        grain_class: appointment.grain_class || '',
        quality_notes: appointment.quality_notes || ''
      });
    } else {
    setEditingAppointment(null);
      setFormData({
        type: '',
        datetime: '',
        grain_id: '',
        quantity: '',
        plate_number: '',
        contractor_id: '',
        notes: '',
        status: 'oczekująca',
        // Dodatkowe pola z oryginalnej wersji
        driver_name: '',
        phone: '',
        trailer_plate: '',
        expected_duration: '',
        special_instructions: '',
        company: '',
        entry_time: '',
        expected_exit_time: '',
        gate: '',
        purpose: '',
        cargo_type: '',
        cargo_weight: '',
        cargo_unit: '',
        wz_number: '',
        wz_date: '',
        contractor_name: '',
        contractor_address: '',
        delivery_address: '',
        shipper_name: '',
        shipper_address: '',
        is_return: false,
        return_reason: '',
        return_quantity: '',
        return_unit: '',
        original_delivery_date: '',
        original_delivery_number: '',
        // Nowe pola dla kontraktów i typu dostaw
        contract_number: '',
        delivery_type: 'skup',
        // Pola jakościowe zboża
        moisture_content: '',
        impurities_content: '',
        protein_content: '',
        falling_number: '',
        hectoliter_weight: '',
        test_weight: '',
        grain_class: '',
        quality_notes: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAppointment(null);
    setFormData({
      type: '',
      datetime: '',
      grain_id: '',
      quantity: '',
      plate_number: '',
      contractor_id: '',
      notes: '',
      status: 'oczekująca',
      // Dodatkowe pola z oryginalnej wersji
      driver_name: '',
      phone: '',
      trailer_plate: '',
      expected_duration: '',
      special_instructions: '',
      company: '',
      entry_time: '',
      expected_exit_time: '',
      gate: '',
      purpose: '',
      cargo_type: '',
      cargo_weight: '',
      cargo_unit: '',
      wz_number: '',
      wz_date: '',
      contractor_name: '',
      contractor_address: '',
      delivery_address: '',
      shipper_name: '',
      shipper_address: '',
      is_return: false,
      return_reason: '',
      return_quantity: '',
      return_unit: '',
      original_delivery_date: '',
      original_delivery_number: '',
      // Nowe pola dla kontraktów i typu dostaw
      contract_number: '',
      delivery_type: 'skup',
      // Pola jakościowe zboża
      moisture_content: '',
      impurities_content: '',
      protein_content: '',
      falling_number: '',
      hectoliter_weight: '',
      test_weight: '',
      grain_class: '',
      quality_notes: ''
    });
    setFormErrors({});
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async () => {
    // Walidacja formularza
    const errors = {};
    if (!formData.type) errors.type = 'Typ awizacji jest wymagany';
    if (!formData.datetime) errors.datetime = 'Data i czas są wymagane';
    if (!formData.plate_number) errors.plate_number = 'Numer rejestracyjny jest wymagany';
    if (!formData.contractor_id) errors.contractor_id = 'Kontrahent jest wymagany';
    if (!formData.grain_id) errors.grain_id = 'Rodzaj zboża jest wymagany';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, formData);
        showSuccess('Awizacja zaktualizowana pomyślnie');
      } else {
        await addAppointment(formData);
        showSuccess('Awizacja dodana pomyślnie');
      }
      handleCloseDialog();
      // resetForm(); // This function is not defined in the original file, so it's removed.
    } catch (error) {
      showError('Błąd podczas zapisywania awizacji');
    }
  };

  // Funkcja generowania dokumentu WZ
  const generateWzDocument = () => {
    if (!formData.type || !formData.datetime || !formData.plate_number || !formData.contractor_id || !formData.grain_id) {
      showError('Wypełnij wszystkie wymagane pola przed wygenerowaniem WZ');
      return;
    }

    const contractor = contractors.find(c => c.id === formData.contractor_id);
    const grain = grains.find(g => g.id === formData.grain_id);
    
    const wzData = {
      wzNumber: formData.wz_number || `WZ/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`,
      wzDate: formData.wz_date || new Date().toISOString().split('T')[0],
      contractNumber: formData.contract_number || '',
      deliveryType: formData.delivery_type || 'skup',
      
      // Dane nadawcy
      shipper: {
        name: formData.shipper_name || contractor?.name || '',
        address: formData.shipper_address || contractor?.address || '',
        phone: formData.phone || contractor?.phone || '',
        nip: contractor?.nip || ''
      },
      
      // Dane odbiorcy
      receiver: {
        name: formData.contractor_name || contractor?.name || '',
        address: formData.delivery_address || contractor?.address || '',
        phone: formData.phone || contractor?.phone || '',
        nip: contractor?.nip || ''
      },
      
      // Dane transportu
      transport: {
        plateNumber: formData.plate_number || '',
        trailerPlate: formData.trailer_plate || '',
        driverName: formData.driver_name || '',
        company: formData.company || ''
      },
      
      // Dane towaru
      cargo: {
        type: grain?.name || '',
        quantity: formData.quantity || '',
        unit: grain?.unit || 't',
        cargoType: formData.cargo_type || '',
        cargoWeight: formData.cargo_weight || '',
        cargoUnit: formData.cargo_unit || '',
        // Dane jakościowe
        moistureContent: formData.moisture_content || '',
        impuritiesContent: formData.impurities_content || '',
        proteinContent: formData.protein_content || '',
        fallingNumber: formData.falling_number || '',
        hectoliterWeight: formData.hectoliter_weight || '',
        testWeight: formData.test_weight || '',
        grainClass: formData.grain_class || '',
        qualityNotes: formData.quality_notes || ''
      },
      
      // Dane operacji
      operation: {
        type: formData.type === 'dostawa' ? 'Dostawa' : 'Odbiór',
        datetime: new Date(formData.datetime).toLocaleString('pl-PL'),
        expectedDuration: formData.expected_duration || '',
        gate: formData.gate || '',
        purpose: formData.purpose || '',
        specialInstructions: formData.special_instructions || ''
      },
      
      // Dane wagowe
      weights: {
        brutto: '', // Będzie wypełnione po ważeniu
        tara: '',   // Będzie wypełnione po ważeniu
        netto: ''   // Będzie wypełnione po ważeniu
      },
      
      // Dodatkowe informacje
      notes: formData.notes || '',
      isReturn: formData.is_return || false,
      returnReason: formData.return_reason || '',
      returnQuantity: formData.return_quantity || ''
    };
    
    setWzDocument(wzData);
    setShowWzDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteAppointment(id);
      showSuccess('Awizacja została usunięta');
    } catch (error) {
      showError('Wystąpił błąd podczas usuwania awizacji');
    }
  };

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

  // Komponent do wyświetlania dokumentu WZ
  const renderWzDocument = () => {
    if (!wzDocument) return null;
    
    return (
      <Dialog 
        open={showWzDialog} 
        onClose={() => setShowWzDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              📄 Dokument WZ - {wzDocument.wzNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FaPrint />}
                onClick={() => window.print()}
              >
                Drukuj
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FaDownload />}
                onClick={exportWzToPdf}
              >
                PDF
              </Button>
              <IconButton onClick={() => setShowWzDialog(false)}>
                <FaTimes />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, '@media print': { p: 0 } }} data-wz-document>
            {/* Nagłówek dokumentu */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #000', pb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                WZ - WEWNĘTRZNY ZWROT TOWARU
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Numer: {wzDocument.wzNumber} | Data: {wzDocument.wzDate}
              </Typography>
              {wzDocument.contractNumber && (
                <Typography variant="body1" color="text.secondary">
                  Kontrakt: {wzDocument.contractNumber}
                </Typography>
              )}
            </Box>

            <Grid container spacing={3}>
              {/* Sekcja 1: Dane nadawcy */}
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#2563eb' }}>
                      📤 NADAWCA
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Nazwa:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {wzDocument.shipper.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Adres:</Typography>
                      <Typography variant="body1">
                        {wzDocument.shipper.address}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Telefon:</Typography>
                      <Typography variant="body1">
                        {wzDocument.shipper.phone}
                      </Typography>
                    </Box>
                    {wzDocument.shipper.nip && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">NIP:</Typography>
                        <Typography variant="body1">
                          {wzDocument.shipper.nip}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 2: Dane odbiorcy */}
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#10b981' }}>
                      📥 ODBIORCA
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Nazwa:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {wzDocument.receiver.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Adres:</Typography>
                      <Typography variant="body1">
                        {wzDocument.receiver.address}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Telefon:</Typography>
                      <Typography variant="body1">
                        {wzDocument.receiver.phone}
                      </Typography>
                    </Box>
                    {wzDocument.receiver.nip && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">NIP:</Typography>
                        <Typography variant="body1">
                          {wzDocument.receiver.nip}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 3: Dane transportu */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#f59e0b' }}>
                      🚛 DANE TRANSPORTOWE
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Numer rejestracyjny:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.transport.plateNumber}
                        </Typography>
                      </Grid>
                      {wzDocument.transport.trailerPlate && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Przyczepa:</Typography>
                          <Typography variant="body1">
                            {wzDocument.transport.trailerPlate}
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.transport.driverName && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Kierowca:</Typography>
                          <Typography variant="body1">
                            {wzDocument.transport.driverName}
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.transport.company && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Firma:</Typography>
                          <Typography variant="body1">
                            {wzDocument.transport.company}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 4: Dane towaru */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#8b5cf6' }}>
                      📦 DANE TOWARU
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Rodzaj towaru:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.cargo.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Ilość:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.cargo.quantity} {wzDocument.cargo.unit}
                        </Typography>
                      </Grid>
                      {wzDocument.cargo.cargoType && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Typ ładunku:</Typography>
                          <Typography variant="body1">
                            {wzDocument.cargo.cargoType}
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.cargoWeight && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Waga ładunku:</Typography>
                          <Typography variant="body1">
                            {wzDocument.cargo.cargoWeight} {wzDocument.cargo.cargoUnit}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 5: Jakość zboża */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#059669' }}>
                      🌾 JAKOŚĆ ZBOŻA
                    </Typography>
                    <Grid container spacing={2}>
                      {wzDocument.cargo.moistureContent && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Wilgotność:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.moistureContent}%
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.impuritiesContent && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Zanieczyszczenia:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.impuritiesContent}%
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.proteinContent && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Białko:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.proteinContent}%
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.fallingNumber && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Liczba opadania:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.fallingNumber} s
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.hectoliterWeight && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Masa hektolitrowa:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.hectoliterWeight} kg/hl
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.testWeight && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Masa testowa:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.testWeight} kg/hl
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.grainClass && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Klasa zboża:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {wzDocument.cargo.grainClass}
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.cargo.qualityNotes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Notatki o jakości:</Typography>
                          <Typography variant="body1">
                            {wzDocument.cargo.qualityNotes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 6: Dane operacji */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#dc2626' }}>
                      ⚙️ DANE OPERACJI
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Typ operacji:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.operation.type}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">Data i czas:</Typography>
                        <Typography variant="body1">
                          {wzDocument.operation.datetime}
                        </Typography>
                      </Grid>
                      {wzDocument.operation.gate && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Brama:</Typography>
                          <Typography variant="body1">
                            {wzDocument.operation.gate}
                          </Typography>
                        </Grid>
                      )}
                      {wzDocument.operation.purpose && (
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Cel:</Typography>
                          <Typography variant="body1">
                            {wzDocument.operation.purpose}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                    {wzDocument.operation.specialInstructions && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Instrukcje specjalne:</Typography>
                        <Typography variant="body1">
                          {wzDocument.operation.specialInstructions}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 7: Dane wagowe */}
              <Grid item xs={12}>
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#7c3aed' }}>
                      ⚖️ DANE WAGOWE
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Brutto:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.weights.brutto || '---'} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Tara:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.weights.tara || '---'} kg
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Netto:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {wzDocument.weights.netto || '---'} kg
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Sekcja 8: Dodatkowe informacje */}
              {wzDocument.notes && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#059669' }}>
                        📝 DODATKOWE INFORMACJE
                      </Typography>
                      <Typography variant="body1">
                        {wzDocument.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Sekcja 9: Informacje o zwrocie */}
              {wzDocument.isReturn && (
                <Grid item xs={12}>
                  <Card sx={{ mb: 2, border: '2px solid #dc2626' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#dc2626' }}>
                        🔄 ZWROT TOWARU
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Powód zwrotu:</Typography>
                          <Typography variant="body1">
                            {wzDocument.returnReason}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Ilość zwracana:</Typography>
                          <Typography variant="body1">
                            {wzDocument.returnQuantity}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Podpis */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e5e7eb' }}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Podpis nadawcy
                    </Typography>
                    <Box sx={{ height: '60px', borderBottom: '1px solid #000' }} />
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Podpis odbiorcy
                    </Typography>
                    <Box sx={{ height: '60px', borderBottom: '1px solid #000' }} />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWzDialog(false)}>
            Zamknij
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FaPrint />}
            onClick={() => window.print()}
          >
            Drukuj
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Funkcja eksportu dokumentu WZ do PDF
  const exportWzToPdf = async () => {
    if (!wzDocument) return;
    
    try {
      // Znajdź element z dokumentem WZ
      const wzElement = document.querySelector('[data-wz-document]');
      if (!wzElement) {
        showError('Nie można znaleźć elementu dokumentu WZ');
        return;
      }

      // Konfiguracja html2canvas
      const canvas = await html2canvas(wzElement, {
        scale: 2, // Wyższa rozdzielczość
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: wzElement.scrollWidth,
        height: wzElement.scrollHeight
      });

      // Konfiguracja jsPDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Oblicz wymiary strony A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Oblicz wymiary obrazu
      const imgWidth = pageWidth - 20; // Margines 10mm z każdej strony
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Dodaj obraz do PDF
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      
      // Jeśli obraz jest wyższy niż strona, dodaj kolejne strony
      let heightLeft = imgHeight;
      let position = 10;
      
      while (heightLeft >= pageHeight) {
        position = heightLeft - pageHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Zapisz PDF
      const fileName = `WZ_${wzDocument.wzNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      showSuccess(`Dokument WZ został wyeksportowany jako ${fileName}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Błąd podczas eksportu do PDF:', error);
      }
      showError('Błąd podczas eksportu do PDF');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Ładowanie awizacji...</Typography>
      </Box>
    );
  }

  const [scaleConfigOpen, setScaleConfigOpen] = useState(false);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Lista awizacji
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={() => handleOpenDialog()}
        >
          Dodaj awizację
        </Button>
      </Box>

      {/* Filtry */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
                placeholder="Szukaj po numerze rejestracyjnym, kontrahencie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <FaSearch style={{ marginRight: 8, color: '#64748b' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
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
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredAppointments.length} wyników
              </Typography>
          </Grid>
        </Grid>
        </CardContent>
      </Card>

      {/* Lista awizacji */}
      <Card>
          <TableContainer sx={{ 
            overflowX: 'auto',
            '& .MuiTable-root': {
              minWidth: { xs: 800, md: 'auto' }
            }
          }}>
            <Table>
              <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 120 }}>Numer rej.</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Kontrahent</TableCell>
                <TableCell sx={{ minWidth: 100, display: { xs: 'none', sm: 'table-cell' } }}>Typ</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Data</TableCell>
                <TableCell sx={{ minWidth: 100, display: { xs: 'none', md: 'table-cell' } }}>Zboże</TableCell>
                <TableCell sx={{ minWidth: 80, display: { xs: 'none', sm: 'table-cell' } }}>Ilość</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Status</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Akcje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                    <TableCell>
                    <Typography variant="body2" sx={{ 
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {appointment.plate_number}
                          </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      maxWidth: 150,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                    {contractors.find(c => c.id === appointment.contractor_id)?.name || 'Nieznany'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip 
                      label={getTypeText(appointment.type)}
                        size="small" 
                      color={appointment.type === 'dostawa' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell sx={{
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                    {new Date(appointment.datetime).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {appointment.grain_name || 'Nieznane'}
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {appointment.quantity ? `${appointment.quantity} t` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusText(appointment.status)} 
                        color={getStatusColor(appointment.status)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(appointment)}
                        color="primary"
                        >
                          <FaEdit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(appointment.id)}
                        color="error"
                        >
                          <FaTrash />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredAppointments.length}
            page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Wierszy na stronę:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} z ${count}`}
          />
      </Card>

      {/* Dialog formularza */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
            maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 64px)' }
          }
        }}
      >
        <DialogTitle>
          {editingAppointment ? 'Edytuj awizację' : 'Dodaj nową awizację'}
        </DialogTitle>
        <DialogContent sx={{ 
          maxHeight: { xs: 'calc(100vh - 180px)', sm: '80vh' }, 
          overflow: 'auto',
          px: { xs: 1, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Sekcja 1: Podstawowe informacje */}
              <Grid item xs={12}>
                <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                  borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  📋 Podstawowe informacje
                    </Typography>
                  
                  <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} lg={8}>
                    <FormControl fullWidth error={!!formErrors.type}>
                      <InputLabel>Typ awizacji transportowej</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        label="Typ awizacji transportowej"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="dostawa">Dostawa</MenuItem>
                        <MenuItem value="odbiór">Odbiór</MenuItem>
                      </Select>
                      {formErrors.type && <FormHelperText>{formErrors.type}</FormHelperText>}
                    </FormControl>
                    </Grid>

                  <Grid item xs={12} sm={6} lg={4}>
                    <FormControl fullWidth>
                      <InputLabel>Kategoria dostawy</InputLabel>
                      <Select
                        value={formData.delivery_type}
                        onChange={(e) => handleFormChange('delivery_type', e.target.value)}
                        label="Kategoria dostawy"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="skup">Skup od rolników</MenuItem>
                        <MenuItem value="kontrakt">Dostawa na podstawie kontraktu</MenuItem>
                        <MenuItem value="inne">Inne</MenuItem>
                      </Select>
                    </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Data i czas"
                      type="datetime-local"
                      value={formData.datetime}
                      onChange={(e) => handleFormChange('datetime', e.target.value)}
                      error={!!formErrors.datetime}
                      helperText={formErrors.datetime}
                      InputLabelProps={{ shrink: true }}
                    />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Numer kontraktu"
                      value={formData.contract_number}
                      onChange={(e) => handleFormChange('contract_number', e.target.value)}
                      helperText="Numer kontraktu (dla dostaw wychodzących)"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} lg={8}>
                    <FormControl fullWidth error={!!formErrors.grain_id}>
                      <InputLabel>Rodzaj dostarczanego zboża</InputLabel>
                      <Select
                        value={formData.grain_id}
                        onChange={(e) => handleFormChange('grain_id', e.target.value)}
                        label="Rodzaj dostarczanego zboża"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {grains.map((grain) => (
                          <MenuItem key={grain.id} value={grain.id}>
                            {grain.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.grain_id && <FormHelperText>{formErrors.grain_id}</FormHelperText>}
                    </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Ilość (t)"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleFormChange('quantity', e.target.value)}
                      error={!!formErrors.quantity}
                      helperText={formErrors.quantity}
                    />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

            {/* Sekcja 2: Informacje o pojeździe */}
              <Grid item xs={12}>
    <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                  borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  🚛 Informacje o pojeździe
                    </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numer rejestracyjny pojazdu"
                      value={formData.plate_number}
                      onChange={(e) => handleFormChange('plate_number', e.target.value)}
                      error={!!formErrors.plate_number}
                      helperText={formErrors.plate_number}
                      sx={{ 
                        '& .MuiInputLabel-root': { 
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'visible'
                        },
                        '& .MuiInputLabel-shrink': {
                          transform: 'translate(14px, -9px) scale(0.75)'
                        }
                      }}
                    />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Numer rejestracyjny przyczepy"
                      value={formData.trailer_plate}
                      onChange={(e) => handleFormChange('trailer_plate', e.target.value)}
                      helperText="Opcjonalnie"
                      sx={{ 
                        '& .MuiInputLabel-root': { 
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'visible'
                        },
                        '& .MuiInputLabel-shrink': {
                          transform: 'translate(14px, -9px) scale(0.75)'
                        }
                      }}
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Imię i nazwisko kierowcy"
                      value={formData.driver_name}
                      onChange={(e) => handleFormChange('driver_name', e.target.value)}
                      helperText="Imię i nazwisko kierowcy"
                      sx={{ 
                        '& .MuiInputLabel-root': { 
                          fontSize: '0.95rem',
                          whiteSpace: 'nowrap',
                          overflow: 'visible'
                        },
                        '& .MuiInputLabel-shrink': {
                          transform: 'translate(14px, -9px) scale(0.75)'
                        }
                      }}
                    />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Telefon kierowcy"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      helperText="Numer telefonu kierowcy"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Firma transportowa"
                      value={formData.company}
                      onChange={(e) => handleFormChange('company', e.target.value)}
                      helperText="Nazwa firmy transportowej"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            
            {/* Sekcja 3: Informacje o kontrahencie */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  👥 Informacje o kontrahencie
                        </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} lg={8}>
                    <FormControl fullWidth error={!!formErrors.contractor_id}>
                      <InputLabel>Kontrahent dostawy</InputLabel>
                          <Select
                        value={formData.contractor_id}
                        onChange={(e) => handleFormChange('contractor_id', e.target.value)}
                        label="Kontrahent dostawy"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        {contractors.map((contractor) => (
                          <MenuItem key={contractor.id} value={contractor.id}>
                            {contractor.name}
                          </MenuItem>
                        ))}
                          </Select>
                      {formErrors.contractor_id && <FormHelperText>{formErrors.contractor_id}</FormHelperText>}
                        </FormControl>
                    </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nazwa kontrahenta"
                      value={formData.contractor_name}
                      onChange={(e) => handleFormChange('contractor_name', e.target.value)}
                      helperText="Dodatkowa nazwa kontrahenta"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Adres kontrahenta"
                      multiline
                      rows={2}
                      value={formData.contractor_address}
                      onChange={(e) => handleFormChange('contractor_address', e.target.value)}
                      helperText="Pełny adres kontrahenta"
                    />
              </Grid>

              <Grid item xs={12}>
                  <TextField
                    fullWidth
                      label="Adres dostawy"
                    multiline
                      rows={2}
                      value={formData.delivery_address}
                      onChange={(e) => handleFormChange('delivery_address', e.target.value)}
                      helperText="Adres dostawy/odbioru"
                    />
                  </Grid>
                </Grid>
                </Box>
              </Grid>

            {/* Sekcja 4: Informacje o nadawcy */}
              <Grid item xs={12}>
                <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                  borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  📦 Informacje o nadawcy
                    </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nazwa nadawcy"
                      value={formData.shipper_name}
                      onChange={(e) => handleFormChange('shipper_name', e.target.value)}
                      helperText="Nazwa nadawcy"
                    />
                    </Grid>

                  <Grid item xs={12}>
                        <TextField
                          fullWidth
                      label="Adres nadawcy"
                      multiline
                      rows={2}
                      value={formData.shipper_address}
                      onChange={(e) => handleFormChange('shipper_address', e.target.value)}
                      helperText="Adres nadawcy"
                    />
                  </Grid>
                </Grid>
                      </Box>
                    </Grid>

            {/* Sekcja 5: Szczegóły operacji */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  ⚙️ Szczegóły operacji
                        </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Brama"
                      value={formData.gate}
                      onChange={(e) => handleFormChange('gate', e.target.value)}
                      helperText="Numer bramy"
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Cel wizyty"
                      value={formData.purpose}
                      onChange={(e) => handleFormChange('purpose', e.target.value)}
                      helperText="Cel wizyty"
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Typ ładunku"
                      value={formData.cargo_type}
                      onChange={(e) => handleFormChange('cargo_type', e.target.value)}
                      helperText="Typ przewożonego ładunku"
                    />
                    </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Waga ładunku"
                      type="number"
                      value={formData.cargo_weight}
                      onChange={(e) => handleFormChange('cargo_weight', e.target.value)}
                      helperText="Waga ładunku"
                    />
                    </Grid>

                  <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Jednostka wagi"
                      value={formData.cargo_unit}
                      onChange={(e) => handleFormChange('cargo_unit', e.target.value)}
                      helperText="Jednostka wagi (t, kg, etc.)"
                    />
                    </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Numer WZ"
                      value={formData.wz_number}
                      onChange={(e) => handleFormChange('wz_number', e.target.value)}
                      helperText="Numer dokumentu WZ"
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Data WZ"
                      type="date"
                      value={formData.wz_date}
                      onChange={(e) => handleFormChange('wz_date', e.target.value)}
                      helperText="Data dokumentu WZ"
                      InputLabelProps={{ shrink: true }}
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Numer kontraktu (WZ)"
                      value={formData.contract_number}
                      onChange={(e) => handleFormChange('contract_number', e.target.value)}
                      helperText="Numer kontraktu do dokumentu WZ"
                    />
                    </Grid>

                  <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                      label="Przewidywany czas realizacji (godz.)"
                      type="number"
                      value={formData.expected_duration}
                      onChange={(e) => handleFormChange('expected_duration', e.target.value)}
                      helperText="Przybliżony czas realizacji"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Czas wjazdu"
                      type="time"
                      value={formData.entry_time}
                      onChange={(e) => handleFormChange('entry_time', e.target.value)}
                      helperText="Planowany czas wjazdu"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Oczekiwany czas wyjazdu"
                      type="time"
                      value={formData.expected_exit_time}
                      onChange={(e) => handleFormChange('expected_exit_time', e.target.value)}
                      helperText="Planowany czas wyjazdu"
                      InputLabelProps={{ shrink: true }}
                    />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

            {/* Sekcja 6: Informacje o zwrocie */}
              <Grid item xs={12}>
                <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                  borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  🔄 Informacje o zwrocie
                    </Typography>
                  
                  <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.is_return}
                            onChange={(e) => handleFormChange('is_return', e.target.checked)}
                          />
                        }
                        label="Czy to zwrot?"
                      />
                    </FormControl>
                    </Grid>

                  {formData.is_return && (
                      <>
                        <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                          label="Powód zwrotu"
                          value={formData.return_reason}
                          onChange={(e) => handleFormChange('return_reason', e.target.value)}
                          helperText="Powód zwrotu towaru"
                        />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                          label="Ilość zwracana"
                          type="number"
                          value={formData.return_quantity}
                          onChange={(e) => handleFormChange('return_quantity', e.target.value)}
                          helperText="Ilość zwracanego towaru"
                        />
                        </Grid>

                        <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Jednostka zwrotu"
                          value={formData.return_unit}
                          onChange={(e) => handleFormChange('return_unit', e.target.value)}
                          helperText="Jednostka zwracanego towaru"
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Data oryginalnej dostawy"
                          type="date"
                          value={formData.original_delivery_date}
                          onChange={(e) => handleFormChange('original_delivery_date', e.target.value)}
                          helperText="Data oryginalnej dostawy"
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Numer oryginalnej dostawy"
                          value={formData.original_delivery_number}
                          onChange={(e) => handleFormChange('original_delivery_number', e.target.value)}
                          helperText="Numer oryginalnej dostawy"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            </Grid>
            
            {/* Sekcja 7: Status i notatki */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  📝 Status i notatki
                            </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl>
                      <InputLabel id="status-label">Status</InputLabel>
                              <Select
                        labelId="status-label"
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        label="Status"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                        sx={{
                          '& .MuiSelect-select': {
                            minWidth: 'fit-content',
                            width: 'auto'
                          }
                        }}
                      >
                        <MenuItem value="oczekująca">Oczekująca</MenuItem>
                        <MenuItem value="w_trakcie">W trakcie</MenuItem>
                        <MenuItem value="zakończona">Zakończona</MenuItem>
                        <MenuItem value="anulowana">Anulowana</MenuItem>
                              </Select>
                            </FormControl>
                        </Grid>

                  <Grid item xs={12}>
                            <TextField
                              fullWidth
                      label="Notatki"
                      multiline
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      error={!!formErrors.notes}
                      helperText={formErrors.notes}
                    />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                              fullWidth
                      label="Specjalne instrukcje"
                      multiline
                      rows={3}
                      value={formData.special_instructions}
                      onChange={(e) => handleFormChange('special_instructions', e.target.value)}
                      helperText="Dodatkowe instrukcje dla obsługi"
                    />
                        </Grid>
                  </Grid>
                </Box>
              </Grid>

            {/* Sekcja 8: Jakość zboża */}
            <Grid item xs={12}>
              <Box sx={{ 
                p: { xs: 2, sm: 3 }, 
                mb: { xs: 2, sm: 3 }, 
                borderRadius: 2, 
                border: '2px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <Typography variant="h6" sx={{ 
                  mb: 3, 
                  color: '#2563eb',
                  fontWeight: 700,
                  borderBottom: '3px solid #2563eb',
                  pb: 1,
                  fontSize: '1.1rem'
                }}>
                  🌾 Jakość zboża
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={4}>
                    <TextField
                      fullWidth
                      label="Wilgotność (%)"
                      type="number"
                      value={formData.moisture_content}
                      onChange={(e) => handleFormChange('moisture_content', e.target.value)}
                      inputProps={{ step: 0.1, min: 0, max: 100 }}
                      helperText="Zawartość wody w zbożu"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6} lg={4}>
                    <TextField
                      fullWidth
                      label="Zanieczyszczenia (%)"
                      type="number"
                      value={formData.impurities_content}
                      onChange={(e) => handleFormChange('impurities_content', e.target.value)}
                      inputProps={{ step: 0.1, min: 0, max: 100 }}
                      helperText="Zawartość zanieczyszczeń"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Białko (%)"
                      type="number"
                      value={formData.protein_content}
                      onChange={(e) => handleFormChange('protein_content', e.target.value)}
                      inputProps={{ step: 0.1, min: 0, max: 100 }}
                      helperText="Zawartość białka"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Liczba opadania"
                      type="number"
                      value={formData.falling_number}
                      onChange={(e) => handleFormChange('falling_number', e.target.value)}
                      inputProps={{ min: 0 }}
                      helperText="Liczba opadania (sekundy)"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Masa hektolitrowa (kg/hl)"
                      type="number"
                      value={formData.hectoliter_weight}
                      onChange={(e) => handleFormChange('hectoliter_weight', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      helperText="Masa hektolitrowa"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Masa testowa (kg/hl)"
                      type="number"
                      value={formData.test_weight}
                      onChange={(e) => handleFormChange('test_weight', e.target.value)}
                      inputProps={{ step: 0.01, min: 0 }}
                      helperText="Masa testowa"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Klasa zboża</InputLabel>
                      <Select
                        value={formData.grain_class}
                        onChange={(e) => handleFormChange('grain_class', e.target.value)}
                        label="Klasa zboża"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300
                            }
                          }
                        }}
                      >
                        <MenuItem value="">Brak klasy</MenuItem>
                        <MenuItem value="A">Klasa A</MenuItem>
                        <MenuItem value="B">Klasa B</MenuItem>
                        <MenuItem value="C">Klasa C</MenuItem>
                        <MenuItem value="D">Klasa D</MenuItem>
                        <MenuItem value="E">Klasa E</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Notatki o jakości"
                      multiline
                      rows={2}
                      value={formData.quality_notes}
                      onChange={(e) => handleFormChange('quality_notes', e.target.value)}
                      helperText="Dodatkowe uwagi o jakości zboża"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button size="small" onClick={() => setScaleConfigOpen(true)}>
                        Ustawienia wagi…
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Anuluj</Button>
          <Button 
            onClick={generateWzDocument} 
            variant="outlined" 
            startIcon={<FaFileInvoiceDollar />}
            sx={{ mr: 1 }}
          >
            Generuj WZ
          </Button>
          <Button onClick={exportWzToPdf} variant="contained" startIcon={<FaDownload />}>
            Eksportuj do PDF
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAppointment ? 'Zapisz zmiany' : 'Dodaj'}
          </Button>
        </DialogActions>
      </Dialog>
      <ScaleConfigDialog open={scaleConfigOpen} onClose={() => setScaleConfigOpen(false)} onSaved={() => setScaleConfigOpen(false)} />
      
      {/* Dialog dokumentu WZ */}
      {renderWzDocument()}
    </Box>
  );
};

export default AppointmentsList;