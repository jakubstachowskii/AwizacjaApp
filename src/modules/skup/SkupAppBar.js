import React from 'react';
import ModuleAppBar from '../../layouts/ModuleAppBar';

export default function SkupAppBar({ isSidebarOpen, onToggleSidebar }) {
  return (
    <ModuleAppBar moduleId="skup" isSidebarOpen={isSidebarOpen} onToggleSidebar={onToggleSidebar} />
  );
}
