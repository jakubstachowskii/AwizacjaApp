import React from 'react';
import ModuleAppBar from '../../layouts/ModuleAppBar';

export default function SalesAppBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <ModuleAppBar moduleId="sprzedaz" isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
  );
}
