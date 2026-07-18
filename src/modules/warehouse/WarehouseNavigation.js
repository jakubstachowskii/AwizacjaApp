import React from 'react';
import {
  FaHome, FaIndustry, FaLayerGroup, FaExchangeAlt, FaClipboardList, FaChartBar, FaNetworkWired
} from 'react-icons/fa';
import ModuleNavigation from '../../layouts/ModuleNavigation';

const items = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'inventory', label: 'Magazyny', icon: FaIndustry },
  { key: 'batches', label: 'Partie', icon: FaLayerGroup },
  { key: 'movements', label: 'Ruchy', icon: FaExchangeAlt },
  { key: 'transfers', label: 'Przesunięcia', icon: FaExchangeAlt },
  { key: 'inventories', label: 'Inwentaryzacja', icon: FaClipboardList },
  { key: 'devices', label: 'Urządzenia', icon: FaNetworkWired },
  { key: 'reports', label: 'Raporty', icon: FaChartBar }
];

export default function WarehouseNavigation(props) {
  return <ModuleNavigation moduleId="magazyn" items={items} {...props} />;
}
