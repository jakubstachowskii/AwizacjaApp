import React, { useContext, useMemo, useCallback } from 'react';
import {
  FaTachometerAlt, FaClipboardList, FaSeedling, FaUsers, FaChartBar, FaCog, FaTruck, FaNetworkWired
} from 'react-icons/fa';
import { AppContext } from '../App';
import ModuleNavigation from '../layouts/ModuleNavigation';

const Navigation = () => {
  const { currentView, setCurrentView, isSidebarOpen, toggleSidebar } = useContext(AppContext);

  const navItems = useMemo(() => [
    { key: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { key: 'appointments', label: 'Awizacje', icon: FaClipboardList },
    { key: 'grains', label: 'Słownik zbóż', icon: FaSeedling },
    { key: 'contractors', label: 'Kontrahenci', icon: FaUsers },
    { key: 'shippers', label: 'Nadawcy', icon: FaTruck },
    { key: 'reports', label: 'Raporty', icon: FaChartBar },
    { key: 'devices', label: 'Urządzenia', icon: FaNetworkWired },
    { key: 'settings', label: 'Ustawienia', icon: FaCog }
  ], []);

  const handleChange = useCallback((viewKey) => {
    setCurrentView(viewKey);
  }, [setCurrentView]);

  return (
    <ModuleNavigation
      moduleId="awizacje"
      items={navItems}
      value={currentView}
      onChange={handleChange}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={toggleSidebar}
    />
  );
};

export default Navigation;
