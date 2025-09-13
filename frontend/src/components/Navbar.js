import React, { useState, useEffect } from 'react';
import { Typography, IconButton, Menu, MenuItem, Avatar, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Determine page title based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setPageTitle('Dashboard');
    } else if (path === '/safe-route-planner') {
      setPageTitle('Safe Route Planner');
    } else if (path === '/crime-reports') {
      setPageTitle('Crime Reports');
    } else if (path === '/sos-alerts') {
      setPageTitle('SOS Alerts');
    } else if (path === '/emergency-contacts') {
      setPageTitle('Emergency Contacts');
    } else if (path === '/profile-settings') {
      setPageTitle('Profile Settings');
    }
  }, [location]);

  const handleProfileMenuOpen = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorElProfile(null);
  };

  // Navigate to profile settings page
  const handleViewProfile = () => {
    handleMenuClose();
    navigate('/profile-settings');
  };

  // Logout the user
  const handleLogout = () => {
    handleMenuClose();
    // Clear user token and data
    localStorage.removeItem('token');
    // Redirect to auth page
    navigate('/auth');
  };

  return (
    <Box className="navbar-container">
      {/* Page Title */}
      <Typography variant="h6" className="navbar-page-title">
        {pageTitle}
      </Typography>

      <Box className="navbar-actions">
        {/* Profile Avatar */}
        <IconButton color="inherit" onClick={handleProfileMenuOpen} className="navbar-profile">
          <Avatar alt="User Profile" src="/profile-placeholder.png" />
        </IconButton>

        {/* Profile Dropdown */}
        <Menu
          anchorEl={anchorElProfile}
          open={Boolean(anchorElProfile)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleViewProfile}>
            <AccountCircleIcon className="menu-icon" />
            <Typography sx={{ ml: 1 }}>Profile Settings</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon className="menu-icon" />
            <Typography sx={{ ml: 1 }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;