import { createTheme } from '@mui/material/styles';

export const COLOR_SCHEMES = [
  {
    id: 0, name: 'Ocean',
    primary: '#1565C0', secondary: '#00BCD4',
    bg: '#EEF3FB', paper: '#F8FAFF', divider: '#C5D8F5',
  },
  {
    id: 1, name: 'Sunset',
    primary: '#E64A19', secondary: '#E91E63',
    bg: '#FDF0EB', paper: '#FFFAF8', divider: '#F7CDB9',
  },
  {
    id: 2, name: 'Forest',
    primary: '#2E7D32', secondary: '#8BC34A',
    bg: '#EDF4EE', paper: '#F8FCF8', divider: '#B8DBB9',
  },
  {
    id: 3, name: 'Lavender',
    primary: '#6A1B9A', secondary: '#3949AB',
    bg: '#F3EEF8', paper: '#FAF7FD', divider: '#D4BCE8',
  },
  {
    id: 4, name: 'Amber',
    primary: '#F57F17', secondary: '#00695C',
    bg: '#FEF8E8', paper: '#FFFCF4', divider: '#FAE0A0',
  },
  {
    id: 5, name: 'Midnight',
    primary: '#5C7AEA', secondary: '#78909C',
    bg: '#0D1B3E', paper: '#162040', divider: '#253A6A',
    mode: 'dark',
  },
  {
    id: 6, name: 'Rose',
    primary: '#AD1457', secondary: '#C62828',
    bg: '#FFF0F5', paper: '#FFF8FB', divider: '#F5C0D4',
  },
  {
    id: 7, name: 'Sage',
    primary: '#00695C', secondary: '#558B2F',
    bg: '#EEF6F4', paper: '#F7FBFA', divider: '#AEDCD5',
  },
  {
    id: 8, name: 'Copper',
    primary: '#6D4C41', secondary: '#E65100',
    bg: '#F8F0EC', paper: '#FDF8F5', divider: '#E8CCBF',
  },
  {
    id: 9, name: 'Arctic',
    primary: '#006064', secondary: '#0277BD',
    bg: '#E8F4F8', paper: '#F4FAFB', divider: '#A8D8E8',
  },
];

export const buildTheme = (schemeId) => {
  const scheme = COLOR_SCHEMES[schemeId] ?? COLOR_SCHEMES[0];
  return createTheme({
    palette: {
      mode: scheme.mode ?? 'light',
      primary:   { main: scheme.primary },
      secondary: { main: scheme.secondary },
      background: {
        default: scheme.bg,
        paper:   scheme.paper,
      },
      divider: scheme.divider,
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: scheme.bg },
        },
      },
    },
  });
};
