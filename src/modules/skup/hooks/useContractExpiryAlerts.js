import { useEffect, useState } from 'react';

// Hook zwracający listę kontraktów, które wygasły lub wygasają wkrótce
export default function useContractExpiryAlerts(daysThreshold = 7) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const contracts = await window.electronAPI.dbGetAll('skup_contracts', 'valid_to');
        const today = new Date().toISOString().split('T')[0];
        const soon = new Date();
        soon.setDate(soon.getDate() + daysThreshold);
        const soonStr = soon.toISOString().split('T')[0];

        const list = (contracts || []).map(c => {
          let status = null;
          if (c.valid_to) {
            if (c.valid_to < today) status = 'expired';
            else if (c.valid_to <= soonStr) status = 'expiring';
          }
          return status ? { ...c, status } : null;
        }).filter(Boolean);

        if (mounted) setAlerts(list);
      } catch (e) {
        console.error('Błąd ładowania kontraktów:', e);
      }
    };
    load();
    const id = setInterval(load, 60_000); // odśwież co minutę
    return () => { mounted = false; clearInterval(id); };
  }, [daysThreshold]);

  return alerts;
}


