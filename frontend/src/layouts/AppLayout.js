import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';

const AppLayout = () => {
  return (
    <Box className="app-container">
      <Sidebar />
      <Box className="main-content">
        <Navbar />
        <Box className="page-content">
          <Outlet /> {/* This is where page content is rendered */}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;