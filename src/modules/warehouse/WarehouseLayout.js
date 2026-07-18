import React, { useState, useEffect, useCallback } from 'react';
import {
  FaHome, FaIndustry, FaLayerGroup, FaExchangeAlt, FaClipboardList, FaChartBar
} from 'react-icons/fa';
import ModuleShellLayout from '../../layouts/ModuleShellLayout';
import WarehouseStatusBar from './WarehouseStatusBar';

export const WAREHOUSE_NAV_ITEMS = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'inventory', label: 'Magazyny', icon: FaIndustry },
  { key: 'batches', label: 'Partie', icon: FaLayerGroup },
  { key: 'movements', label: 'Ruchy', icon: FaExchangeAlt },
  { key: 'transfers', label: 'Przesunięcia', icon: FaExchangeAlt },
  { key: 'inventories', label: 'Inwentaryzacja', icon: FaClipboardList },
  { key: 'reports', label: 'Raporty', icon: FaChartBar }
];

const WarehouseLayout = ({ value, onChange, children }) => {
  const [counters, setCounters] = useState({ warehouses: 0, stocks: 0, movements: 0 });

  const loadCounters = useCallback(async () => {
    try {
      const [wh, st, mv] = await Promise.all([
        window.electronAPI.dbGetAll('magazyn_warehouses', 'id'),
        window.electronAPI.dbGetAll('magazyn_stock_levels', 'id'),
        window.electronAPI.dbGetAll('magazyn_movements', 'id')
      ]);
      setCounters({ warehouses: wh.length, stocks: st.length, movements: mv.length });
    } catch {}
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  return (
    <ModuleShellLayout
      moduleId="magazyn"
      navItems={WAREHOUSE_NAV_ITEMS}
      value={value}
      onChange={onChange}
      statusBar={WarehouseStatusBar}
      statusBarProps={{ counters }}
    >
      {children}
    </ModuleShellLayout>
  );
};

export default WarehouseLayout;
