import React, { useContext } from 'react';
import { AppContext } from '../App';
import ModuleAppBar from './ModuleAppBar';

const AppBarCustom = () => {
  const { toggleSidebar, isSidebarOpen } = useContext(AppContext);

  return (
    <ModuleAppBar
      moduleId="awizacje"
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={toggleSidebar}
    />
  );
};

export default AppBarCustom;
