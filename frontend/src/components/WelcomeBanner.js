import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';

const WelcomeBanner = ({ 
  userName, 
  actionLabel = "Explore Safe Routes", 
  onActionClick = () => {},
  weather = null,
  safetyScore = null
}) => {
  return (
    <Box className="welcome-banner">
      <Box className="welcome-banner-content">
        <Typography variant="h5" className="welcome-banner-title">
          Welcome, {userName}!
        </Typography>
        <Typography variant="body1" className="welcome-banner-subtitle">
          We're glad to have you back. Let's navigate safely today!
        </Typography>
        
        {weather && (
          <Box className="welcome-banner-weather">
            <Typography variant="body2">
              {weather.condition}, {weather.temperature}°C
            </Typography>
          </Box>
        )}
        
        {safetyScore && (
          <Box className="welcome-banner-safety-score">
            <Typography variant="body2">
              Current area safety score: {safetyScore}/10
            </Typography>
          </Box>
        )}
        
        <Button 
          variant="contained" 
          className="welcome-banner-action"
          startIcon={<ExploreIcon />}
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeBanner;