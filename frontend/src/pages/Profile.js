import { useState, useEffect } from 'react';
import {
  Box, Container, VStack, Heading, Text, Avatar, Card, CardBody,
  SimpleGrid, Button, useColorModeValue, HStack, Icon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalCloseButton, useDisclosure, FormControl, FormLabel,
  Input, Select, NumberInput, NumberInputField, useToast,
  Spinner, Badge
} from '@chakra-ui/react';
import { FaUser, FaCar, FaHistory, FaStar, FaPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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

  const stats = [
    { label: 'Total Trips', value: '24', icon: FaHistory },
    { label: 'Favorite Routes', value: '3', icon: FaStar },
    { label: 'Vehicles Saved', value: '2', icon: FaCar },
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      console.log('Token:', localStorage.getItem('token'));
      const { data } = await api.get('/vehicles');
      setVehicles(data);
    } catch (error) {
      console.error('Fetch vehicles error:', error.response?.data);
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

  const updateVehicleStatus = async (vehicleId, newStatus) => {
    try {
      await api.patch(`/vehicles/${vehicleId}/status`, { status: newStatus });
      fetchVehicles();
      toast({
        title: 'Vehicle status updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message || 'Update failed',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Profile Header */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="center">
                <Avatar size={{ base: "xl", md: "2xl" }} name={user?.name} src={user?.avatar} />
                <VStack spacing={1}>
                  <Heading size={{ base: "md", md: "lg" }}>{user?.name}</Heading>
                  <Text color="gray.500">{user?.email}</Text>
                </VStack>
                <Button 
                  leftIcon={<FaUser />} 
                  colorScheme="blue"
                  width={{ base: "100%", md: "auto" }}
                >
                  Edit Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardBody>
                  <HStack spacing={4}>
                    <Icon as={stat.icon} boxSize={6} color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                        {stat.value}
                      </Text>
                      <Text color="gray.500">{stat.label}</Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile; 