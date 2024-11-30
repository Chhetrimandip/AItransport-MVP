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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider
} from '@chakra-ui/react';
import { TimeIcon, CalendarIcon, StarIcon, AddIcon, RepeatIcon } from '@chakra-ui/icons';
import { FaCar, FaRoute, FaHistory } from 'react-icons/fa';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const Home = () => {
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Driver-specific state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeSchedule, setRouteSchedule] = useState({
    departureTime: '',
    frequency: 'daily',
    availableSeats: 0
  });

  // User-specific state
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    if (user?.role === 'driver') {
      fetchVehicles();
    }
    fetchRecentRoutes();
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vehicles`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setVehicles(response.data);
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
      const response = await fetch(`${API_URL}/api/routes/recent`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 404) {
        setRecentRoutes([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data = await response.json();
      setRecentRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRecentRoutes([]);
      toast({
        title: 'Note',
        description: 'No routes available at the moment',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = ({ origin, destination }) => {
    if (origin && destination) {
      console.log('Route selected:', {
        from: origin,
        to: destination
      });
    }
  };

  const handleRouteSearch = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/api/routes/search`, {
        params: {
          boardingTime: selectedTime
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setRecentRoutes(response.data.routes);
        toast({
          title: "Routes found",
          description: "Available routes matching your criteria",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error searching routes:', error);
      toast({
        title: "Error",
        description: "Failed to search routes. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeSubmit = (e) => {
    e.preventDefault();
    handleRouteSearch();
  };

  const handleRouteSubmit = async () => {
    if (!selectedVehicle || !routeSchedule.departureTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/routes`, {
        vehicleId: selectedVehicle,
        schedule: routeSchedule
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast({
        title: "Route Created",
        description: "Your route has been successfully created",
        status: "success",
        duration: 3000,
      });

      // Reset form
      setSelectedVehicle(null);
      setRouteSchedule({
        departureTime: '',
        frequency: 'daily',
        availableSeats: 0
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create route. Please try again.",
        status: "error",
        duration: 3000,
      });
    }
  };

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
          <FormControl>
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
          <SimpleGrid columns={2} spacing={4} width="100%">
            <FormControl>
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

            <FormControl>
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
          </SimpleGrid>

          <Button 
            colorScheme="blue" 
            width="100%"
            onClick={handleRouteSubmit}
          >
            Create Route
          </Button>
        </VStack>
      </Box>

      {/* Vehicle List */}
      <Box>
        <Heading size="md" mb={4}>My Vehicles</Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {vehicles.map(vehicle => (
            <Card key={vehicle._id}>
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Heading size="sm">{vehicle.vehicleNumber}</Heading>
                    <Badge colorScheme="blue">{vehicle.type}</Badge>
                    <Text fontSize="sm">Seats: {vehicle.totalSeats}</Text>
                  </VStack>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    variant="outline"
                  >
                    Edit
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );

  const renderUserContent = () => (
    <VStack spacing={4} align="stretch">
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

      {/* Recent Routes */}
      <Box>
        <Heading size="md" mb={2}>Recent Routes</Heading>
        <VStack spacing={3}>
          {recentRoutes.map((route) => (
            <Card key={route._id} width="100%" variant="outline">
              <CardBody p={3}>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm">
                    {route.startLocation} → {route.endLocation}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {new Date(route.schedule.departureTime).toLocaleDateString()}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {new Date(route.schedule.departureTime).toLocaleTimeString()}
                  </Text>
                  <Badge size="sm">{route.status}</Badge>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </Box>
    </VStack>
  );

  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={2} px={3}>
        {user?.role === 'driver' ? renderDriverContent() : renderUserContent()}
      </Container>
    </Box>
  );
};

export default Home;