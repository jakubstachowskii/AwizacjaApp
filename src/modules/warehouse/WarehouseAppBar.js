import React from 'react';
import ModuleAppBar from '../../layouts/ModuleAppBar';

export default function WarehouseAppBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <ModuleAppBar moduleId="magazyn" isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
  );
}
