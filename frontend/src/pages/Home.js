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
  Flex,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Spinner,
  Badge,
  FormControl,
  FormLabel,
  Input
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, CalendarIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import Map from '../components/Map';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../config';

const Home = () => {
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [selectedTime, setSelectedTime] = useState('');

  useEffect(() => {
    fetchRecentRoutes();
  }, []);

  const fetchRecentRoutes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/routes/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLocationSelect = ({ origin, destination }) => {
    if (origin && destination) {
      console.log('Route selected:', {
        from: origin,
        to: destination
      });
      // Handle the route selection here
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
          {user?.role === 'user' && (
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
                      Set Time
                    </Button>
                  </HStack>
                </FormControl>
              </form>
            </Box>
          )}

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
      </Container>
    </Box>
  );
};

export default Home;