import { createTheme } from '@mui/material/styles';

export const COLOR_SCHEMES = [
  { id: 0, name: 'Ocean',       primary: '#1565C0', secondary: '#00BCD4' },
  { id: 1, name: 'Sunset',      primary: '#E64A19', secondary: '#E91E63' },
  { id: 2, name: 'Forest',      primary: '#2E7D32', secondary: '#8BC34A' },
  { id: 3, name: 'Lavender',    primary: '#6A1B9A', secondary: '#3949AB' },
  { id: 4, name: 'Amber',       primary: '#F57F17', secondary: '#00695C' },
  { id: 5, name: 'Midnight',    primary: '#283593', secondary: '#546E7A', mode: 'dark' },
  { id: 6, name: 'Rose',        primary: '#AD1457', secondary: '#C62828' },
  { id: 7, name: 'Sage',        primary: '#00695C', secondary: '#558B2F' },
  { id: 8, name: 'Copper',      primary: '#4E342E', secondary: '#E65100' },
  { id: 9, name: 'Arctic',      primary: '#006064', secondary: '#0277BD' },
];

export const buildTheme = (schemeId) => {
  const scheme = COLOR_SCHEMES[schemeId] ?? COLOR_SCHEMES[0];
  return createTheme({
    palette: {
      mode: scheme.mode ?? 'light',
      primary: { main: scheme.primary },
      secondary: { main: scheme.secondary },
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
  });
};
