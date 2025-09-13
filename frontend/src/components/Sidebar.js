import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Drawer, IconButton, Box } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RouteIcon from '@mui/icons-material/AltRoute';
import ReportIcon from '@mui/icons-material/Report';
import SosIcon from '@mui/icons-material/Sos';
import SettingsIcon from '@mui/icons-material/Settings';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import MenuIcon from '@mui/icons-material/Menu';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const location = useLocation();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const routes = [
    { path: '/', name: 'Home', icon: <DashboardIcon /> },
    { path: '/safe-route-planner', name: 'Safe Routes', icon: <RouteIcon /> },
    { path: '/sos-alerts', name: 'SOS', icon: <SosIcon /> },
    { path: '/emergency-contacts', name: 'Emergency Contacts', icon: <ContactPhoneIcon /> },
    { path: '/profile-settings', name: 'Settings', icon: <SettingsIcon /> },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const content = (
    <>
      {/* Logo and Title */}
      <Box className="sidebar-header">
        <img src="/logo1.jpg" alt="SafeNav Logo" className="sidebar-logo" />
        <h1 className="sidebar-title">SafeNav</h1>
        <IconButton 
          onClick={toggleSidebar} 
          className="sidebar-mobile-close"
          sx={{ display: { xs: 'block', md: 'none' }, ml: 'auto' }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List className="sidebar-list">
        {routes.map((route) => (
          <ListItem 
            button 
            component={Link} 
            to={route.path} 
            key={route.path}
            className={`sidebar-list-item ${isActive(route.path) ? 'active' : ''}`}
          >
            <ListItemIcon className="sidebar-list-item-icon">{route.icon}</ListItemIcon>
            <ListItemText primary={route.name} />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box 
        className="sidebar" 
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {content}
      </Box>

      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        sx={{ display: { xs: 'block', md: 'none' } }}
        className="sidebar-drawer"
      >
        {content}
      </Drawer>
    </>
  );
};

export default Sidebar;