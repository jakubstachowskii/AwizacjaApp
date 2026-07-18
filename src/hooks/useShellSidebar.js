import { useState, useCallback, useEffect } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';

const DESKTOP_QUERY = '(min-width:1200px)';

function getInitialOpen() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export function useShellSidebar() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialOpen);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e) => {
      setIsSidebarOpen(e.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isDesktop,
    isMobile: !isDesktop
  };
}
