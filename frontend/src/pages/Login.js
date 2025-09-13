import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Alert } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as apiLogin, saveToken } from '../services/api';

const Login = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the return URL or default to home
  const from = location.state?.from?.pathname || '/';
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiLogin(formData.email, formData.password);
      saveToken(data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Log in to your account
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          required
        />
        
        <TextField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          required
        />
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2, mb: 1 }}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link 
              component="button" 
              variant="body2" 
              onClick={onSwitchMode}
              sx={{ textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Login;