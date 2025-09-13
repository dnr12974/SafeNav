import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, Box, Button, CircularProgress } from '@mui/material';
import MapView from '../components/MapView';
import CrimeIcon from '@mui/icons-material/Report';
import RouteIcon from '@mui/icons-material/AltRoute';
import LightIcon from '@mui/icons-material/WbIncandescent';
import ContactIcon from '@mui/icons-material/ContactPhone';
import ExploreIcon from '@mui/icons-material/Explore';
import SummaryCard from '../components/SummaryCard';
import WelcomeBanner from '../components/WelcomeBanner';
import { getProfile, fetchContacts, planRoute } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [crimeCount, setCrimeCount] = useState(0);
  const [lightingCoverage, setLightingCoverage] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    setLoading(true);

    // Fetch user info
    getProfile()
      .then(data => {
        if (data && data.full_name) setUserName(data.full_name);
        else if (data && data.email) setUserName(data.email.split('@')[0]);
        else setUserName('Guest');
      })
      .catch(() => setUserName('Guest'));

    Promise.all([
      fetchContacts()
        .then(data => Array.isArray(data) ? data.length : 0)
        .catch(() => 0)
    ]).then(([crime, lighting, contacts]) => {
      setCrimeCount(crime);
      setLightingCoverage(lighting);
      setContactsCount(contacts);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const navigateToRoutePlanner = () => {
    navigate('/safe-route-planner');
  };

  const navigateToCrimeReports = () => {
    navigate('/crime-reports');
  };

  const navigateToEmergencyContacts = () => {
    navigate('/emergency-contacts');
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="main-content">
        <WelcomeBanner 
          userName={userName}
          actionLabel="Plan a Safe Route"
          onActionClick={navigateToRoutePlanner}
        />

        <Typography variant="h5" className="section-title" sx={{ mt: 4 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} className="info-cards-container">
          <Grid item xs={12} sm={6} md={4}>
            
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className="info-card info-card-success animated-card">
              <CardContent>
                <RouteIcon className="info-card-icon" />
                <Typography variant="h6">Safe Route Planner</Typography>
                <Typography variant="body2">Find the safest way to your destination.</Typography>
                <Button 
                  variant="text" 
                  className="info-card-action"
                  onClick={navigateToRoutePlanner}
                >
                  Plan Route
                </Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className="info-card info-card-info animated-card">
              <CardContent>
                <ContactIcon className="info-card-icon" />
                <Typography variant="h6">Emergency Contacts</Typography>
                <Typography variant="body2">Access your emergency contacts quickly.</Typography>
                <Button 
                  variant="text" 
                  className="info-card-action"
                  onClick={navigateToEmergencyContacts}
                >
                  View Contacts
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h5" className="section-title" sx={{ mt: 4 }}>
          Your Area Map
        </Typography>
        <Box className="map-container">
          <MapView />
          <Button
            variant="contained"
            startIcon={<ExploreIcon />}
            className="map-action-button"
            onClick={navigateToRoutePlanner}
            sx={{ mt: 2 }}
          >
            Plan a Safe Route
          </Button>
        </Box>
      </div>
    </div>
  );
};

export default Dashboard;