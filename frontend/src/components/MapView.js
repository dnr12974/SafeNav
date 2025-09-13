import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet';
import polyline from '@mapbox/polyline';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Button } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Recenter map when routes change
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Force a redraw of the map
    map.invalidateSize();
  }, [center, map, zoom]);
  return null;
}

function getRouteColor(riskLevel) {
  if (riskLevel === 'Low') return 'green';
  if (riskLevel === 'Medium') return 'orange';
  if (riskLevel === 'High') return 'red';
  return 'blue';
}

const MapView = ({ isLoading, routes = [], selectedRoute, navigationMode, crimeReports = [] }) => {
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Determine map center: prefer route, else crime report, else fallback
  let center = [43.7, -79.4]; // fallback Toronto
  let zoom = 10;

  // Try to get center from selected route first - WITH NULL CHECK
  if (selectedRoute && selectedRoute?.polyline) {
    try {
      const coords = polyline.decode(selectedRoute.polyline);
      if (coords && coords.length) {
        center = coords[0];
        zoom = 12; // Closer zoom for selected route
      }
    } catch (e) {
      console.error("Error decoding polyline:", e);
    }
  } 
  // Try any route if no selected route - WITH BETTER CHECKS
  else if (Array.isArray(routes) && routes.length > 0 && routes[0]?.polyline) {
    try {
      const coords = polyline.decode(routes[0].polyline);
      if (coords && coords.length) {
        center = coords[0];
      }
    } catch (e) {
      console.error("Error decoding polyline:", e);
    }
  } 
  // Try crime reports if no routes
  else if (
    Array.isArray(crimeReports) &&
    crimeReports.length > 0 &&
    crimeReports[0]?.details?.Latitude &&
    crimeReports[0]?.details?.Longitude
  ) {
    center = [
      parseFloat(crimeReports[0].details.Latitude),
      parseFloat(crimeReports[0].details.Longitude)
    ];
  }

  // Determine which routes to display - WITH SAFER CHECKS
  let displayRoutes = [];
  if (navigationMode) {
    // Only show selected route in navigation mode
    displayRoutes = selectedRoute ? [selectedRoute] : [];
  } else if (showAllRoutes) {
    // Show all routes when "Show All" is toggled
    displayRoutes = Array.isArray(routes) ? routes : [];
  } else {
    // Otherwise just show the selected route
    displayRoutes = selectedRoute ? [selectedRoute] : [];
  }

  // Handle map load
  useEffect(() => {
    setMapLoaded(true);
    
    // Force a map resize after load to fix common rendering issues
    const timeoutId = setTimeout(() => {
      const mapElements = document.querySelectorAll('.leaflet-container');
      mapElements.forEach(el => {
        if (el._leaflet_id) {
          const map = L.DomUtil.get(el)._leaflet;
          if (map) map.invalidateSize();
        }
      });
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Show All Routes button - conditionally rendered */}
      {Array.isArray(routes) && routes.length > 1 && !navigationMode && (
        <Button
          variant="contained"
          color={showAllRoutes ? "primary" : "secondary"}
          startIcon={<MapIcon />}
          onClick={() => setShowAllRoutes(!showAllRoutes)}
          sx={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            zIndex: 1000 
          }}
        >
          {showAllRoutes ? "Show Selected" : "Show All Routes"}
        </Button>
      )}
      
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ 
          height: '600px', 
          width: '100%', 
          zIndex: 0,
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}
        whenCreated={map => {
          // Force a map resize after creation
          setTimeout(() => map.invalidateSize(), 0);
        }}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />

        {/* Draw all routes - WITH ADDITIONAL NULL CHECKS */}
        {displayRoutes.map((route, index) => {
          if (!route || !route.polyline) return null;
          
          try {
            const coords = polyline.decode(route.polyline);
            if (!coords || !coords.length) return null;
            
            const color = getRouteColor(route.risk_level);
            const isSelected = selectedRoute && route && selectedRoute.id === route.id;
            
            return (
              <React.Fragment key={route.id || `route-${index}`}>
                {isSelected && (
                  <Polyline
                    positions={coords}
                    color="#FFD600"
                    weight={12}
                    opacity={0.5}
                  />
                )}
                <Polyline
                  positions={coords}
                  color={color}
                  weight={isSelected ? 8 : 4}
                  opacity={isSelected ? 1 : 0.6}
                >
                  <Popup>
                    <div>
                      <b>{route.name || `Route ${index + 1}`}</b><br />
                      Distance: {route.distance || "Unknown"}<br />
                      ETA: {route.estimatedTime || "Unknown"}<br />
                      Risk Level: <b>{route.risk_level || "Unknown"}</b>
                    </div>
                  </Popup>
                </Polyline>
                {coords.length > 0 && (
                  <>
                    <Marker position={coords[0]}>
                      <Popup>
                        <b>📍 Source</b><br />
                        {route.name || `Route ${index + 1}`}
                      </Popup>
                    </Marker>
                    <Marker position={coords[coords.length - 1]}>
                      <Popup>
                        <b>🏁 Destination</b><br />
                        {route.name || `Route ${index + 1}`}
                      </Popup>
                    </Marker>
                  </>
                )}
                {route.hotspots && route.hotspots.map((hs, i) => (
                  <React.Fragment key={`hotspot-${index}-${i}`}>
                    {hs && hs.lat && hs.lng && (
                      <>
                        <Circle
                          center={[hs.lat, hs.lng]}
                          radius={200}
                          color={route.risk_level === 'Low' ? 'blue' : 'red'}
                          fillOpacity={route.risk_level === 'Low' ? 0.15 : 0.25}
                          stroke={false}
                        />
                        <CircleMarker
                          center={[hs.lat, hs.lng]}
                          radius={6}
                          color={route.risk_level === 'Low' ? 'blue' : 'red'}
                          fillOpacity={route.risk_level === 'Low' ? 0.4 : 0.9}
                        >
                          <Popup>
                            <div>
                              <b>🔥 High-Risk Zone</b><br />
                              Risk Score: {hs.risk?.toFixed(2) || "Unknown"}<br />
                            </div>
                          </Popup>
                        </CircleMarker>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          } catch (e) {
            console.error("Error rendering route:", e, route);
            return null;
          }
        })}

        {/* Draw crime report markers */}
        {Array.isArray(crimeReports) && crimeReports.map((report, idx) => {
          const details = report?.details || {};
          if (!details.Latitude || !details.Longitude) return null;
          
          try {
            const lat = parseFloat(details.Latitude);
            const lng = parseFloat(details.Longitude);
            if (isNaN(lat) || isNaN(lng)) return null;
            
            return (
              <Marker key={`crime-${idx}`} position={[lat, lng]}>
                <Popup>
                  <b>{report?.type || details.Type || "Crime"}</b><br />
                  {details.Address || report?.address || ""}<br />
                  <i>{details.Date || report?.date || ""}</i><br />
                  {details.Description && <span>{details.Description}<br /></span>}
                  {report?.link && (
                    <a href={report.link} target="_blank" rel="noopener noreferrer">View Source</a>
                  )}
                </Popup>
              </Marker>
            );
          } catch (e) {
            console.error("Error rendering crime marker:", e);
            return null;
          }
        })}
      </MapContainer>
    </Box>
  );
};

export default MapView;