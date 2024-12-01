import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  Icon,
  Spinner,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { TimeIcon, CalendarIcon, StarIcon, AddIcon } from '@chakra-ui/icons';
import { FaCar, FaRoute, FaHistory } from 'react-icons/fa';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const Home = () => {
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Driver-specific state
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeSchedule, setRouteSchedule] = useState({
    departureTime: '',
    availableSeats: 0,
    fare: 0,
    distance: '',
    duration: '',
    type: 'driving'
  });
  const [selectedLocations, setSelectedLocations] = useState({
    start: null,
    end: null
  });

  // User-specific state
  const [selectedTime, setSelectedTime] = useState('');
  const [availableRoutes, setAvailableRoutes] = useState([]);



  useEffect(() => {
    if (user?.role === 'driver') {
      fetchVehicles();
    }
    fetchRecentRoutes();
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch vehicles',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const fetchRecentRoutes = async () => {
    try {
      const { data } = await api.get('/routes/recent');
      setRecentRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRecentRoutes([]);
      toast({
        title: 'Note',
        description: 'No routes available at the moment',
        status: 'info',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = async ({ origin, destination }) => {
    console.log('Received locations:', { origin, destination });

    if (origin) {
      try {
        // Fetch address details using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${origin.lat}&lon=${origin.lng}`
        );
        const data = await response.json();
        
        setSelectedLocations(prev => ({
          ...prev,
          start: {
            ...origin,
            display_name: data.display_name,
            address: data.display_name
          }
        }));
        await delay(1000);
      } catch (error) {
        console.error('Error fetching start location details:', error);
      }
    }
    
    if (destination) {
      try {
        // Fetch address details using reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${destination.lat}&lon=${destination.lng}`
        );
        const data = await response.json();
        
        setSelectedLocations(prev => ({
          ...prev,
          end: {
            ...destination,
            display_name: data.display_name,
            address: data.display_name
          }
        }));
        await delay(1000);
      } catch (error) {
        console.error('Error fetching end location details:', error);
      }
    }

    if (user?.role === 'user') {
      searchAvailableRoutes(origin, destination);
    }
  };

  const searchAvailableRoutes = async (origin, destination) => {
    try {
      console.log('Searching routes with:', { origin, destination });
  
      // Create a default departure time (next hour)
      const defaultTime = new Date();
      defaultTime.setHours(defaultTime.getHours() + 1);
      defaultTime.setMinutes(0);
  
      const searchData = {
        startLocation: {
          coordinates: [origin.lng, origin.lat],
          address: origin.address || 'Default Address'
        },
        endLocation: {
          coordinates: [destination.lng, destination.lat],
          address: destination.address || 'Default Address'
        },
        departureTime: defaultTime.toISOString()
      };
  
      console.log('Search request data:', searchData);
  
const { data } = await api.post('/routes/search', searchData);
    console.log('Search response:', data);
  

      setAvailableRoutes(data);
      if (data.length > 0) {
        toast({
          title: 'Routes Found',
          description: `Found ${data.length} available routes`,
          status: 'success',
          duration: 3000,
        });
      } else {
        toast({
          title: 'No Routes',
          description: 'No available routes found for your selection',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error searching routes:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for routes',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRouteSubmit = async () => {
    if (!selectedVehicle || !routeSchedule.departureTime || !selectedLocations.start || !selectedLocations.end) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    // Debug logs
    console.log('Selected Locations:', {
      start: selectedLocations.start,
      end: selectedLocations.end
    });

    try {
      const today = new Date();
      const [hours, minutes] = routeSchedule.departureTime.split(':');
      const departureDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours), parseInt(minutes));

      // Log the location data before validation
      console.log('Start Location:', {
        display_name: selectedLocations.start.display_name,
        address: selectedLocations.start.address,
        name: selectedLocations.start.name
      });
      console.log('End Location:', {
        display_name: selectedLocations.end.display_name,
        address: selectedLocations.end.address,
        name: selectedLocations.end.name
      });

      // Try using name or formatted address if display_name is not available
      const startAddress = selectedLocations.start.display_name || 
                          selectedLocations.start.name || 
                          selectedLocations.start.formatted_address || 
                          selectedLocations.start.address;
      
      const endAddress = selectedLocations.end.display_name || 
                        selectedLocations.end.name || 
                        selectedLocations.end.formatted_address || 
                        selectedLocations.end.address;

      if (!startAddress || !endAddress) {
        toast({
          title: 'Missing Addresses',
          description: 'Please select valid locations with addresses',
          status: 'warning',
          duration: 3000,
        });
        return;
      }

      const response = await api.post('/routes', {
        startLocation: {
          type: 'Point',
          coordinates: [selectedLocations.start.lng, selectedLocations.start.lat],
          address: startAddress
        },
        endLocation: {
          type: 'Point',
          coordinates: [selectedLocations.end.lng, selectedLocations.end.lat],
          address: endAddress
        },
        vehicleId: selectedVehicle,
        departureTime: departureDate.toISOString(),
        availableSeats: parseInt(routeSchedule.availableSeats),
        fare: parseInt(routeSchedule.fare)
      });

      toast({
        title: 'Route Created',
        description: 'Your route has been successfully created',
        status: 'success',
        duration: 3000,
      });

      // Reset form and refresh routes
      setSelectedVehicle(null);
      setRouteSchedule({
        departureTime: '',
        availableSeats: 0,
        fare: 0
      });
      setSelectedLocations({
        start: null,
        end: null
      });

      fetchRecentRoutes();
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create route',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleTimeSubmit = (e) => {
    e.preventDefault();
    if (selectedLocations.start && selectedLocations.end) {
      searchAvailableRoutes(selectedLocations.start, selectedLocations.end);
    }
  };

  const handleBooking = async (route) => {
    if (!route) return;

    try {
      const response = await api.post('/bookings', {
        routeId: route._id,
        numberOfSeats: 1, // Default to 1 seat for now
        pickupLocation: route.startLocation,
        dropoffLocation: route.endLocation
      });

      toast({
        title: 'Booking Successful',
        description: `Your ride has been booked with ${route.vehicle?.vehicleNumber}`,
        status: 'success',
        duration: 3000,
      });

      // Refresh available routes
      searchAvailableRoutes(selectedLocations.start, selectedLocations.end);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.response?.data?.message || 'Unable to complete booking',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const renderDriverContent = () => (
    <VStack spacing={6} align="stretch">
      {/* Driver Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Icon as={FaCar} boxSize={6} color="blue.500" />
              <Heading size="sm">My Vehicles</Heading>
              <Text fontSize="sm" color="gray.600">
                Manage your registered vehicles
              </Text>
              <Button 
                leftIcon={<AddIcon />} 
                colorScheme="blue" 
                size="sm"
                onClick={onOpen}
              >
                Add Vehicle
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Icon as={FaRoute} boxSize={6} color="green.500" />
              <Heading size="sm">Route Planning</Heading>
              <Text fontSize="sm" color="gray.600">
                Set up your travel routes
              </Text>
              <Button colorScheme="green" size="sm">
                Plan Route
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={3}>
              <Icon as={FaHistory} boxSize={6} color="purple.500" />
              <Heading size="sm">Trip History</Heading>
              <Text fontSize="sm" color="gray.600">
                View your completed trips
              </Text>
              <Button colorScheme="purple" size="sm">
                View History
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Route Planning Section */}
      <Box>
        <Heading size="md" mb={4}>Plan Your Route</Heading>
        <VStack spacing={4} bg="white" p={6} borderRadius="lg" shadow="sm">
          {/* Vehicle Selection */}
          <FormControl isRequired>
            <FormLabel>Select Vehicle</FormLabel>
            <Select 
              value={selectedVehicle} 
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.vehicleNumber} - {vehicle.type}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Map for route selection */}
          <Box width="100%">
            <Map onLocationSelect={handleLocationSelect} />
          </Box>

          {/* Schedule Settings */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="100%">
            <FormControl isRequired>
              <FormLabel>Departure Time</FormLabel>
              <Input
                type="time"
                value={routeSchedule.departureTime}
                onChange={(e) => setRouteSchedule({
                  ...routeSchedule,
                  departureTime: e.target.value
                })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Available Seats</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  value={routeSchedule.availableSeats}
                  onChange={(e) => setRouteSchedule({
                    ...routeSchedule,
                    availableSeats: parseInt(e.target.value)
                  })}
                />
              </NumberInput>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Fare (Rs)</FormLabel>
              <NumberInput min={0}>
                <NumberInputField
                  value={routeSchedule.fare}
                  onChange={(e) => setRouteSchedule({
                    ...routeSchedule,
                    fare: parseInt(e.target.value)
                  })}
                />
              </NumberInput>
            </FormControl>
          </SimpleGrid>

          <Button 
            colorScheme="blue" 
            width="100%"
            onClick={handleRouteSubmit}
            isLoading={isLoading}
          >
            Create Route
          </Button>
        </VStack>
      </Box>

      {/* Active Routes */}
      <Box>
        <Heading size="md" mb={4}>My Active Routes</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {recentRoutes.map(route => (
            <Card key={route._id}>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Heading size="sm">
                    {route.startLocation.address.split(',')[0]} → {route.endLocation.address.split(',')[0]}
                  </Heading>
                  <HStack>
                    <Icon as={TimeIcon} />
                    <Text fontSize="sm">
                      {new Date(route.departureTime).toLocaleTimeString()}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Vehicle: {route.vehicle?.vehicleNumber || 'N/A'}
                  </Text>
                  <Badge colorScheme="green">
                    {route.availableSeats} seats available
                  </Badge>
                  <Text fontSize="sm">Fare: Rs {route.fare}</Text>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );

  const renderUserContent = () => (
    <VStack spacing={6} align="stretch">
      {/* Welcome Section */}
      <Box py={2}>
        <Heading size="md" mb={1}>
          Welcome back, {user?.name}!
        </Heading>
        <Text fontSize="sm" color="gray.600">
          Find and book your next journey with ease.
        </Text>
      </Box>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
        <Card variant="outline">
          <CardBody p={4}>
            <VStack align="start" spacing={2}>
              <Icon as={CalendarIcon} boxSize={5} color="blue.500" />
              <Heading size="sm">Book a Route</Heading>
              <Text fontSize="xs" color="gray.600">
                Search and book available transport routes
              </Text>
              <Button colorScheme="blue" size="sm" width="100%">
                Book Now
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Icon as={TimeIcon} boxSize={6} color="green.500" />
              <Heading size="sm">View Schedule</Heading>
              <Text fontSize="sm" color="gray.600">
                Check your upcoming bookings
              </Text>
              <Button colorScheme="green" size="sm">
                View Schedule
              </Button>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="start" spacing={4}>
              <Icon as={StarIcon} boxSize={6} color="purple.500" />
              <Heading size="sm">Recent Routes</Heading>
              <Text fontSize="sm" color="gray.600">
                View your recent travel history
              </Text>
              <Button colorScheme="purple" size="sm">
                View History
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Map Section */}
      <Box>
        <Heading size="md" mb={2}>Select Route</Heading>
        <Map onLocationSelect={handleLocationSelect} />
      </Box>

      {/* Time Selection Form */}
      <Box 
        p={4} 
        bg="white" 
        borderRadius="lg" 
        shadow="sm" 
        width="100%"
        mt={4}
      >
        <form onSubmit={handleTimeSubmit}>
          <FormControl>
            <FormLabel>Preferred Boarding Time</FormLabel>
            <HStack spacing={4}>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                width="auto"
              />
              <Button 
                type="submit" 
                colorScheme="blue"
                leftIcon={<TimeIcon />}
              >
                Search Routes
              </Button>
            </HStack>
          </FormControl>
        </form>
      </Box>

      {/* Available Routes */}
      {availableRoutes.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>Available Vehicles in the Route</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {availableRoutes.map(route => (
              <Card key={route._id}>
                <CardBody>
                  <VStack align="start" spacing={2}>
                    <Heading size="sm">
                      {route.startLocation.address?.split(',')[0] || 'Loading...'} → {route.endLocation.address?.split(',')[0] || 'Loading...'}
                    </Heading>
                    <HStack>
                      <Icon as={TimeIcon} />
                      <Text fontSize="sm">
                        {new Date(route.departureTime).toLocaleTimeString()}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Vehicle: {route.vehicle?.vehicleNumber || 'N/A'}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Driver: {route.driver?.name || 'N/A'}
                    </Text>
                    <Badge colorScheme="green">
                      {route.availableSeats} seats available
                    </Badge>
                    <Text fontSize="sm">Fare: Rs {route.fare}</Text>
                    <Button 
                      colorScheme="blue" 
                      size="sm" 
                      width="100%"
                      onClick={() => handleBooking(route)}
                    >
                      Book Now
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );

  // Show loading state while checking authentication
  if (isLoading && !user) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" />
        <Text mt={4}>Loading...</Text>
      </Container>
    );
  }

  // If no user data, don't render the main content
  if (!user) {
    return null;
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={2} px={3}>
        {user?.role === 'driver' ? renderDriverContent() : renderUserContent()}
      </Container>
    </Box>
  );
};

export default Home;