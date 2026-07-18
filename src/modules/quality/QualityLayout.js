import React, { useState, useEffect, useCallback } from 'react';
import { FaHome, FaFlask, FaCertificate, FaClipboardCheck } from 'react-icons/fa';
import ModuleShellLayout from '../../layouts/ModuleShellLayout';
import QualityStatusBar from './QualityStatusBar';

export const QUALITY_NAV_ITEMS = [
  { key: 'overview', label: 'Przegląd', icon: FaHome },
  { key: 'tests', label: 'Badania', icon: FaFlask },
  { key: 'certificates', label: 'Certyfikaty', icon: FaCertificate },
  { key: 'processes', label: 'HACCP / GMP', icon: FaClipboardCheck }
];

const QualityLayout = ({ value, onChange, children }) => {
  const [counters, setCounters] = useState({ tests: 0, certificates: 0, processes: 0 });

  const loadCounters = useCallback(async () => {
    try {
      const [tests, certificates, processes] = await Promise.all([
        window.electronAPI.dbGetAll('jakosc_tests', 'id'),
        window.electronAPI.dbGetAll('jakosc_certificates', 'id'),
        window.electronAPI.dbGetAll('jakosc_processes', 'id')
      ]);
      setCounters({ tests: tests.length, certificates: certificates.length, processes: processes.length });
    } catch {}
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  useEffect(() => {
    const handler = () => loadCounters();
    window.addEventListener('quality:refresh', handler);
    return () => window.removeEventListener('quality:refresh', handler);
  }, [loadCounters]);

  return (
    <ModuleShellLayout
      moduleId="jakosc"
      navItems={QUALITY_NAV_ITEMS}
      value={value}
      onChange={onChange}
      statusBar={QualityStatusBar}
      statusBarProps={{ counters }}
    >
      {children}
    </ModuleShellLayout>
  );
};

export default QualityLayout;
