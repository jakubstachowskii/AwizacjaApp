import React, { useState, useCallback, useEffect } from 'react';
import ModuleShellLayout from '../../layouts/ModuleShellLayout';
import { SKUP_NAV_ITEMS } from './SkupNavigation';
import SkupStatusBar from './SkupStatusBar';

const SkupLayout = ({ value, onChange, children }) => {
  const [counters, setCounters] = useState({ intakes: 0, documents: 0, prices: 0, contractors: 0, grains: 0 });

  const loadCounters = useCallback(async () => {
    try {
      const [intakes, documents, prices, contractors, grains] = await Promise.all([
        window.electronAPI.dbGetAll('skup_intakes', 'id'),
        window.electronAPI.dbGetAll('skup_documents', 'id'),
        window.electronAPI.dbGetAll('skup_prices', 'id'),
        window.electronAPI.dbGetAll('skup_contractors', 'id'),
        window.electronAPI.dbGetAll('skup_grains', 'id')
      ]);
      setCounters({
        intakes: intakes.length,
        documents: documents.length,
        prices: prices.length,
        contractors: contractors.length,
        grains: grains.length
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
    }
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  useEffect(() => {
    const handler = () => loadCounters();
    window.addEventListener('skup:refresh', handler);
    return () => window.removeEventListener('skup:refresh', handler);
  }, [loadCounters]);

  return (
    <ModuleShellLayout
      moduleId="skup"
      navItems={SKUP_NAV_ITEMS}
      value={value}
      onChange={onChange}
      statusBar={SkupStatusBar}
      statusBarProps={{ counters }}
    >
      {children}
    </ModuleShellLayout>
  );
};

export default SkupLayout;
