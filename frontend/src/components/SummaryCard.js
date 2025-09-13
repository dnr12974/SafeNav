import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const SummaryCard = ({ 
  title, 
  value, 
  icon, 
  trend = null, 
  trendLabel = '', 
  trendUp = true,
  className = '' 
}) => {
  return (
    <Card className={`summary-card ${className}`}>
      <CardContent>
        <Box className="summary-card-header">
          <Typography variant="h6" className="summary-card-title">
            {title}
          </Typography>
          {icon && <Box className="summary-card-icon">{icon}</Box>}
        </Box>
        
        <Typography variant="h4" className="summary-card-value">
          {value}
        </Typography>
        
        {trend !== null && (
          <Box className={`summary-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            <Typography variant="body2">
              {trendUp ? '↑' : '↓'} {trend}% {trendLabel}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;