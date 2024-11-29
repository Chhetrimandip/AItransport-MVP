import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import { 
  VStack, 
  Input, 
  Box, 
  InputGroup, 
  InputLeftElement,
  Button,
  HStack,
  useToast,
  List,
  ListItem,
  Text
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240 // Kathmandu coordinates
};

function MapController({ origin, destination }) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 13);
    }
  }, [map, origin, destination]);

  return null;
}

const Map = ({ onLocationSelect }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOriginSearch, setIsOriginSearch] = useState(true);
  const toast = useToast();
  const [routeCoordinates, setRouteCoordinates] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setOrigin({ lat, lng });
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setOriginSearch(data.display_name);
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
        },
        (error) => {
          toast({
            title: 'Location Error',
            description: 'Unable to get your current location',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      );
    }
  }, [toast]);

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocation(isOriginSearch ? originSearch : destinationSearch);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [originSearch, destinationSearch, isOriginSearch, searchLocation]);

  const handleSuggestionSelect = (suggestion) => {
    if (isOriginSearch) {
      setOrigin({ lat: suggestion.lat, lng: suggestion.lng });
      setOriginSearch(suggestion.display_name);
    } else {
      setDestination({ lat: suggestion.lat, lng: suggestion.lng });
      setDestinationSearch(suggestion.display_name);
    }
    setSuggestions([]);
    
    if (onLocationSelect) {
      onLocationSelect({ 
        origin: isOriginSearch ? { lat: suggestion.lat, lng: suggestion.lng } : origin,
        destination: !isOriginSearch ? { lat: suggestion.lat, lng: suggestion.lng } : destination
      });
    }
  };

  // Function to fetch route between two points
  const fetchRoute = async (start, end) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteCoordinates(route.geometry.coordinates.map(coord => [coord[1], coord[0]]));
        
        // Set route information
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // Convert to kilometers
          duration: Math.round(route.duration / 60) // Convert to minutes
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      toast({
        title: 'Route Error',
        description: 'Unable to fetch route details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Update route when origin or destination changes
  useEffect(() => {
    if (origin && destination) {
      fetchRoute(origin, destination);
    } else {
      setRouteCoordinates(null);
      setRouteInfo(null);
    }
  }, [origin, destination]);

  return (
    <VStack spacing={4} width="100%">
      <VStack width="100%" spacing={3} position="relative">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Enter starting point"
            value={originSearch}
            onChange={(e) => {
              setOriginSearch(e.target.value);
              setIsOriginSearch(true);
            }}
          />
        </InputGroup>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Enter destination"
            value={destinationSearch}
            onChange={(e) => {
              setDestinationSearch(e.target.value);
              setIsOriginSearch(false);
            }}
          />
        </InputGroup>

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

      <Box width="100%" height="400px" borderRadius="lg" overflow="hidden">
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {origin && (
            <Marker position={[origin.lat, origin.lng]}>
              <Popup>Starting Point</Popup>
            </Marker>
          )}
          
          {destination && (
            <Marker position={[destination.lat, destination.lng]}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {routeCoordinates && (
            <Polyline
              positions={routeCoordinates}
              color="blue"
              weight={4}
              opacity={0.6}
            />
          )}

          <MapController origin={origin} destination={destination} />
        </MapContainer>
      </Box>

      {/* Route Information Display */}
      {routeInfo && (
        <Box
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
          width="100%"
        >
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Route Information:</Text>
            <Text>Distance: {routeInfo.distance} km</Text>
            <Text>Estimated Time: {routeInfo.duration} minutes</Text>
          </VStack>
        </Box>
      )}

      <Button 
        colorScheme="red" 
        onClick={() => {
          setOrigin(null);
          setDestination(null);
          setOriginSearch('');
          setDestinationSearch('');
          setSuggestions([]);
          setRouteCoordinates(null);
          setRouteInfo(null);
        }}
      >
        Clear All
      </Button>
    </VStack>
  );
};

export default Map; 