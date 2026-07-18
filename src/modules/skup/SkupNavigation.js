import React from 'react';
import {
  FaHome, FaDownload, FaTruck, FaUsers, FaTags, FaChartBar, FaFileAlt, FaExternalLinkAlt, FaNetworkWired
} from 'react-icons/fa';
import ModuleNavigation from '../../layouts/ModuleNavigation';

export const SKUP_NAV_ITEMS = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'intakes', label: 'Przyjęcia', icon: FaDownload },
  { key: 'deliveries', label: 'Dostawy', icon: FaTruck },
  { key: 'contractors', label: 'Kontrahenci', icon: FaUsers },
  { key: 'pricing', label: 'Cenniki', icon: FaTags },
  { key: 'documents', label: 'Dokumenty', icon: FaFileAlt },
  { key: 'contracts', label: 'Kontrakty', icon: FaFileAlt },
  { key: 'quality_rules', label: 'Reguły potrąceń', icon: FaTags },
  { key: 'devices', label: 'Urządzenia', icon: FaNetworkWired },
  { key: 'magazyn_link', label: 'Magazyn', icon: FaExternalLinkAlt, externalView: 'magazyn' },
  { key: 'reports', label: 'Raporty', icon: FaChartBar }
];

export default function SkupNavigation(props) {
  return <ModuleNavigation moduleId="skup" items={SKUP_NAV_ITEMS} {...props} />;
}
