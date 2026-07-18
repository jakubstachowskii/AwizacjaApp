import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';
import { MODULES } from '../../../theme/designTokens';

export default function OverviewView({ onNavigate }) {
  const [counts, setCounts] = useState({ tests: 0, certificates: 0, processes: 0, devices: 0 });

  useEffect(() => {
    (async () => {
      const [tests, certs, processes, devices] = await Promise.all([
        window.electronAPI.dbGetAll('jakosc_tests', 'id'),
        window.electronAPI.dbGetAll('jakosc_certificates', 'id'),
        window.electronAPI.dbGetAll('jakosc_processes', 'id'),
        window.electronAPI.dbGetAll('jakosc_devices', 'id')
      ]);
      setCounts({ tests: tests.length, certificates: certs.length, processes: processes.length, devices: devices.length });
    })();
  }, []);

  const cards = [
    { title: 'Badania laboratoryjne', value: counts.tests, key: 'tests' },
    { title: 'Certyfikaty', value: counts.certificates, key: 'certificates' },
    { title: 'Procesy HACCP/GMP', value: counts.processes, key: 'processes' },
    { title: 'Urządzenia lab.', value: counts.devices, key: 'devices' }
  ];

  return (
    <Box>
      <PageHeader
        title="Przegląd jakości"
        subtitle="Badania, certyfikaty i dokumentacja procesów"
      />
      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.key}>
            <StatCard
              title={c.title}
              value={c.value}
              accent={MODULES.jakosc.accent}
              onOpen={() => onNavigate(c.key)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
