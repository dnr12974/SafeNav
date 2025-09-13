import React, { useState,useEffect } from 'react';
import { TextField, Button, Box, FormControlLabel, Checkbox } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';

const RouteForm = ({ onSubmit, loading = false, startLocation }) => {
  const [formData, setFormData] = useState({
    start: '',
    destination: ''
  });

  useEffect(() => {
    if (startLocation) {
      setFormData(prev => ({ ...prev, start: startLocation }));
    }
  }, [startLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const { start, destination, ...rest } = formData;
    onSubmit({ start, end: destination, ...rest });
  };

  return (
    <form onSubmit={handleSubmit} className="route-form">
      <TextField
        label="Start Location"
        name="start"
        value={formData.start}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="Enter starting location"
        required
      />
      
      <TextField
        label="Destination"
        name="destination"
        value={formData.destination}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="Enter destination"
        required
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        className="route-form-button"
        disabled={loading}
        startIcon={<DirectionsIcon />}
      >
        {loading ? 'Calculating Route...' : 'Plan Safe Route'}
      </Button>
    </form>
  );
};

export default RouteForm;