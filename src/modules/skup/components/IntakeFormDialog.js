import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
  FormHelperText
} from '@mui/material';
import { FaSeedling, FaWeight, FaCalculator } from 'react-icons/fa';
import ScaleConfigDialog from './ScaleConfigDialog';

const Section = ({ title, color, children }) => (
  <Box sx={{ 
    p: { xs: 2, sm: 3 }, 
    mb: { xs: 2, sm: 3 }, 
    borderRadius: 2, 
    border: '2px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <Typography variant="h6" sx={{ 
      mb: { xs: 2, sm: 3 }, 
      color,
      fontWeight: 700,
      borderBottom: `3px solid ${color}`,
      pb: 1,
      fontSize: { xs: '1rem', sm: '1.1rem' }
    }}>
      {title}
    </Typography>
    {children}
  </Box>
);

const IntakeFormDialog = ({ open, onClose, initialData, onSubmit, contractors = [], grains = [] }) => {
  const [formData, setFormData] = useState({
    intake_datetime: new Date().toISOString().slice(0, 16),
    delivery_type: '', // 'contract' lub 'individual'
    contractor_id: '',
    grain_id: '',
    document_number: '',
    gross_weight: '',
    tare_weight: '',
    net_weight: '',
    price_per_unit: '',
    currency: 'PLN',
    amount: '',
    moisture_content: '',
    impurities_content: '',
    protein_content: '',
    hectoliter_weight: '',
    quality_grade: 'A',
    status: 'przyjęty',
    notes: '',
    contract_id: '',
    correction_reason: '',
    // Nowe pola dla potrąceń
    deductions: [],
    price_corrections: [],
    final_amount: '',
    // Pola dla korekt cenowych dostaw indywidualnych
    price_adjustment: '',
    price_adjustment_reason: ''
  });

  const [errors, setErrors] = useState({});
  const [contracts, setContracts] = useState([]);
  const [qualityRules, setQualityRules] = useState([]);
  const [scaleWeight, setScaleWeight] = useState(null);
  const [currentPrices, setCurrentPrices] = useState([]);
  const [step, setStep] = useState(1); // 1: wybór typu, 2: szczegóły
  const [scaleConfigOpen, setScaleConfigOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  // Ładowanie kontraktów i reguł jakości
  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsData, rulesData, pricesData, warehousesData] = await Promise.all([
          window.electronAPI.dbGetAll('skup_contracts', 'contract_number'),
          window.electronAPI.dbGetAll('skup_quality_rules', 'id'),
          window.electronAPI.dbGetAll('skup_prices', 'id'),
          window.electronAPI.dbGetAll('magazyn_warehouses', 'name')
        ]);
        setContracts(contractsData);
        setQualityRules(rulesData);
        setCurrentPrices(pricesData);
        setWarehouses(warehousesData || []);
      } catch (error) {
        console.error('Błąd ładowania danych:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  // Inicjalizacja formularza
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          intake_datetime: initialData.intake_datetime || new Date().toISOString().slice(0, 16),
          contractor_id: initialData.contractor_id || '',
          grain_id: initialData.grain_id || '',
          document_number: initialData.document_number || '',
          gross_weight: initialData.gross_weight || '',
          tare_weight: initialData.tare_weight || '',
          net_weight: initialData.net_weight || '',
          price_per_unit: initialData.price_per_unit || '',
          currency: initialData.currency || 'PLN',
          amount: initialData.amount || '',
          moisture_content: initialData.moisture_content || '',
          impurities_content: initialData.impurities_content || '',
          protein_content: initialData.protein_content || '',
          hectoliter_weight: initialData.hectoliter_weight || '',
          quality_grade: initialData.quality_grade || 'A',
          status: initialData.status || 'przyjęty',
          notes: initialData.notes || '',
          contract_id: initialData.contract_id || '',
          correction_reason: '',
          warehouse_id: ''
        });
      } else {
        setFormData({
          intake_datetime: new Date().toISOString().slice(0, 16),
          contractor_id: '',
          grain_id: '',
          document_number: '',
          gross_weight: '',
          tare_weight: '',
          net_weight: '',
          price_per_unit: '',
          currency: 'PLN',
          amount: '',
          moisture_content: '',
          impurities_content: '',
          protein_content: '',
          hectoliter_weight: '',
          quality_grade: 'A',
          status: 'przyjęty',
          notes: '',
          contract_id: '',
          correction_reason: '',
          warehouse_id: ''
        });
      }
      setErrors({});
    }
  }, [open, initialData]);

  // Automatyczne obliczanie wagi netto
  useEffect(() => {
    const gross = parseFloat(formData.gross_weight) || 0;
    const tare = parseFloat(formData.tare_weight) || 0;
    if (gross > 0 && tare > 0) {
      const net = Math.max(0, gross - tare);
      setFormData(prev => ({ ...prev, net_weight: net.toFixed(3) }));
    }
  }, [formData.gross_weight, formData.tare_weight]);

  // Automatyczne obliczanie kwoty
  useEffect(() => {
    const netWeight = parseFloat(formData.net_weight) || 0;
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    if (netWeight > 0 && pricePerUnit > 0) {
      const baseAmount = netWeight * pricePerUnit;
      
      // Oblicz potrącenia jakościowe
      const applicableRules = qualityRules.filter(rule => 
        rule.grain_id === parseInt(formData.grain_id)
      );
      
      let totalDeduction = 0;
      applicableRules.forEach(rule => {
        const paramValue = parseFloat(formData[rule.param + '_content']) || 0;
        if (rule.min_value !== null && paramValue < rule.min_value) {
          totalDeduction += rule.deduction_type === 'percent' 
            ? (baseAmount * rule.deduction_value / 100)
            : rule.deduction_value;
        }
        if (rule.max_value !== null && paramValue > rule.max_value) {
          totalDeduction += rule.deduction_type === 'percent' 
            ? (baseAmount * rule.deduction_value / 100)
            : rule.deduction_value;
        }
      });

      const finalAmount = Math.max(0, baseAmount - totalDeduction);
      setFormData(prev => ({ ...prev, amount: finalAmount.toFixed(2) }));
    }
  }, [formData.net_weight, formData.price_per_unit, formData.moisture_content, 
      formData.impurities_content, formData.protein_content, formData.grain_id, qualityRules]);

  // Funkcja obliczania potrąceń jakościowych
  const calculateQualityDeductions = useCallback(() => {
    if (!formData.grain_id || !formData.net_weight || !formData.price_per_unit) return [];

    const deductions = [];
    let effectivePrice = parseFloat(formData.price_per_unit);
    
    // Uwzględnij korekty cenowe dla dostaw indywidualnych
    if (formData.delivery_type === 'individual' && formData.price_adjustment) {
      effectivePrice = effectivePrice * (1 + parseFloat(formData.price_adjustment) / 100);
    }
    
    const baseAmount = parseFloat(formData.net_weight) * effectivePrice;
    
    const applicableRules = qualityRules.filter(rule => 
      rule.grain_id === parseInt(formData.grain_id)
    );

    // Sprawdź wilgotność
    if (formData.moisture_content) {
      const moistureValue = parseFloat(formData.moisture_content);
      const moistureRules = applicableRules.filter(rule => rule.param === 'moisture');
      
      moistureRules.forEach(rule => {
        if ((rule.min_value !== null && moistureValue < rule.min_value) ||
            (rule.max_value !== null && moistureValue > rule.max_value)) {
          const deductionAmount = rule.deduction_type === 'percent' 
            ? (baseAmount * rule.deduction_value / 100)
            : rule.deduction_value;
          
          deductions.push({
            type: 'moisture',
            description: `Wilgotność: ${moistureValue}% (norma: ${rule.min_value || 0}-${rule.max_value || '∞'}%)`,
            amount: deductionAmount,
            rule_id: rule.id
          });
        }
      });
    }

    // Sprawdź zanieczyszczenia
    if (formData.impurities_content) {
      const impuritiesValue = parseFloat(formData.impurities_content);
      const impuritiesRules = applicableRules.filter(rule => rule.param === 'impurities');
      
      impuritiesRules.forEach(rule => {
        if ((rule.min_value !== null && impuritiesValue < rule.min_value) ||
            (rule.max_value !== null && impuritiesValue > rule.max_value)) {
          const deductionAmount = rule.deduction_type === 'percent' 
            ? (baseAmount * rule.deduction_value / 100)
            : rule.deduction_value;
          
          deductions.push({
            type: 'impurities',
            description: `Zanieczyszczenia: ${impuritiesValue}% (norma: ${rule.min_value || 0}-${rule.max_value || '∞'}%)`,
            amount: deductionAmount,
            rule_id: rule.id
          });
        }
      });
    }

    return deductions;
  }, [formData, qualityRules]);

  // Funkcja znajdowania aktualnej ceny dla dostaw indywidualnych
  const getCurrentPrice = useCallback(() => {
    if (!formData.grain_id) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const validPrices = currentPrices.filter(price => 
      price.grain_id === parseInt(formData.grain_id) &&
      price.valid_from <= today &&
      (!price.valid_to || price.valid_to >= today)
    );
    
    return validPrices.length > 0 ? validPrices[0] : null;
  }, [formData.grain_id, currentPrices]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Logika dla wyboru typu dostawy
    if (field === 'delivery_type') {
      if (value === 'individual') {
        // Dla dostaw indywidualnych - ustaw aktualną cenę
        const currentPrice = getCurrentPrice();
        if (currentPrice) {
          setFormData(prev => ({
            ...prev,
            price_per_unit: currentPrice.price_per_ton,
            currency: currentPrice.currency,
            contract_id: ''
          }));
        }
      } else if (value === 'contract') {
        setFormData(prev => ({ ...prev, contract_id: '', price_per_unit: '' }));
      }
    }

    // Automatyczne ustawienie ceny z cennika po zmianie zboża dla dostawy indywidualnej
    if (field === 'grain_id' && formData.delivery_type === 'individual') {
      const currentPrice = getCurrentPrice();
      if (currentPrice) {
        setFormData(prev => ({
          ...prev,
          price_per_unit: currentPrice.price_per_ton,
          currency: currentPrice.currency
        }));
      }
    }

    // Automatyczne wypełnienie ceny przy wyborze kontraktu
    if (field === 'contract_id' && value) {
      const contract = contracts.find(c => c.id === parseInt(value));
      if (contract) {
        setFormData(prev => ({
          ...prev,
          price_per_unit: contract.base_price_per_unit,
          currency: contract.currency
        }));
      }
    }

    // Przelicz potrącenia po zmianie parametrów jakościowych
    if (['moisture_content', 'impurities_content', 'protein_content', 'net_weight', 'price_per_unit', 'price_adjustment'].includes(field)) {
      setTimeout(() => {
        const deductions = calculateQualityDeductions();
        setFormData(prev => ({ ...prev, deductions }));
      }, 100);
    }
  };

  // Pobranie wagi z urządzenia
  const getWeightFromScale = async (type) => {
    try {
      const reading = await window.electronAPI.scaleGetLatest();
      if (reading && reading.value) {
        const weight = (reading.value / 1000).toFixed(3); // Konwersja kg -> t
        setFormData(prev => ({ 
          ...prev, 
          [type === 'gross' ? 'gross_weight' : 'tare_weight']: weight 
        }));
        setScaleWeight({ type, value: weight, timestamp: new Date() });
      }
    } catch (error) {
      console.error('Błąd pobierania wagi:', error);
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.delivery_type) newErrors.delivery_type = 'Typ dostawy jest wymagany';
    if (formData.delivery_type === 'contract' && !formData.contract_id) {
      newErrors.contract_id = 'Kontrakt jest wymagany dla dostawy kontraktowej';
    }
    if (!formData.contractor_id) newErrors.contractor_id = 'Kontrahent jest wymagany';
    if (!formData.grain_id) newErrors.grain_id = 'Zboże jest wymagane';
    if (!formData.gross_weight || parseFloat(formData.gross_weight) <= 0) {
      newErrors.gross_weight = 'Waga brutto musi być większa od 0';
    }
    if (!formData.tare_weight || parseFloat(formData.tare_weight) <= 0) {
      newErrors.tare_weight = 'Tara musi być większa od 0';
    }
    if (parseFloat(formData.gross_weight) <= parseFloat(formData.tare_weight)) {
      newErrors.gross_weight = 'Waga brutto musi być większa od tary';
    }
    
    // Walidacja parametrów jakości
    if (formData.moisture_content && (parseFloat(formData.moisture_content) < 0 || parseFloat(formData.moisture_content) > 100)) {
      newErrors.moisture_content = 'Wilgotność musi być między 0 a 100%';
    }
    if (formData.impurities_content && (parseFloat(formData.impurities_content) < 0 || parseFloat(formData.impurities_content) > 100)) {
      newErrors.impurities_content = 'Zanieczyszczenia muszą być między 0 a 100%';
    }
    if (formData.protein_content && (parseFloat(formData.protein_content) < 0 || parseFloat(formData.protein_content) > 100)) {
      newErrors.protein_content = 'Białko musi być między 0 a 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const intakeData = { ...formData };
      delete intakeData.correction_reason;
      delete intakeData.deductions;
      delete intakeData.price_corrections;
      delete intakeData.delivery_type;
      delete intakeData.contract_id;
      delete intakeData.warehouse_id;
      delete intakeData.quality_grade;
      delete intakeData.final_amount;
      delete intakeData.price_adjustment;
      delete intakeData.price_adjustment_reason;

      const result = await window.electronAPI.skupSaveIntake({
        intakeData,
        warehouseId: formData.warehouse_id,
        isUpdate: Boolean(initialData),
        intakeId: initialData?.id
      });

      const savedId = result?.id || initialData?.id;

      if (formData.correction_reason?.trim() && savedId) {
        if (initialData) {
          const auditEntries = [];
          if (formData.gross_weight !== initialData.gross_weight) {
            auditEntries.push({
              intake_id: savedId,
              field: 'gross_weight',
              old_value: initialData.gross_weight,
              new_value: formData.gross_weight,
              reason: formData.correction_reason,
              source: 'manual'
            });
          }
          if (formData.tare_weight !== initialData.tare_weight) {
            auditEntries.push({
              intake_id: savedId,
              field: 'tare_weight',
              old_value: initialData.tare_weight,
              new_value: formData.tare_weight,
              reason: formData.correction_reason,
              source: 'manual'
            });
          }
          for (const entry of auditEntries) {
            await window.electronAPI.dbInsert('skup_weight_audit', entry);
          }
        } else {
          await window.electronAPI.dbInsert('skup_weight_audit', {
            intake_id: savedId,
            field: 'manual_entry',
            old_value: null,
            new_value: `Brutto: ${formData.gross_weight}t, Tara: ${formData.tare_weight}t`,
            reason: formData.correction_reason,
            source: 'manual'
          });
        }
      }

      onSubmit(intakeData);
      onClose();
    } catch (error) {
      console.error('Błąd zapisywania:', error);
    }
  };

  // Filtruj kontrakty dla wybranego kontrahenta i zboża
  const availableContracts = useMemo(() => {
    return contracts.filter(contract => 
      (!formData.contractor_id || contract.contractor_id === parseInt(formData.contractor_id)) &&
      (!formData.grain_id || contract.grain_id === parseInt(formData.grain_id))
    );
  }, [contracts, formData.contractor_id, formData.grain_id]);

  // Sprawdź ważność kontraktu
  const selectedContract = contracts.find(c => c.id === parseInt(formData.contract_id));
  const contractWarning = useMemo(() => {
    if (!selectedContract) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const isExpired = selectedContract.valid_to && selectedContract.valid_to < today;
    const isNotStarted = selectedContract.valid_from > today;
    
    if (isExpired) return { type: 'error', message: 'Kontrakt wygasł!' };
    if (isNotStarted) return { type: 'warning', message: 'Kontrakt jeszcze nie obowiązuje!' };
    
    return null;
  }, [selectedContract]);

  return (
    <>
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 1, sm: 2 },
          width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
          maxHeight: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FaSeedling color="#10b981" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {initialData ? 'Edytuj przyjęcie' : 'Nowe przyjęcie'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        maxHeight: { xs: 'calc(100vh - 180px)', sm: '80vh' }, 
        overflow: 'auto',
        px: { xs: 1, sm: 3 },
        py: { xs: 2, sm: 3 }
      }}>
        <Section title="🚚 Typ dostawy" color="#dc2626">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.delivery_type}>
                <InputLabel>Wybierz typ dostawy</InputLabel>
                <Select
                  value={formData.delivery_type}
                  onChange={handleChange('delivery_type')}
                  label="Wybierz typ dostawy"
                >
                  <MenuItem value="contract">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>📄 Dostawa kontraktowa</Typography>
                      <Typography variant="body2" color="text.secondary">
                        - cena i warunki z kontraktu
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="individual">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>💰 Dostawa indywidualna</Typography>
                      <Typography variant="body2" color="text.secondary">
                        - cena aktualna, możliwość negocjacji
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
                {errors.delivery_type && <FormHelperText>{errors.delivery_type}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        </Section>

        {formData.delivery_type && (
          <Section title="📋 Podstawowe informacje" color="#2563eb">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data i czas przyjęcia"
                  value={formData.intake_datetime}
                  onChange={handleChange('intake_datetime')}
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.intake_datetime}
                  helperText={errors.intake_datetime}
                />
              </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Numer dokumentu"
                value={formData.document_number}
                onChange={handleChange('document_number')}
                error={!!errors.document_number}
                helperText={errors.document_number}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.contractor_id}>
                <InputLabel>Kontrahent</InputLabel>
                <Select
                  value={formData.contractor_id}
                  onChange={handleChange('contractor_id')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {contractors.map(contractor => (
                    <MenuItem key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.grain_id}>
                <InputLabel>Zboże</InputLabel>
                <Select
                  value={formData.grain_id}
                  onChange={handleChange('grain_id')}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {grains.map(grain => (
                    <MenuItem key={grain.id} value={grain.id}>
                      {grain.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Section>
        )}

        {formData.delivery_type && (
        <Section title="⚖️ Wagi i pomiary" color="#10b981">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Magazyn docelowy</InputLabel>
                <Select
                  value={formData.warehouse_id || ''}
                  label="Magazyn docelowy"
                  onChange={handleChange('warehouse_id')}
                >
                  <MenuItem value="">(Domyślny)</MenuItem>
                  {warehouses.map(w => (
                    <MenuItem key={w.id} value={w.id}>{w.name} ({w.code || '—'})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Brutto [t]"
                  type="number"
                  value={formData.gross_weight}
                  onChange={handleChange('gross_weight')}
                  error={!!errors.gross_weight}
                  helperText={errors.gross_weight}
                  inputProps={{ step: 0.001, min: 0 }}
                />
                <IconButton 
                  color="primary" 
                  onClick={() => getWeightFromScale('gross')}
                  sx={{ mb: errors.gross_weight ? 2.5 : 0 }}
                  title="Pobierz z wagi"
                >
                  <FaWeight />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Tara [t]"
                  type="number"
                  value={formData.tare_weight}
                  onChange={handleChange('tare_weight')}
                  error={!!errors.tare_weight}
                  helperText={errors.tare_weight}
                  inputProps={{ step: 0.001, min: 0 }}
                />
                <IconButton 
                  color="primary" 
                  onClick={() => getWeightFromScale('tare')}
                  sx={{ mb: errors.tare_weight ? 2.5 : 0 }}
                  title="Pobierz z wagi"
                >
                  <FaWeight />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Netto [t]"
                type="number"
                value={formData.net_weight}
                InputProps={{ readOnly: true }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    backgroundColor: '#f8fafc',
                    fontWeight: 600,
                    color: '#10b981'
                  }
                }}
              />
            </Grid>

            {formData.correction_reason !== undefined && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Powód korekty (opcjonalnie)"
                  multiline
                  rows={2}
                  value={formData.correction_reason}
                  onChange={handleChange('correction_reason')}
                  helperText="Uzasadnienie dla ręcznych korekt wag (w przypadku awarii urządzenia)"
                  sx={{ mt: 1 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button size="small" onClick={() => setScaleConfigOpen(true)}>
                  Ustawienia wagi…
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Section>
        )}

        {/* Sekcja dla dostaw kontraktowych */}
        {formData.delivery_type === 'contract' && (
          <Section title="📄 Kontrakt" color="#7c3aed">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.contract_id}>
                  <InputLabel>Wybierz kontrakt</InputLabel>
                  <Select
                    value={formData.contract_id}
                    onChange={handleChange('contract_id')}
                  >
                    {availableContracts.map(contract => (
                      <MenuItem key={contract.id} value={contract.id}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {contract.contract_number}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contract.base_price_per_unit} {contract.currency}/t • 
                            Ważny do: {contract.valid_to || 'bezterminowo'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.contract_id && <FormHelperText>{errors.contract_id}</FormHelperText>}
                </FormControl>
                {contractWarning && (
                  <Alert severity={contractWarning.type} sx={{ mt: 1 }}>
                    {contractWarning.message}
                  </Alert>
                )}
              </Grid>
            </Grid>
          </Section>
        )}

        {/* Sekcja dla dostaw indywidualnych */}
        {formData.delivery_type === 'individual' && (
          <Section title="💰 Cena indywidualna" color="#f59e0b">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Cena została automatycznie ustawiona na podstawie aktualnego cennika. 
                    Możesz ją zmodyfikować w przypadku negocjacji.
                  </Typography>
                </Alert>
              </Grid>

              {/* Możliwość dodania dodatkowych korekt cenowych */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Korekta cenowa (%)"
                  type="number"
                  value={formData.price_adjustment || ''}
                  onChange={handleChange('price_adjustment')}
                  helperText="Dodatnia wartość = podwyżka, ujemna = obniżka"
                  inputProps={{ step: 0.1, min: -50, max: 50 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Powód korekty ceny"
                  value={formData.price_adjustment_reason || ''}
                  onChange={handleChange('price_adjustment_reason')}
                  helperText="Uzasadnienie dla korekty (opcjonalne)"
                />
              </Grid>

              {formData.price_adjustment && (
                <Grid item xs={12}>
                  <Box sx={{
                    p: 2,
                    backgroundColor: formData.price_adjustment > 0 ? '#f0fdf4' : '#fef2f2',
                    borderRadius: 1,
                    border: `1px solid ${formData.price_adjustment > 0 ? '#22c55e' : '#ef4444'}`
                  }}>
                    <Typography variant="body2" sx={{ 
                      color: formData.price_adjustment > 0 ? '#16a34a' : '#dc2626',
                      fontWeight: 600 
                    }}>
                      Korekta: {formData.price_adjustment > 0 ? '+' : ''}{formData.price_adjustment}% 
                      ({formData.price_adjustment_reason || 'Brak uzasadnienia'})
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: formData.price_adjustment > 0 ? '#16a34a' : '#dc2626' 
                    }}>
                      Nowa cena: {(parseFloat(formData.price_per_unit || 0) * (1 + parseFloat(formData.price_adjustment || 0) / 100)).toFixed(2)} {formData.currency}/t
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Section>
        )}

        {/* Wspólna sekcja cen - pokazywana gdy typ dostawy jest wybrany */}
        {formData.delivery_type && (
          <Section title="💵 Szczegóły cenowe" color="#f59e0b">
            <Grid container spacing={2}>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Cena za tonę"
                type="number"
                value={formData.price_per_unit}
                onChange={handleChange('price_per_unit')}
                error={!!errors.price_per_unit}
                helperText={errors.price_per_unit}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Waluta</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={handleChange('currency')}
                >
                  <MenuItem value="PLN">PLN</MenuItem>
                  <MenuItem value="EUR">EUR</MenuItem>
                  <MenuItem value="USD">USD</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                p: 2,
                backgroundColor: '#f0f9ff',
                borderRadius: 1,
                border: '1px solid #0ea5e9'
              }}>
                <FaCalculator color="#0ea5e9" />
                <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                  Kwota końcowa: {formData.amount} {formData.currency}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Section>
        )}

        <Section title="🔬 Parametry jakościowe" color="#8b5cf6">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <FormControl fullWidth>
                <InputLabel>Klasa jakości</InputLabel>
                <Select
                  value={formData.quality_grade}
                  onChange={handleChange('quality_grade')}
                >
                  <MenuItem value="A">Klasa A</MenuItem>
                  <MenuItem value="B">Klasa B</MenuItem>
                  <MenuItem value="C">Klasa C</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <TextField
                fullWidth
                label="Wilgotność (%)"
                type="number"
                value={formData.moisture_content}
                onChange={handleChange('moisture_content')}
                error={!!errors.moisture_content}
                helperText={errors.moisture_content}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <TextField
                fullWidth
                label="Zanieczyszczenia (%)"
                type="number"
                value={formData.impurities_content}
                onChange={handleChange('impurities_content')}
                error={!!errors.impurities_content}
                helperText={errors.impurities_content}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Białko (%)"
                type="number"
                value={formData.protein_content}
                onChange={handleChange('protein_content')}
                error={!!errors.protein_content}
                helperText={errors.protein_content}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Masa hektolitrowa (kg/hl)"
                type="number"
                value={formData.hectoliter_weight}
                onChange={handleChange('hectoliter_weight')}
                inputProps={{ step: 0.1, min: 0 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={handleChange('status')}
                >
                  <MenuItem value="przyjęty">Przyjęty</MenuItem>
                  <MenuItem value="w_trakcie">W trakcie</MenuItem>
                  <MenuItem value="zakończony">Zakończony</MenuItem>
                  <MenuItem value="anulowany">Anulowany</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Section>

        {/* Sekcja potrąceń - pokazywana gdy są obliczone potrącenia */}
        {formData.deductions && formData.deductions.length > 0 && (
          <Section title="⚠️ Potrącenia jakościowe" color="#dc2626">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Na podstawie parametrów jakości zostały automatycznie obliczone następujące potrącenia:
                  </Typography>
                </Alert>
              </Grid>
              
              {formData.deductions.map((deduction, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{
                    p: 2,
                    border: '1px solid #f87171',
                    borderRadius: 1,
                    backgroundColor: '#fef2f2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="body2" sx={{ color: '#dc2626' }}>
                      {deduction.description}
                    </Typography>
                    <Chip 
                      label={`-${deduction.amount.toFixed(2)} ${formData.currency}`}
                      color="error"
                      size="small"
                    />
                  </Box>
                </Grid>
              ))}
              
              <Grid item xs={12}>
                <Box sx={{
                  p: 2,
                  backgroundColor: '#f0f9ff',
                  borderRadius: 1,
                  border: '1px solid #0ea5e9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                    Kwota po potrąceniach:
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#0ea5e9', fontWeight: 600 }}>
                    {(
                      parseFloat(formData.net_weight || 0) * parseFloat(formData.price_per_unit || 0) -
                      formData.deductions.reduce((sum, d) => sum + d.amount, 0)
                    ).toFixed(2)} {formData.currency}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Section>
        )}

        <Section title="📝 Uwagi" color="#64748b">
          <TextField
            fullWidth
            label="Uwagi"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange('notes')}
          />
        </Section>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ 
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Anuluj
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {initialData ? 'Zaktualizuj' : 'Dodaj'}
        </Button>
      </DialogActions>
    </Dialog>
    <ScaleConfigDialog
      open={scaleConfigOpen}
      onClose={() => setScaleConfigOpen(false)}
      onSaved={() => setScaleConfigOpen(false)}
    />
    </>
  );
};

export default IntakeFormDialog;