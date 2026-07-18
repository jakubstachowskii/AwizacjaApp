import React, { useState, useEffect, useCallback } from 'react';
import { FaHome, FaUsers, FaShoppingCart, FaFileInvoiceDollar } from 'react-icons/fa';
import ModuleShellLayout from '../../layouts/ModuleShellLayout';
import SalesStatusBar from './SalesStatusBar';

export const SALES_NAV_ITEMS = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'customers', label: 'Klienci', icon: FaUsers },
  { key: 'orders', label: 'Zamówienia', icon: FaShoppingCart },
  { key: 'invoices', label: 'Faktury', icon: FaFileInvoiceDollar }
];

const SalesLayout = ({ value, onChange, children }) => {
  const [counters, setCounters] = useState({ customers: 0, orders: 0, invoices: 0 });

  const loadCounters = useCallback(async () => {
    try {
      const [customers, orders, invoices] = await Promise.all([
        window.electronAPI.dbGetAll('sales_customers', 'id'),
        window.electronAPI.dbGetAll('sales_orders', 'id'),
        window.electronAPI.dbGetAll('sales_invoices', 'id')
      ]);
      setCounters({ customers: customers.length, orders: orders.length, invoices: invoices.length });
    } catch {}
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  useEffect(() => {
    const handler = () => loadCounters();
    window.addEventListener('sales:refresh', handler);
    return () => window.removeEventListener('sales:refresh', handler);
  }, [loadCounters]);

  return (
    <ModuleShellLayout
      moduleId="sprzedaz"
      navItems={SALES_NAV_ITEMS}
      value={value}
      onChange={onChange}
      statusBar={SalesStatusBar}
      statusBarProps={{ counters }}
    >
      {children}
    </ModuleShellLayout>
  );
};

export default SalesLayout;
