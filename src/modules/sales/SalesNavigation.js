import React from 'react';
import { FaHome, FaUsers, FaShoppingCart, FaFileInvoiceDollar, FaNetworkWired } from 'react-icons/fa';
import ModuleNavigation from '../../layouts/ModuleNavigation';

const items = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'customers', label: 'Klienci', icon: FaUsers },
  { key: 'orders', label: 'Zamówienia', icon: FaShoppingCart },
  { key: 'invoices', label: 'Faktury', icon: FaFileInvoiceDollar },
  { key: 'devices', label: 'Urządzenia', icon: FaNetworkWired }
];

export default function SalesNavigation(props) {
  return <ModuleNavigation moduleId="sprzedaz" items={items} {...props} />;
}
