import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import polyline from '@mapbox/polyline';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Modal, 
  CircularProgress, 
  IconButton, 
  Grid, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import HistoryIcon from '@mui/icons-material/History';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import ContactsIcon from '@mui/icons-material/Contacts';
import DirectionsIcon from '@mui/icons-material/Directions';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SecurityIcon from '@mui/icons-material/Security';
import { fetchContacts, triggerSOS, fetchSOSHistory } from '../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const SOSAlerts = () => {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [sosTimer, setSosTimer] = useState(3);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentRoute, setCurrentRoute] = useState(null);
  
  // Load contacts and history
  useEffect(() => {
    fetchContacts().then(setEmergencyContacts);
    fetchSOSHistory().then(setAlertHistory);
  }, []);
  
  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Current Location" // This would be better with reverse geocoding
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setSnackbar({
            open: true,
            message: "Unable to get your location. Location sharing is important for SOS alerts.",
            severity: 'warning'
          });
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);
  
  // Try to get current route from local storage (saved during navigation)
  useEffect(() => {
    const savedRoute = localStorage.getItem('currentRoute');
    if (savedRoute) {
      try {
        setCurrentRoute(JSON.parse(savedRoute));
      } catch (e) {
        console.error("Error parsing saved route:", e);
      }
    }
  }, []);
  
  // Countdown timer for SOS activation
  useEffect(() => {
    let interval = null;
    
    if (sosTriggered && sosTimer > 0) {
      interval = setInterval(() => {
        setSosTimer(timer => timer - 1);
      }, 1000);
    } else if (sosTriggered && sosTimer === 0) {
      clearInterval(interval);
      handleActivateSOS();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sosTriggered, sosTimer]);

  const handleTriggerSOS = () => {
    setSosTriggered(true);
  };

  const handleCancelSOS = () => {
    setSosTriggered(false);
    setSosTimer(3);
  };

  const handleActivateSOS = async () => {
    setLoading(true);
    try {
      // Prepare payload with location and route details
      const payload = {
        location: currentLocation,
        routeDetails: currentRoute
      };
      
      const result = await triggerSOS(payload);
      setSosTriggered(false);
      
      setSnackbar({
        open: true,
        message: 'SOS Alert sent to your emergency contacts',
        severity: 'success'
      });
      
      // Refresh history
      setAlertHistory(await fetchSOSHistory());
    } catch (err) {
      setSnackbar({ 
        open: true, 
        message: err.message || "Failed to send SOS alert", 
        severity: 'error' 
      });
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setSosTriggered(false);
    setSosTimer(3);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCallContact = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsAppContact = (phone) => {
    window.location.href = `https://wa.me/${phone}?text=Emergency%20SOS%20Alert:%20I%20need%20help!`;
  };

  const handleTestSOS = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Test SOS Alert sent successfully',
        severity: 'success'
      });
    }, 1000);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="sos-alerts-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <Navbar />

        {/* Header */}
        <Typography variant="h4" className="page-header">
          SOS Emergency Alerts
        </Typography>

        {/* Tabs */}
        <Box className="sos-tabs-container">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            className="sos-tabs"
            variant="fullWidth"
          >
            <Tab label="SOS Button" icon={<PhoneIcon />} iconPosition="start" />
            <Tab label="Alert History" icon={<HistoryIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* SOS Button Tab */}
        {activeTab === 0 && (
          <>
            {/* SOS Button Section */}
            <Box className="sos-button-section">
              {/* SOS Button */}
              <Button 
                onClick={handleTriggerSOS} 
                className="sos-button"
                disabled={sosTriggered || loading}
              >
                {loading ? <CircularProgress size={40} color="inherit" /> : 'SOS'}
              </Button>

              {/* Status Text */}
              <Typography variant="body1" className="sos-status-text">
                Tap to Send SOS Alert with Your Live Location
              </Typography>

              {/* Info Cards */}
              <Grid container spacing={3} className="sos-info-section">
                {/* Location Card */}
                <Grid item xs={12} md={6}>
                  <Card className="info-card">
                    <CardContent>
                      <Box className="card-header-with-icon">
                        <LocationOnIcon className="card-header-icon" color="primary" />
                        <Typography variant="h6" className="info-card-header">
                          Current Location
                        </Typography>
                      </Box>
                      
                      {currentLocation ? (
                        <>
                          <Typography variant="body2" className="info-card-coordinates">
                            Latitude: {currentLocation.lat.toFixed(6)}°, Longitude: {currentLocation.lng.toFixed(6)}°
                          </Typography>
                          <Typography variant="caption" className="location-update-time">
                            Last updated: {new Date().toLocaleTimeString()}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Retrieving your location...
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Emergency Contacts Card */}
                <Grid item xs={12}>
                  <Card className="info-card">
                    <CardContent>
                      <Box className="card-header-with-icon">
                        <DirectionsIcon className="card-header-icon" color="primary" />
                        <Typography variant="h6" className="info-card-header">
                          Current Journey
                        </Typography>
                      </Box>
                      
                      {currentRoute ? (
                        <>
                          <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2, mb: 2 }}>
                            {/* Route details */}
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} color="primary" />
                                <Typography variant="body2">
                                  <b>From:</b> {currentRoute.origin || "Current Location"}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} color="error" />
                                <Typography variant="body2">
                                  <b>To:</b> {currentRoute.destination}
                                </Typography>
                              </Box>
                              {currentRoute.fullPath && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <DirectionsIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  <Typography variant="body2">
                                    <b>Route:</b> {currentRoute.fullPath}
                                  </Typography>
                                </Box>
                              )}
                              {currentRoute.pathDetails && currentRoute.pathDetails.length > 0 && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                                    <DirectionsIcon fontSize="small" sx={{ mr: 0.5, mt: 0.5 }} />
                                    <Box>
                                      <b>Via:</b>
                                      <ul style={{ margin: '2px 0 0 0', paddingLeft: '20px' }}>
                                        {currentRoute.pathDetails.slice(0, 3).map((path, idx) => (
                                          <li key={idx}>{path}</li>
                                        ))}
                                        {currentRoute.pathDetails.length > 3 && <li>...</li>}
                                      </ul>
                                    </Box>
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Typography variant="body2">
                                  <b>ETA:</b> {currentRoute.eta}
                                </Typography>
                              </Box>
                              {currentRoute.distance && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <DirectionsWalkIcon fontSize="small" sx={{ mr: 0.5 }} />
                                  <Typography variant="body2">
                                    <b>Distance:</b> {currentRoute.distance}
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <SecurityIcon fontSize="small" sx={{ mr: 0.5 }} />
                                <Chip 
                                  label={`Safety: ${currentRoute.safetyRating}/5 (${currentRoute.risk_level || 'Unknown'} risk)`}
                                  size="small" 
                                  color={currentRoute.safetyRating >= 4 ? "success" : 
                                        currentRoute.safetyRating >= 3 ? "warning" : "error"}
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                            </Box>
                            
                            {/* Route map */}
                            {currentRoute.polyline && (
                              <Box sx={{ flex: 1, height: '250px', minWidth: '250px' }}>
                                <MapContainer 
                                  center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [43.7, -79.4]} 
                                  zoom={13} 
                                  style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                                >
                                  <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  />
                                  
                                  {/* Draw the route from polyline */}
                                  {(() => {
                                    try {
                                      const coords = polyline.decode(currentRoute.polyline);
                                      if (coords && coords.length) {
                                        return (
                                          <>
                                            <Polyline
                                              positions={coords}
                                              color={currentRoute.risk_level === 'Low' ? "green" : 
                                                    currentRoute.risk_level === 'Medium' ? "orange" : "red"}
                                              weight={5}
                                            />
                                            
                                            {/* Source marker */}
                                            <Marker position={coords[0]}>
                                              <Popup>Start: {currentRoute.origin || "Current Location"}</Popup>
                                            </Marker>
                                            
                                            {/* Destination marker */}
                                            <Marker position={coords[coords.length - 1]}>
                                              <Popup>Destination: {currentRoute.destination}</Popup>
                                            </Marker>
                                            
                                            {/* Current location marker if available */}
                                            {currentLocation && (
                                              <Marker 
                                                position={[currentLocation.lat, currentLocation.lng]}
                                                icon={new L.Icon({
                                                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                                                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                                  iconSize: [25, 41],
                                                  iconAnchor: [12, 41],
                                                  popupAnchor: [1, -34],
                                                  shadowSize: [41, 41]
                                                })}
                                              >
                                                <Popup>Your Current Location</Popup>
                                              </Marker>
                                            )}
                                          </>
                                        );
                                      }
                                      return null;
                                    } catch (e) {
                                      console.error("Error rendering route:", e);
                                      return null;
                                    }
                                  })()}
                                </MapContainer>
                              </Box>
                            )}
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No active journey. SOS will only include your current location.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Action Buttons */}
              <Box className="sos-action-buttons" sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button 
                  variant="outlined" 
                  className="sos-action-button"
                  onClick={handleTestSOS}
                  disabled={sosTriggered || loading}
                >
                  Test SOS
                </Button>
                <Button 
                  variant="contained" 
                  className="sos-action-button"
                  onClick={() => setActiveTab(1)}
                >
                  View SOS History
                </Button>
              </Box>

              {/* SOS Information Card */}
              <Card className="sos-info-card" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" className="sos-info-title">
                    How SOS Works
                  </Typography>
                  <Typography variant="body2" className="sos-info-text">
                    When activated, SafeNav will send an emergency alert with your real-time location
                    and current journey details to all your emergency contacts via SMS. This helps them
                    understand where you are and where you're heading.
                  </Typography>
                  <Box className="sos-info-steps" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>1. Press the SOS button</Typography>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>2. Alert is sent to your emergency contacts</Typography>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>3. Your contacts receive your live location and route information</Typography>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>4. They can reach out to help you immediately</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* Alert History Tab */}
        {activeTab === 1 && (
          <Box className="sos-history-section">
            <Typography variant="h6" className="section-title">
              SOS Alert History
            </Typography>
            
            {alertHistory.length === 0 ? (
              <Box className="empty-history" sx={{ textAlign: 'center', py: 5 }}>
                <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1">No SOS alerts have been sent yet</Typography>
              </Box>
            ) : (
              <Box className="history-cards">
                

      {alertHistory.map((alert) => (
        <Card key={alert.id} className="history-card" sx={{ mb: 2 }}>
          <CardContent>
            <Box className="history-card-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle1" className="history-card-date">
                {alert.date} at {alert.time}
              </Typography>
              <Chip 
                label={`${alert.contacts_notified} contacts notified`} 
                size="small" 
                color="primary"
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: {xs: 'column', md: 'row'}, gap: 2 }}>
              {/* Left side: Details */}
              <Box sx={{ flex: 1 }}>
                {alert.location && (alert.location.lat || alert.location.lng) && (
                  <Typography variant="body2" className="history-location" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                    Location: {alert.location.lat?.toFixed(6)}°, {alert.location.lng?.toFixed(6)}°
                  </Typography>
                )}
                
                {alert.route_details && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <DirectionsIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                      <b>Route:</b> {alert.route_details.fullPath || 
                        `${alert.route_details.origin || 'Unknown'} to ${alert.route_details.destination || 'Unknown'}`}
                    </Typography>
                    
                    {/* Show path details if available */}
                    {alert.route_details.pathDetails && alert.route_details.pathDetails.length > 0 && (
                      <Box sx={{ display: 'flex', mb: 0.5 }}>
                        <DirectionsIcon fontSize="small" sx={{ mr: 0.5, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" component="span"><b>Via:</b> </Typography>
                          <Typography variant="body2" component="span">
                            {alert.route_details.pathDetails.slice(0, 2).join(", ")}
                            {alert.route_details.pathDetails.length > 2 && "..."}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {alert.route_details.eta && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                        <b>ETA:</b> {alert.route_details.eta}
                      </Typography>
                    )}
                    
                    {alert.route_details.distance && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <DirectionsWalkIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                        <b>Distance:</b> {alert.route_details.distance}
                      </Typography>
                    )}
                    
                    {alert.route_details.safetyRating && (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <SecurityIcon fontSize="small" sx={{ mr: 0.5 }} /> 
                        <b>Safety Rating:</b> {alert.route_details.safetyRating}/5
                        {alert.route_details.risk_level && ` (${alert.route_details.risk_level} risk)`}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
              
              {/* Right side: Map */}
              {alert.route_details && alert.route_details.polyline && (
                <Box sx={{ flex: 1, height: '180px', minWidth: '180px' }}>
                  <MapContainer 
                    center={alert.location && alert.location.lat ? 
                      [alert.location.lat, alert.location.lng] : [43.7, -79.4]} 
                    zoom={12} 
                    style={{ height: '100%', width: '100%', borderRadius: '8px' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Draw the route from polyline */}
                    {(() => {
                      try {
                        const coords = polyline.decode(alert.route_details.polyline);
                        if (coords && coords.length) {
                          return (
                            <>
                              <Polyline
                                positions={coords}
                                color={alert.route_details.risk_level === 'Low' ? "green" : 
                                      alert.route_details.risk_level === 'Medium' ? "orange" : "red"}
                                weight={4}
                              />
                              
                              {/* Alert location marker */}
                              {alert.location && alert.location.lat && (
                                <Marker 
                                  position={[alert.location.lat, alert.location.lng]}
                                  icon={new L.Icon({
                                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                    iconSize: [25, 41],
                                    iconAnchor: [12, 41],
                                    popupAnchor: [1, -34],
                                    shadowSize: [41, 41]
                                  })}
                                >
                                  <Popup>SOS Alert Location</Popup>
                                </Marker>
                              )}
                            </>
                          );
                        }
                        return null;
                      } catch (e) {
                        console.error("Error rendering route:", e);
                        return null;
                      }
                    })()}
                  </MapContainer>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
                    </Box>
                  )}
                </Box>
              )}

        {/* SOS Countdown Modal */}
        <Modal open={sosTriggered} onClose={handleCloseModal}>
          <Box className="modal sos-countdown-modal" sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h6" className="modal-header">
              Sending SOS Alert in {sosTimer}...
            </Typography>
            <Typography variant="body2" className="modal-subtext" sx={{ mb: 3 }}>
              Press Cancel to stop sending the alert
            </Typography>
            <CircularProgress 
              variant="determinate" 
              value={(sosTimer / 3) * 100} 
              className="countdown-progress"
              size={80}
              sx={{ mb: 3 }}
            />
            <Button 
              variant="contained" 
              color="error" 
              className="modal-cancel-button"
              onClick={handleCancelSOS}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </Modal>

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

export default SOSAlerts;