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
  Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, CalendarIcon, TimeIcon, StarIcon } from '@chakra-ui/icons';
import Map from '../components/Map';

const Home = () => {
  const [user, setUser] = useState(null);
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userDataString = localStorage.getItem('userData');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Only parse userData if it exists
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
      } else {
        // If no user data, redirect to login
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      // If there's an error parsing, clear storage and redirect
      localStorage.clear();
      navigate('/login');
      return;
    }

    fetchRecentRoutes();
  }, [navigate]);

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
    localStorage.clear(); // Clear all localStorage
    navigate('/login');
  };

  const handleLocationSelect = (location) => {
    console.log('Selected location:', location);
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
      {/* Header */}
      <Box bg="white" boxShadow="sm" py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg">Transport AI</Heading>
            
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
              >
                <HStack>
                  <Avatar size="sm" name={user?.name} />
                  <Text>{user?.name}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem>Profile</MenuItem>
                <MenuItem>Settings</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Welcome Section */}
          <Box>
            <Heading size="md" mb={2}>
              Welcome back, {user?.name}!
            </Heading>
            <Text color="gray.600">
              Find and book your next journey with ease.
            </Text>
          </Box>

          {/* Quick Actions */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Icon as={CalendarIcon} boxSize={6} color="blue.500" />
                  <Heading size="sm">Book a Route</Heading>
                  <Text fontSize="sm" color="gray.600">
                    Search and book available transport routes
                  </Text>
                  <Button colorScheme="blue" size="sm">
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

          {/* Select Destination */}
          <Box>
            <Heading size="md" mb={4}>Select Destination</Heading>
            <Map onLocationSelect={handleLocationSelect} />
          </Box>

          {/* Recent Routes */}
          <Box>
            <Heading size="md" mb={4}>Recent Routes</Heading>
            {isLoading ? (
              <Text>Loading...</Text>
            ) : recentRoutes.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {recentRoutes.map((route) => (
                  <Card key={route._id}>
                    <CardHeader>
                      <Heading size="sm">{route.startLocation} → {route.endLocation}</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm">Date: {new Date(route.schedule.departureTime).toLocaleDateString()}</Text>
                        <Text fontSize="sm">Time: {new Date(route.schedule.departureTime).toLocaleTimeString()}</Text>
                        <Text fontSize="sm">Status: {route.status}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Text>No recent routes found</Text>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home; 