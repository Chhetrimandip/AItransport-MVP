import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { 
  Box, Button, Text, VStack, HStack, Badge, Input, 
  InputGroup, InputLeftElement, List, ListItem,
  Tabs, TabList, Tab, TabPanels, TabPanel, Divider,
  useToast, Spinner
} from '@chakra-ui/react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { SearchIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initializeSocket, getSocket } from '../../utils/socket';
import api from '../../utils/api';
import { FaBus, FaTaxi, FaTrain, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';
import ReactDOMServer from 'react-dom/server';
import { useNavigate } from 'react-router-dom';

// Custom hook to update map center
const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
};

const createCustomIcon = (IconComponent, color) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="color: ${color}; font-size: 24px; filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.5));">
      ${ReactDOMServer.renderToString(<IconComponent />)}
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

const startIcon = createCustomIcon(FaMapMarkerAlt, '#22C55E'); // green
const endIcon = createCustomIcon(FaFlag, '#EF4444'); // red

const LiveMap = ({ userLocation, onVehicleSelect }) => {
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOriginSearch, setIsOriginSearch] = useState(true);
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routesByMode, setRoutesByMode] = useState({
    driving: null,
    walking: null,
    cycling: null,
    bus: null
  });
  const [selectedMode, setSelectedMode] = useState('driving');
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  // Convert userLocation to the format Leaflet expects
  const mapCenter = userLocation ? {
    lat: userLocation.latitude,
    lng: userLocation.longitude
  } : null;

  // Reference the searchLocation function from Map.js (lines 105-125)
  const searchLocation = useCallback(async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Nepal&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  // Set initial origin to user's location
  useEffect(() => {
    if (userLocation) {
      setOrigin({
        lat: userLocation.latitude,
        lng: userLocation.longitude
      });
      // Reverse geocode to get address
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.latitude}&lon=${userLocation.longitude}`
      )
        .then(res => res.json())
        .then(data => {
          setOriginSearch(data.display_name);
        })
        .catch(error => console.error('Error getting address:', error));
    }
  }, [userLocation]);

  const handleSuggestionSelect = (suggestion) => {
    const selectedLocation = {
      lat: suggestion.lat,
      lng: suggestion.lng,
      display_name: suggestion.display_name
    };

    if (isOriginSearch) {
      setOrigin({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      setOriginSearch(selectedLocation.display_name);
    } else {
      setDestination({ lat: selectedLocation.lat, lng: selectedLocation.lng });
      setDestinationSearch(selectedLocation.display_name);
    }
    setSuggestions([]);

    // If both locations are set, fetch route
    if (isOriginSearch && destination) {
      fetchRoute({ lat: selectedLocation.lat, lng: selectedLocation.lng }, destination);
    } else if (!isOriginSearch && origin) {
      fetchRoute(origin, { lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  };

  // Add the useEffect for search debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(isOriginSearch ? originSearch : destinationSearch);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [originSearch, destinationSearch, isOriginSearch, searchLocation]);

  const fetchRoute = async (start, end) => {
    try {
      // Fetch routes for all modes
      const modes = ['driving', 'walking', 'cycling'];
      const routePromises = modes.map(mode => 
        fetch(
          `https://router.project-osrm.org/route/v1/${mode}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        ).then(res => res.json())
      );

      const results = await Promise.all(routePromises);
      const newRoutesByMode = {};

      results.forEach((data, index) => {
        const mode = modes[index];
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          newRoutesByMode[mode] = {
            coordinates: route.geometry.coordinates.map(coord => [coord[1], coord[0]]),
            distance: (route.distance / 1000).toFixed(2),
            duration: Math.round(route.duration / 60)
          };
        }
      });

      // Calculate bus route based on driving route
      if (newRoutesByMode.driving) {
        newRoutesByMode.bus = {
          ...newRoutesByMode.driving,
          duration: Math.round(newRoutesByMode.driving.duration * 1.5), // Bus takes 1.5x longer
          fare: Math.ceil(newRoutesByMode.driving.distance * 10) // Rs. 10 per km
        };
      }

      setRoutesByMode(newRoutesByMode);
      setRouteCoordinates(newRoutesByMode[selectedMode]?.coordinates);
      setRouteInfo(newRoutesByMode[selectedMode]);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  useEffect(() => {
    if (origin && destination) {
      fetchRoute(origin, destination);
    } else {
      setRouteCoordinates(null);
      setRouteInfo(null);
    }
  }, [origin, destination]);

  // Add this function to handle tab changes
  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setRouteCoordinates(routesByMode[mode]?.coordinates);
    setRouteInfo(routesByMode[mode]);
  };

  // Add route info section
  const renderRouteInfo = () => {
    if (!origin || !destination || !routesByMode) return null;

    return (
      <Box p={4} bg="white" borderRadius="md" boxShadow="sm" width="100%">
        <Tabs isFitted variant="enclosed" onChange={(index) => handleModeChange(['driving', 'walking', 'cycling', 'bus'][index])}>
          <TabList>
            <Tab>Driving</Tab>
            <Tab>Walking</Tab>
            <Tab>Cycling</Tab>
            <Tab>Bus</Tab>
          </TabList>

          <TabPanels>
            {['driving', 'walking', 'cycling', 'bus'].map((mode) => (
              <TabPanel key={mode}>
                <VStack align="start" spacing={3}>
                  <HStack justify="space-between" width="100%">
                    <Text fontSize="lg" fontWeight="bold">{mode.charAt(0).toUpperCase() + mode.slice(1)} Route</Text>
                    {mode === 'driving' && <Badge colorScheme="green">Recommended</Badge>}
                  </HStack>
                  <Divider />
                  <HStack spacing={6}>
                    <VStack align="start">
                      <Text color="gray.600"><TimeIcon mr={2} />Distance</Text>
                      <Text fontWeight="bold">{routesByMode[mode]?.distance} km</Text>
                    </VStack>
                    <VStack align="start">
                      <Text color="gray.600"><RepeatIcon mr={2} />Duration</Text>
                      <Text fontWeight="bold">{routesByMode[mode]?.duration} mins</Text>
                    </VStack>
                    {mode === 'bus' && (
                      <VStack align="start">
                        <Text color="gray.600">Fare</Text>
                        <Text fontWeight="bold">Rs. {routesByMode[mode]?.fare}</Text>
                      </VStack>
                    )}
                  </HStack>
                </VStack>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
    );
  };

  // Add function to fetch available vehicles
  const fetchAvailableVehicles = async (startLocation, endLocation) => {
    try {
      const response = await api.post('/routes/search', {
        startLocation: {
          coordinates: [startLocation.lng, startLocation.lat],
          address: originSearch
        },
        endLocation: {
          coordinates: [endLocation.lng, endLocation.lat],
          address: destinationSearch
        }
      });

      setAvailableVehicles(response.data);
    } catch (error) {
      console.error('Error fetching available vehicles:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch available vehicles',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Add useEffect to fetch vehicles when route is selected
  useEffect(() => {
    if (origin && destination) {
      fetchAvailableVehicles(origin, destination);
    }
  }, [origin, destination]);

  // Add booking handler
  const handleBooking = async (vehicle) => {
    try {
      const booking = {
        routeId: vehicle._id,
        startLocation: {
          coordinates: [origin.lng, origin.lat],
          address: originSearch
        },
        endLocation: {
          coordinates: [destination.lng, destination.lat],
          address: destinationSearch
        },
        fare: vehicle.fare,
        departureTime: vehicle.departureTime
      };

      const response = await api.post('/bookings', booking);
      
      toast({
        title: 'Booking Successful',
        description: 'Your ride has been booked successfully!',
        status: 'success',
        duration: 5000,
      });

      // Redirect to booking details or show booking confirmation
      navigate(`/bookings/${response.data._id}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.message || 'Unable to complete booking',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Fetch available routes when origin/destination changes
  const fetchAvailableRoutes = async () => {
    if (!origin || !destination) return;
    
    setIsLoading(true);
    try {
      console.log('Searching for routes with:', {
        start: origin,
        end: destination
      });

      const response = await api.post('/routes/search', {
        startLocation: {
          coordinates: [origin.lng, origin.lat],
          address: originSearch
        },
        endLocation: {
          coordinates: [destination.lng, destination.lat],
          address: destinationSearch
        }
      });

      console.log('Found routes:', response.data);
      setAvailableRoutes(response.data);

      // Show toast if routes are found
      if (response.data.length > 0) {
        toast({
          title: 'Routes Found',
          description: `Found ${response.data.length} available vehicle(s) nearby`,
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'No Routes',
          description: 'No vehicles available on this route currently',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: 'Error',
        description: 'Unable to fetch available routes',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect to trigger route search when origin/destination changes
  useEffect(() => {
    if (origin && destination) {
      fetchAvailableRoutes();
    }
  }, [origin, destination]);

  return (
    <VStack spacing={4} width="100%">
      {/* Search Forms */}
      <VStack width="100%" spacing={3} position="relative">
        <InputGroup>
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Enter starting point"
            value={originSearch}
            onChange={(e) => {
              setOriginSearch(e.target.value);
              setIsOriginSearch(true);
              searchLocation(e.target.value);
            }}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Enter destination"
            value={destinationSearch}
            onChange={(e) => {
              setDestinationSearch(e.target.value);
              setIsOriginSearch(false);
              searchLocation(e.target.value);
            }}
          />
        </InputGroup>

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <List
            position="absolute"
            top={isOriginSearch ? "40px" : "100px"}
            left={0}
            right={0}
            bg="white"
            boxShadow="md"
            borderRadius="md"
            zIndex={1000}
            maxH="200px"
            overflowY="auto"
          >
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={index}
                p={2}
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                {suggestion.display_name}
              </ListItem>
            ))}
          </List>
        )}
      </VStack>

      {/* Route Info */}
      {renderRouteInfo()}

      {/* Map Container */}
      <Box width="100%" height="500px" position="relative">
        {isLoading && (
          <Spinner 
            position="absolute" 
            top="50%" 
            left="50%" 
            zIndex={1000} 
            size="xl" 
          />
        )}
        
        <MapContainer
          center={userLocation || [27.7172, 85.3240]} // Default to Kathmandu
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {/* User's selected points */}
          {origin && (
            <Marker 
              position={[origin.lat, origin.lng]}
              icon={createIcon('green')}
            >
              <Popup>Start Point</Popup>
            </Marker>
          )}

          {destination && (
            <Marker 
              position={[destination.lat, destination.lng]}
              icon={createIcon('red')}
            >
              <Popup>Destination</Popup>
            </Marker>
          )}

          {/* Available vehicles */}
          {availableRoutes.map((route) => (
            <Marker
              key={route._id}
              position={[
                route.startLocation.coordinates[1],
                route.startLocation.coordinates[0]
              ]}
              icon={createIcon('blue')}
            >
              <Popup>
                <VStack spacing={2} align="start" p={2}>
                  <Text fontWeight="bold">
                    Vehicle: {route.vehicle?.vehicleNumber}
                  </Text>
                  <Text>Driver: {route.driver?.name}</Text>
                  <Text>Available Seats: {route.availableSeats}</Text>
                  <Text>Fare: Rs. {route.fare}</Text>
                  <Text>
                    Distance: {Math.round(route.distanceToStart)} meters away
                  </Text>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    width="100%"
                    onClick={() => onVehicleSelect(route)}
                  >
                    Book Now
                  </Button>
                </VStack>
              </Popup>
            </Marker>
          ))}

          {/* Route line if available */}
          {routeCoordinates && (
            <Polyline
              positions={routeCoordinates}
              color="blue"
              weight={3}
              opacity={0.7}
            />
          )}
        </MapContainer>
      </Box>
    </VStack>
  );
};

// Helper function to create custom markers
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};

export default LiveMap; 