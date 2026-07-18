import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';

// Prosty wykres liniowy (SVG)
const LineChart = ({ data = [], color = '#2563eb' }) => {
  const width = 600;
  const height = 200;
  const padding = 30;
  if (!data.length) return <Box sx={{ height }} />;
  const maxY = Math.max(...data.map(d => d.y));
  const minY = Math.min(...data.map(d => d.y));
  const rangeY = Math.max(1, maxY - minY);
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + (1 - (d.y - minY) / rangeY) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <Box component="svg" width={width} height={height} sx={{ maxWidth: '100%' }}>
      <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
    </Box>
  );
};

const PriceHistory = () => {
  const [grains, setGrains] = useState([]);
  const [prices, setPrices] = useState([]);
  const [grainId, setGrainId] = useState('');

  useEffect(() => {
    const load = async () => {
      const [g, p] = await Promise.all([
        window.electronAPI.dbGetAll('skup_grains', 'name'),
        window.electronAPI.dbGetAll('skup_prices', 'valid_from')
      ]);
      setGrains(g || []);
      setPrices(p || []);
      if ((g || []).length) setGrainId(g[0].id.toString());
    };
    load();
  }, []);

  const series = useMemo(() => {
    const filtered = prices
      .filter(x => x.grain_id === parseInt(grainId))
      .sort((a, b) => (a.valid_from > b.valid_from ? 1 : -1));
    return filtered.map((x, i) => ({ x: i, y: parseFloat(x.price_per_unit) }));
  }, [prices, grainId]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Historia cen</Typography>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl sx={{ minWidth: 240 }}>
              <InputLabel>Zboże</InputLabel>
              <Select value={grainId} label="Zboże" onChange={e => setGrainId(e.target.value)}>
                {grains.map(g => (
                  <MenuItem key={g.id} value={g.id.toString()}>{g.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <LineChart data={series} />
        </CardContent>
      </Card>
    </Box>
  );
};

export default PriceHistory;


