import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, LoadScript } from '@react-google-maps/api';
import {
  Box,
  Input,
  VStack,
  useToast,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  List,
  ListItem,
  Spinner
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

const libraries = ['places'];
const containerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240 // Default to Kathmandu
};

const Map = ({ onLocationSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);
  const toast = useToast();

  const {
    ready: originReady,
    value: originValue,
    suggestions: { status: originStatus, data: originData },
    setValue: setOriginValue,
    clearSuggestions: clearOriginSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'np' } },
    debounce: 300,
  });

  const {
    ready: destReady,
    value: destValue,
    suggestions: { status: destStatus, data: destData },
    setValue: setDestValue,
    clearSuggestions: clearDestSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { componentRestrictions: { country: 'np' } },
    debounce: 300,
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setOrigin(pos);
          setOriginValue(pos.lat + ', ' + pos.lng);
        },
        () => {
          toast({
            title: 'Error',
            description: 'Unable to get your location',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      );
    }
  }, [setOriginValue, toast]);

  const handleOriginSelect = async (address) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setOrigin({ lat, lng });
      setOriginValue(address, false);
      clearOriginSuggestions();
      updateRoute();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error finding location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDestinationSelect = async (address) => {
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      setDestination({ lat, lng });
      setDestValue(address, false);
      clearDestSuggestions();
      updateRoute();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error finding location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const updateRoute = useCallback(() => {
    if (origin && destination) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            onLocationSelect({ origin, destination, route: result });
          }
        }
      );
    }
  }, [origin, destination, onLocationSelect]);

  const handleScriptLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <VStack spacing={4} width="100%">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        onLoad={handleScriptLoad}
      >
        {isLoaded ? (
          <>
            <VStack width="100%" spacing={2} position="relative">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color="gray.300" />
                </InputLeftElement>
                <Input
                  value={originValue}
                  onChange={(e) => setOriginValue(e.target.value)}
                  placeholder="Enter pickup location"
                  disabled={!originReady}
                />
              </InputGroup>
              {originStatus === "OK" && (
                <List 
                  position="absolute" 
                  top="100%" 
                  bg="white" 
                  width="100%" 
                  borderRadius="md" 
                  boxShadow="md" 
                  zIndex={2}
                >
                  {originData.map(({ place_id, description }) => (
                    <ListItem
                      key={place_id}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleOriginSelect(description)}
                    >
                      <Text>{description}</Text>
                    </ListItem>
                  ))}
                </List>
              )}

              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={SearchIcon} color="gray.300" />
                </InputLeftElement>
                <Input
                  value={destValue}
                  onChange={(e) => setDestValue(e.target.value)}
                  placeholder="Enter destination"
                  disabled={!destReady}
                />
              </InputGroup>
              {destStatus === "OK" && (
                <List 
                  position="absolute"
                  top="100%" 
                  bg="white" 
                  width="100%" 
                  borderRadius="md" 
                  boxShadow="md" 
                  zIndex={2}
                >
                  {destData.map(({ place_id, description }) => (
                    <ListItem
                      key={place_id}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleDestinationSelect(description)}
                    >
                      <Text>{description}</Text>
                    </ListItem>
                  ))}
                </List>
              )}
            </VStack>
            
            <Box width="100%" height="400px" borderRadius="lg" overflow="hidden">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={origin || defaultCenter}
                zoom={13}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
              >
                {origin && <Marker position={origin} />}
                {destination && <Marker position={destination} />}
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </Box>
          </>
        ) : (
          <Box width="100%" height="400px" display="flex" alignItems="center" justifyContent="center">
            <Spinner size="xl" />
          </Box>
        )}
      </LoadScript>
    </VStack>
  );
};

export default Map; 