import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { CircularProgress, Box } from '@mui/material';
import theme from './theme';
import 'leaflet/dist/leaflet.css';
import AuthGuard from './components/AuthGuard';
import AppLayout from './layouts/AppLayout';
import AuthPage from './pages/Auth';

// Lazy load components to improve initial load time
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SafeRoutePlanner = lazy(() => import('./pages/SafeRoutePlanner'));
const CrimeReports = lazy(() => import('./pages/CrimeReports'));
const SOSAlerts = lazy(() => import('./pages/SOSAlerts'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const EmergencyContacts = lazy(() => import('./pages/EmergencyContacts'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    height: '100vh',
    backgroundColor: theme.palette.background.default
  }}>
    <CircularProgress size={60} thickness={4} />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SidebarProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Auth Routes */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* App Routes with Layout */}
              <Route path="/" element={<AuthGuard><AppLayout /></AuthGuard>}>
                <Route index element={<Dashboard />} />
                <Route path="safe-route-planner" element={<SafeRoutePlanner />} />
                <Route path="crime-reports" element={<CrimeReports />} />
                <Route path="sos-alerts" element={<SOSAlerts />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
                <Route path="emergency-contacts" element={<EmergencyContacts />} />
              </Route>
              
              {/* Fallback Routes */}
              <Route path="404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;