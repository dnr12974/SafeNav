import React, { useState } from 'react';
import RouteForm from '../components/RouteForm';
import MapView from '../components/MapView';
import polyline from '@mapbox/polyline';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Chip, 
  CircularProgress, 
  Divider, 
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SecurityIcon from '@mui/icons-material/Security';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import AlternateRouteIcon from '@mui/icons-material/AltRoute';
import {planRoute} from '../services/api';

const SafeRoutePlanner = () => {
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [navigationMode, setNavigationMode] = useState(false);
  const [startLocation, setStartLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentFormData, setCurrentFormData] = useState({ start: '', end: '' });

  // Handle route submission
  const handleRouteSubmit = async (formData) => {
    setCurrentFormData(formData);
    setRoutes([]);
    setSelectedRoute(null);
    setLoading(true);
    try {
      const generatedRoutes = await planRoute(formData.start, formData.end);
      setRoutes(generatedRoutes);
      setSelectedRoute(generatedRoutes[0]);
      setSnackbar({
        open: true,
        message: `${generatedRoutes.length} safe routes found`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
    setLoading(false);
  };
  
  // Handle selecting a different route
  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };
  
  // Start navigation with the selected route
  const handleStartNavigation = () => {
  if (!selectedRoute) return;
  
  // Extract path details from polyline
  let pathDetails = [];
  let waypoints = [];
  
  if (selectedRoute.polyline) {
    try {
      // Decode polyline to get coordinates
      const coords = polyline.decode(selectedRoute.polyline);
      
      // Get significant waypoints for the path
      if (coords.length > 0) {
        waypoints = [
          coords[0],
          coords[Math.floor(coords.length / 3)],
          coords[Math.floor(coords.length * 2/3)],
          coords[coords.length - 1]
        ];
        
        // Try to get street names for these coordinates if you have a reverse geocoding service
        // For now, we'll just include the coordinates as string
        pathDetails = waypoints.map((wp, idx) => {
          if (idx === 0) return `Starting at ${currentFormData.start}`;
          if (idx === waypoints.length - 1) return `Destination: ${currentFormData.end}`;
          return `Via point ${idx}: ${wp[0].toFixed(5)},${wp[1].toFixed(5)}`;
        });
      }
    } catch (e) {
      console.error("Error decoding polyline:", e);
    }
  }
  
  // Create detailed route information for SOS alerts
  const routeInfo = {
    origin: currentFormData.start || "Current Location",
    destination: currentFormData.end || selectedRoute.name.replace("Route ", "Destination "),
    fullPath: `${currentFormData.start || "Current Location"} to ${currentFormData.end || selectedRoute.name}`,
    pathDetails: pathDetails,
    waypoints: waypoints,
    eta: selectedRoute.estimatedTime,
    distance: selectedRoute.distance,
    safetyRating: selectedRoute.safetyRating,
    risk_level: selectedRoute.risk_level || "Unknown",
    routeId: selectedRoute.id,
    polyline: selectedRoute.polyline // Include the polyline data for map rendering
  };
  
  // Store in localStorage for the SOS page to access
  localStorage.setItem('currentRoute', JSON.stringify(routeInfo));
  
  setNavigationMode(true);
  setSnackbar({
    open: true,
    message: `Navigation started for ${selectedRoute.name}`,
    severity: 'info'
  });
};

  // Get color based on safety rating
  const getSafetyColor = (rating) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 3.5) return 'warning';
    return 'error';
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Share route
  const handleShareRoute = () => {
    if (!selectedRoute) return;
    
    setSnackbar({
      open: true,
      message: 'Route shared with your emergency contacts',
      severity: 'success'
    });
  };
  
  // Use current location
  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Get address from coordinates using reverse geocoding
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              // Format the address from the response
              const address = data.display_name || `${position.coords.latitude}, ${position.coords.longitude}`;
              setStartLocation(address);
              
              setSnackbar({
                open: true,
                message: 'Current location set as starting point',
                severity: 'success'
              });
            } else {
              // Fallback to coordinates if reverse geocoding fails
              setStartLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
              
              setSnackbar({
                open: true,
                message: 'Location coordinates set as starting point',
                severity: 'info'
              });
            }
          } catch (error) {
            // Fallback to coordinates if the API call fails
            setStartLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
            
            setSnackbar({
              open: true,
              message: 'Location coordinates set as starting point',
              severity: 'info'
            });
          }
          setLocationLoading(false);
        },
        (error) => {
          setSnackbar({
            open: true,
            message: 'Could not retrieve your location. Please check your browser permissions.',
            severity: 'error'
          });
          setLocationLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setSnackbar({
        open: true,
        message: 'Geolocation is not supported by your browser',
        severity: 'error'
      });
      setLocationLoading(false);
    }
  };

  return (
    <div className="safe-route-planner-container fade-in">
      <div className="main-content">
        <Typography variant="h4" className="page-header">
          Safe Route Planner
        </Typography>

        <Grid container spacing={3}>
          {/* Left Column - Route Input */}
          <Grid item xs={12} md={4}>
            <Card className="route-card">
              <CardContent>
                <Typography variant="h6" className="card-title">
                  Plan Your Journey
                </Typography>
                
                {/* Current location button */}
                <Button 
                  variant="outlined" 
                  startIcon={<MyLocationIcon />} 
                  onClick={handleUseCurrentLocation}
                  fullWidth
                  disabled={locationLoading}
                  className="current-location-button"
                >
                  {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                </Button>
                
                {/* Route form component with startLocation prop */}
                <RouteForm 
                  onSubmit={handleRouteSubmit} 
                  loading={loading}
                  startLocation={startLocation}
                />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right Column - Map & Routes */}
          <Grid item xs={12} md={10}>
            {/* Map View */}
            {navigationMode ? (
              <Box className="navigation-mode">
                <Button onClick={() => setNavigationMode(false)}>Exit Navigation</Button>
                <MapView
                  isLoading={false}
                  routes={[selectedRoute]}
                  selectedRoute={selectedRoute}
                  navigationMode={true}
                />
              </Box>
            ) : (
            <Box className="map-container">
              <MapView 
                isLoading={loading}
                routes={routes}
                selectedRoute={selectedRoute}
              />
            </Box>
            )}
            {loading && (
              <Box className="loading-container">
                <CircularProgress />
                <Typography variant="body1" className="loading-text">
                  Finding the safest routes for you...
                </Typography>
              </Box>
            )}
            
            {!loading && routes.length > 0 && selectedRoute && (
              <>
                {/* Available Routes */}
                <Box className="available-routes">
                  <Typography variant="h6" className="section-title">
                    Available Routes
                  </Typography>
                  
                  <Box className="route-chips">
                    {routes.map((route) => (
                      <Chip
                        key={route.id}
                        label={route.name}
                        icon={<AlternateRouteIcon />}
                        onClick={() => handleRouteSelect(route)}
                        variant={selectedRoute.id === route.id ? "filled" : "outlined"}
                        className={`route-chip ${selectedRoute.id === route.id ? 'route-chip-selected' : ''}`}
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Route Details */}
                <Card className="route-details-card">
                  <CardContent>
                    <Box className="route-details-header">
                      <Box>
                        <Typography variant="h6" className="route-name">
                          {selectedRoute.name}
                        </Typography>
                        <Typography variant="body2" className="route-path">
                          {selectedRoute.path}
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${selectedRoute.safetyRating}/5`}
                        color={getSafetyColor(selectedRoute.safetyRating)}
                        icon={<SecurityIcon />}
                        className="safety-rating-chip"
                      />
                    </Box>
                    
                    <Divider className="route-divider" />
                    
                    <Grid container spacing={2} className="route-stats">
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <AccessTimeIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Duration
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.estimatedTime}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <DirectionsWalkIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Distance
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.distance}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <LightbulbIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Well-lit
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.wellLit}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <SecurityIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Crime Risk
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.crimeRisk?.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <LightbulbIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Lighting Score
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.lightingScore?.toFixed(2)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box className="route-stat">
                          <WarningIcon className="route-stat-icon" />
                          <Typography variant="body2" className="route-stat-label">
                            Hotspots
                          </Typography>
                          <Typography variant="h6" className="route-stat-value">
                            {selectedRoute.hotspots?.length}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    {selectedRoute.warnings && selectedRoute.warnings.length > 0 && (
                      <Box className="route-warnings">
                        <Typography variant="subtitle2" className="warnings-title">
                          <WarningIcon className="warning-icon" /> Warnings
                        </Typography>
                        <List dense>
                          {selectedRoute.warnings.map((warning, i) => (
                            <ListItem key={i}>
                              <ListItemIcon className="warning-list-icon">
                                <WarningIcon fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={warning} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    <Box className="route-actions">
                      <Button 
                        variant="contained" 
                        startIcon={<DirectionsIcon />}
                        className="start-navigation-button"
                        onClick={handleStartNavigation}
                      >
                        Start Navigation
                      </Button>
                      <Button 
                        variant="outlined"
                        onClick={handleShareRoute}
                        className="share-route-button"
                      >
                        Share Route
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </>
            )}
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default SafeRoutePlanner;