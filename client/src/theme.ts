// src/theme.ts
// src/theme.ts

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', 
    primary: {
      main: '#1976d2', 
    },
    secondary: {
      main: '#f50057', 
    },
    background: {
      default: '#f3f6f9', 
      paper: '#ffffff', 
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
