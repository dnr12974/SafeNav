import React from 'react';
import { Card, CardContent, CardActions, Typography, Box, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const InfoCard = ({ 
  title, 
  content, 
  className = '', 
  icon, 
  variant = 'default', 
  actions = null,
  onActionClick
}) => {
  // Generate variant-specific class
  const variantClass = variant ? `info-card-${variant}` : '';

  return (
    <Card className={`info-card ${variantClass} ${className}`}>
      <CardContent>
        <Box className="info-card-header-container">
          <Typography variant="h6" className="info-card-title">{title}</Typography>
          {icon && (
            <Box className="info-card-icon-container">
              {icon}
            </Box>
          )}
        </Box>
        
        {typeof content === 'string' ? (
          <Typography variant="body2" className="info-card-content">{content}</Typography>
        ) : content}
        
        {actions && (
          <CardActions className="info-card-actions">
            {actions}
          </CardActions>
        )}
      </CardContent>
      
      {onActionClick && (
        <IconButton 
          className="info-card-more-button" 
          onClick={onActionClick}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      )}
    </Card>
  );
};

export default InfoCard;