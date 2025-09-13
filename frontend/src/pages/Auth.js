import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Card, CardContent, Typography } from '@mui/material';
import Login from './Login';
import Register from './Register';

const AuthPage = () => {
  const [mode, setMode] = useState('login');

  const handleChange = (event, newMode) => {
    if (newMode !== null) setMode(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <Box className="auth-container" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5' 
    }}>
      <Card className="auth-card" sx={{ maxWidth: '450px', width: '100%', boxShadow: 3 }}>
        <CardContent>
          {/* Logo and Title - Matching Sidebar Style */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 3 
          }}>
            <img src="/logo1.jpg" alt="SafeNav Logo" style={{ 
              height: '45px', 
              width: 'auto', 
              marginRight: '10px' 
            }} />
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              SafeNav
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleChange}
            sx={{ mb: 2, width: '100%' }}
          >
            <ToggleButton value="login" sx={{ flex: 1 }}>Login</ToggleButton>
            <ToggleButton value="register" sx={{ flex: 1 }}>Register</ToggleButton>
          </ToggleButtonGroup>
          {mode === 'login' ? 
            <Login onSwitchMode={toggleMode} /> : 
            <Register onSwitchMode={toggleMode} />
          }
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthPage;