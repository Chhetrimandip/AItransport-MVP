import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Select,
  FormControl,
  FormLabel,
  useToast,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
} from '@chakra-ui/react';
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const RouteSearch = ({ onSearch }) => {
  const [searchParams, setSearchParams] = useState({
    startLocation: '',
    endLocation: '',
    date: '',
    vehicleType: ''
  });
  
  const [suggestions, setSuggestions] = useState({
    start: [],
    end: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const autoCompleteRef = useRef(null);

  useEffect(() => {
    // Load Google Maps JavaScript API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = initAutocomplete;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initAutocomplete = () => {
    autoCompleteRef.current = new window.google.maps.places.AutocompleteService();
  };

  const handleLocationSearch = async (input, type) => {
    if (!input || !autoCompleteRef.current) return;

    try {
      const predictions = await new Promise((resolve, reject) => {
        autoCompleteRef.current.getPlacePredictions(
          { input },
          (results, status) => {
            if (status === 'OK') resolve(results);
            else reject(status);
          }
        );
      });

      setSuggestions(prev => ({
        ...prev,
        [type]: predictions
      }));
    } catch (error) {
      console.error('Place prediction error:', error);
    }
  };

  const handleSuggestionSelect = (suggestion, type) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: suggestion.description
    }));
    setSuggestions(prev => ({
      ...prev,
      [type]: []
    }));
  };

  const handleSearch = () => {
    if (!searchParams.startLocation || !searchParams.endLocation) {
      toast({
        title: 'Missing locations',
        description: 'Please enter both start and end locations',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    onSearch(searchParams);
  };

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="md">
      <VStack spacing={4}>
        {/* Start Location */}
        <FormControl position="relative">
          <FormLabel>From</FormLabel>
          <InputGroup>
            <Input
              value={searchParams.startLocation}
              onChange={(e) => {
                setSearchParams(prev => ({
                  ...prev,
                  startLocation: e.target.value
                }));
                handleLocationSearch(e.target.value, 'start');
              }}
              placeholder="Enter start location"
              pr="2.5rem"
            />
            <InputRightElement>
              <FaMapMarkerAlt color="gray.300" />
            </InputRightElement>
          </InputGroup>
          {suggestions.start.length > 0 && (
            <List
              position="absolute"
              zIndex={1}
              bg="white"
              w="100%"
              borderRadius="md"
              shadow="lg"
              mt={1}
              maxH="200px"
              overflowY="auto"
            >
              {suggestions.start.map((suggestion) => (
                <ListItem
                  key={suggestion.place_id}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => handleSuggestionSelect(suggestion, 'startLocation')}
                >
                  {suggestion.description}
                </ListItem>
              ))}
            </List>
          )}
        </FormControl>

        {/* End Location */}
        <FormControl position="relative">
          <FormLabel>To</FormLabel>
          <InputGroup>
            <Input
              value={searchParams.endLocation}
              onChange={(e) => {
                setSearchParams(prev => ({
                  ...prev,
                  endLocation: e.target.value
                }));
                handleLocationSearch(e.target.value, 'end');
              }}
              placeholder="Enter destination"
              pr="2.5rem"
            />
            <InputRightElement>
              <FaMapMarkerAlt color="gray.300" />
            </InputRightElement>
          </InputGroup>
          {suggestions.end.length > 0 && (
            <List
              position="absolute"
              zIndex={1}
              bg="white"
              w="100%"
              borderRadius="md"
              shadow="lg"
              mt={1}
              maxH="200px"
              overflowY="auto"
            >
              {suggestions.end.map((suggestion) => (
                <ListItem
                  key={suggestion.place_id}
                  p={2}
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => handleSuggestionSelect(suggestion, 'endLocation')}
                >
                  {suggestion.description}
                </ListItem>
              ))}
            </List>
          )}
        </FormControl>

        <HStack spacing={4} width="100%">
          {/* Date Selection */}
          <FormControl>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={searchParams.date}
              onChange={(e) => setSearchParams(prev => ({
                ...prev,
                date: e.target.value
              }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </FormControl>

          {/* Vehicle Type */}
          <FormControl>
            <FormLabel>Vehicle Type</FormLabel>
            <Select
              value={searchParams.vehicleType}
              onChange={(e) => setSearchParams(prev => ({
                ...prev,
                vehicleType: e.target.value
              }))}
              placeholder="All types"
            >
              <option value="bus">Bus</option>
              <option value="train">Train</option>
              <option value="taxi">Taxi</option>
            </Select>
          </FormControl>
        </HStack>

        <Button
          colorScheme="blue"
          width="100%"
          onClick={handleSearch}
          isLoading={isLoading}
          leftIcon={<FaSearch />}
        >
          Search Routes
        </Button>
      </VStack>
    </Box>
  );
};

export default RouteSearch; 