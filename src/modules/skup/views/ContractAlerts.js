import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import useContractExpiryAlerts from '../hooks/useContractExpiryAlerts';

const ContractAlerts = () => {
  const alerts = useContractExpiryAlerts(14);
  if (!alerts.length) return null;
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>🔔 Alerty kontraktów</Typography>
      {alerts.map(a => (
        <Alert key={a.id} severity={a.status === 'expired' ? 'error' : 'warning'} sx={{ mb: 1 }}>
          Kontrakt {a.contract_number} dla zboża #{a.grain_id} i kontrahenta #{a.contractor_id} 
          {a.status === 'expired' ? ' wygasł' : ' wygaśnie wkrótce'} (do: {a.valid_to || '—'})
        </Alert>
      ))}
    </Box>
  );
};

export default ContractAlerts;


