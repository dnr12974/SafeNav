import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register as apiRegister } from '../services/api';

const Register = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      await apiRegister({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        address: formData.address
      });
      onSwitchMode(); // Switch back to login mode after successful registration
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
        Create your account
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          required
        />
        
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
          label="Phone Number"
          type="text"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          fullWidth
          margin="normal"
          size="small"
          required
        />

        <TextField
          label="Address"
          type="text"
          name="address"
          value={formData.address}
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
        
        <TextField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link 
              component="button" 
              variant="body2" 
              onClick={onSwitchMode}
              sx={{ textDecoration: 'none' }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
};

export default Register;