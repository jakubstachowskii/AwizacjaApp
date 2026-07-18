import React from 'react';
import ModuleAppBar from '../../layouts/ModuleAppBar';

export default function QualityAppBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <ModuleAppBar moduleId="jakosc" isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
  );
}
