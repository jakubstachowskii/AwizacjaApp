import React from 'react';
import { FaHome, FaFlask, FaCertificate, FaClipboardCheck, FaNetworkWired } from 'react-icons/fa';
import ModuleNavigation from '../../layouts/ModuleNavigation';

const items = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'tests', label: 'Badania', icon: FaFlask },
  { key: 'certificates', label: 'Certyfikaty', icon: FaCertificate },
  { key: 'processes', label: 'HACCP / GMP', icon: FaClipboardCheck },
  { key: 'devices', label: 'Urządzenia lab.', icon: FaNetworkWired }
];

export default function QualityNavigation(props) {
  return <ModuleNavigation moduleId="jakosc" items={items} {...props} />;
}
