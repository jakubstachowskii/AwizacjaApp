import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Typography, Divider, Chip } from '@mui/material';

// Prosty wykres słupkowy bez dodatkowych zależności (SVG)
const Bar = ({ label, value, max, color }) => {
  const height = max > 0 ? Math.max(2, (value / max) * 120) : 2;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
      <Box component="svg" width={40} height={140}>
        <rect x={10} y={140 - height} width={20} height={height} fill={color} rx={4} />
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5 }}>{label}</Typography>
      <Typography variant="caption" color="text.secondary">{value.toFixed(2)}</Typography>
    </Box>
  );
};

const AnalyticsDashboard = () => {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const rows = await window.electronAPI.dbGetAll('skup_intakes', 'intake_datetime');
        setIntakes(rows || []);
      } catch (e) {
        console.error('Błąd ładowania przyjęć:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const last30Days = useMemo(() => {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return intakes.filter(r => new Date(r.intake_datetime || r.created_at) >= from);
  }, [intakes]);

  const stats = useMemo(() => {
    const byType = { contract: { sum: 0, qty: 0 }, individual: { sum: 0, qty: 0 } };
    last30Days.forEach(r => {
      const type = r.contract_id ? 'contract' : 'individual';
      const qty = parseFloat(r.net_weight) || 0;
      const price = parseFloat(r.price_per_unit) || 0;
      byType[type].sum += qty * price;
      byType[type].qty += qty;
    });
    const avgContract = byType.contract.qty > 0 ? byType.contract.sum / byType.contract.qty : 0;
    const avgIndividual = byType.individual.qty > 0 ? byType.individual.sum / byType.individual.qty : 0;
    return {
      avgContract,
      avgIndividual,
      totalQtyContract: byType.contract.qty,
      totalQtyIndividual: byType.individual.qty,
    };
  }, [last30Days]);

  const barMax = Math.max(stats.avgContract, stats.avgIndividual);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>📊 Dashboard analityczny</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Średnia cena (ostatnie 30 dni)</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'center', height: 160 }}>
                <Bar label="Kontrakt" value={stats.avgContract} max={barMax} color="#2563eb" />
                <Bar label="Indywidualna" value={stats.avgIndividual} max={barMax} color="#10b981" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                <Chip label={`Kontrakt: ${stats.avgContract.toFixed(2)} /t`} color="primary" variant="outlined" />
                <Chip label={`Indywidualna: ${stats.avgIndividual.toFixed(2)} /t`} color="success" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Wolumen przyjęć (t)</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Kontrakt</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.totalQtyContract.toFixed(3)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Indywidualna</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{stats.totalQtyIndividual.toFixed(3)}</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {loading ? 'Ładowanie…' : `Zaktualizowano: ${new Date().toLocaleString()}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;


