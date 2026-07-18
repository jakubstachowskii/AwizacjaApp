import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';
import { MODULES } from '../../../theme/designTokens';

export default function OverviewView({ onNavigate }) {
  const [counts, setCounts] = useState({ customers: 0, orders: 0, invoices: 0 });

  useEffect(() => {
    (async () => {
      const [customers, orders, invoices] = await Promise.all([
        window.electronAPI.dbGetAll('sales_customers', 'id'),
        window.electronAPI.dbGetAll('sales_orders', 'id'),
        window.electronAPI.dbGetAll('sales_invoices', 'id')
      ]);
      setCounts({ customers: customers.length, orders: orders.length, invoices: invoices.length });
    })();
  }, []);

  const cards = [
    { title: 'Klienci', value: counts.customers, key: 'customers' },
    { title: 'Zamówienia', value: counts.orders, key: 'orders' },
    { title: 'Faktury', value: counts.invoices, key: 'invoices' }
  ];

  return (
    <Box>
      <PageHeader
        title="Przegląd sprzedaży"
        subtitle="Podsumowanie klientów, zamówień i faktur"
      />
      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.key}>
            <StatCard
              title={c.title}
              value={c.value}
              accent={MODULES.sprzedaz.accent}
              onOpen={() => onNavigate(c.key)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
