import { useState, useEffect } from 'react';
import {
  Box, Container, VStack, Heading, Text, Avatar, Card, CardBody,
  SimpleGrid, Button, useColorModeValue, HStack, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, useToast,
  Spinner, Badge, Flex, Center
} from '@chakra-ui/react';
import { FaUser, FaCar, FaHistory, FaStar, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AddVehicleModal from '../components/vehicles/AddVehicleModal';
import VehicleCard from '../components/vehicles/VehicleCard';
import RoleSwitcher from '../components/common/RoleSwitcher';
import AddRouteModal from '../components/routes/AddRouteModal';
import RouteCard from '../components/routes/RouteCard';

const VehicleRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  // ... (previous modal code remains the same)
};

const Profile = () => {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const [routes, setRoutes] = useState([]);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);

  const driverStats = [
    { label: 'Total Trips', value: '24', icon: FaHistory },
    { label: 'Active Vehicles', value: vehicles.length, icon: FaCar },
    { label: 'Rating', value: '4.8', icon: FaStar },
  ];

  const passengerStats = [
    { label: 'Total Trips', value: '24', icon: FaHistory },
    { label: 'Favorite Routes', value: '3', icon: FaStar },
    { label: 'Saved Places', value: '5', icon: FaCar },
  ];

  useEffect(() => {
    if (user?.role === 'driver') {
      fetchVehicles();
      fetchRoutes();
    }
  }, [user?.role]);

  const fetchVehicles = async () => {
    try {
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      toast({
        title: 'Error fetching vehicles',
        description: error.response?.data?.message || 'Failed to fetch vehicles',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const { data } = await api.get('/routes');
      console.log('Fetched routes:', data);
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: 'Error fetching routes',
        description: error.response?.data?.message || 'Failed to fetch routes',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const renderRoutesSection = () => (
    <>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">My Routes</Heading>
        <Button
          leftIcon={<FaPlus />}
          colorScheme="blue"
          onClick={() => setIsRouteModalOpen(true)}
        >
          Create Route
        </Button>
      </Flex>

      {routes.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {routes.map((route) => (
            <RouteCard
              key={route._id}
              route={route}
              onStatusUpdate={fetchRoutes}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <Text>No routes created yet</Text>
              <Button
                colorScheme="blue"
                onClick={() => setIsRouteModalOpen(true)}
              >
                Create Your First Route
              </Button>
            </VStack>
          </CardBody>
        </Card>
      )}

      <AddRouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        onRouteAdded={fetchRoutes}
        vehicles={vehicles}
      />
    </>
  );

  return (
    <Box p={4}>
      <Container maxW="container.xl">
        {/* Profile Header */}
        <VStack spacing={6} align="stretch">
          <Card>
            <CardBody>
              <VStack spacing={4} align="center">
                <Avatar 
                  size="2xl" 
                  name={user?.name} 
                />
                <VStack spacing={1}>
                  <Heading size="lg">{user?.name}</Heading>
                  <Text color="gray.500">{user?.email}</Text>
                  <Badge colorScheme={user?.role === 'driver' ? 'green' : 'blue'}>
                    {user?.role === 'driver' ? 'Driver' : 'Passenger'}
                  </Badge>
                  <RoleSwitcher />
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Stats Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {(user?.role === 'driver' ? driverStats : passengerStats).map((stat, index) => (
              <Card key={index}>
                <CardBody>
                  <VStack>
                    <Icon as={stat.icon} boxSize={6} color="blue.500" />
                    <Text fontWeight="bold">{stat.value}</Text>
                    <Text fontSize="sm" color="gray.500">{stat.label}</Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Vehicles Section (Only for drivers) */}
          {user?.role === 'driver' && (
            <>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">My Vehicles</Heading>
                <Button 
                  leftIcon={<FaPlus />} 
                  colorScheme="blue" 
                  onClick={onOpen}
                >
                  Add Vehicle
                </Button>
              </Flex>

              {/* Vehicle List */}
              {isLoading ? (
                <Center p={8}>
                  <Spinner />
                </Center>
              ) : vehicles.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {vehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle._id}
                      vehicle={vehicle}
                      onStatusUpdate={fetchVehicles}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Card>
                  <CardBody>
                    <VStack spacing={4}>
                      <Text>No vehicles registered yet</Text>
                      <Button colorScheme="blue" onClick={onOpen}>
                        Register Your First Vehicle
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Add Vehicle Modal */}
              <AddVehicleModal 
                isOpen={isOpen} 
                onClose={onClose} 
                onVehicleAdded={fetchVehicles} 
              />

              {renderRoutesSection()}
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile; 