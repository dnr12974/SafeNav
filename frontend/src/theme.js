import { createTheme } from '@mui/material/styles';

// Define your custom colors
const colors = {
  primary: {
    main: '#1A237E',    // Deep Indigo
    light: '#2C3E9E',   // Lighter Indigo
    dark: '#121858',    // Darker Indigo
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FFC107',    // Amber
    light: '#FFECB3',
    dark: '#FFA000',    // Darker Amber
    contrastText: '#212121',
  },
  error: {
    main: '#F44336',    // Red
  },
  warning: {
    main: '#FF9800',    // Orange
  },
  success: {
    main: '#4CAF50',    // Green
  },
  info: {
    main: '#2196F3',    // Blue
  },
  background: {
    default: '#E5E5E5', // Light Grey background
    paper: '#FFFFFF',   // White background for cards and surfaces
  },
};

// Create a theme instance
const theme = createTheme({
  palette: {
    ...colors,
    mode: 'light',
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: colors.primary.dark,
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: colors.secondary.dark,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;