// src/theme.ts
// src/theme.ts

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', // Use 'dark' for dark mode
    primary: {
      main: '#1976d2', // Custom primary color
    },
    secondary: {
      main: '#f50057', // Custom secondary color
    },
    background: {
      default: '#f3f6f9', // Background color of the app
      paper: '#ffffff', // Background color of Paper components
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default theme;
