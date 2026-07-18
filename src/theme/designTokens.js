import {
  FaClipboardList,
  FaStore,
  FaWarehouse,
  FaFlask,
  FaShoppingCart
} from 'react-icons/fa';

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED = 72;

export const SIDEBAR_BG = '#1e293b';
export const SIDEBAR_TEXT = '#e2e8f0';
export const SIDEBAR_MUTED = '#94a3b8';
export const SIDEBAR_HOVER = 'rgba(255,255,255,0.06)';

/** Tło aplikacji — delikatny chłodny szary */
export const APP_BACKGROUND = '#eef1f6';
export const SURFACE_BORDER = 'rgba(15, 23, 42, 0.08)';

export const SHADOW_SM = '0 1px 2px rgba(15, 23, 42, 0.04), 0 2px 8px rgba(15, 23, 42, 0.06)';
export const SHADOW_MD = '0 4px 16px rgba(15, 23, 42, 0.08)';
export const SHADOW_NAV = '2px 0 12px rgba(15, 23, 42, 0.04)';

export const CARD_SX = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: SURFACE_BORDER,
  boxShadow: SHADOW_SM,
  bgcolor: 'background.paper'
};

export const MODULES = {
  awizacje: {
    id: 'awizacje',
    title: 'Awizacje',
    accent: '#2563eb',
    accentSoft: '#eff6ff',
    subtitle: 'Planowanie dostaw',
    view: 'dashboard',
    icon: FaClipboardList
  },
  skup: {
    id: 'skup',
    title: 'Skup',
    accent: '#0d9488',
    accentSoft: '#f0fdfa',
    subtitle: 'Przyjęcia i kontrakty',
    view: 'skup',
    icon: FaStore
  },
  magazyn: {
    id: 'magazyn',
    title: 'Magazyn',
    accent: '#059669',
    accentSoft: '#ecfdf5',
    subtitle: 'Stany i ruchy',
    view: 'magazyn',
    icon: FaWarehouse
  },
  jakosc: {
    id: 'jakosc',
    title: 'Jakość',
    accent: '#7c3aed',
    accentSoft: '#f5f3ff',
    subtitle: 'Badania i certyfikaty',
    view: 'jakosc',
    icon: FaFlask
  },
  sprzedaz: {
    id: 'sprzedaz',
    title: 'Sprzedaż',
    accent: '#ea580c',
    accentSoft: '#fff7ed',
    subtitle: 'Klienci i faktury',
    view: 'sprzedaz',
    icon: FaShoppingCart
  }
};

export const MODULE_LIST = Object.values(MODULES);

export const compactEmptyRowSx = { py: 1, textAlign: 'center' };

export const mainScrollStyles = {
  overflow: 'auto',
  '&::-webkit-scrollbar': { width: '7px' },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(100, 116, 139, 0.25)',
    borderRadius: '4px',
    '&:hover': { background: 'rgba(100, 116, 139, 0.45)' }
  }
};

export const shellColumnStyles = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
  position: 'relative'
};

export const shellMainStyles = {
  flex: '1 1 auto',
  minHeight: 0,
  minWidth: 0,
  width: '100%',
  maxWidth: '100%',
  boxSizing: 'border-box',
  px: { xs: 2, sm: 2.5, md: 3, lg: 3.5 },
  py: { xs: 2, sm: 2.5 },
  ...mainScrollStyles
};
