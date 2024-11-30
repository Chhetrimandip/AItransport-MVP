import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Heading,
  useDisclosure,
  VStack,
  Text,
  Spinner,
  Center,
} from '@chakra-ui/react';
import RouteSearch from '../components/routes/RouteSearch';
import RouteCard from '../components/routes/RouteCard';
import RouteDetails from '../components/routes/RouteDetails';
import api from '../utils/api';

const Routes = () => {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchRoutes = async (filters = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const { data } = await api.get(`/routes/search?${queryParams}`);
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleRouteClick = (route) => {
    setSelectedRoute(route);
    onOpen();
  };

  const handleSearch = (filters) => {
    fetchRoutes(filters);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8}>
        <Heading>Find Routes</Heading>
        
        <RouteSearch onSearch={handleSearch} />

        {isLoading ? (
          <Center py={8}>
            <Spinner size="xl" />
          </Center>
        ) : routes.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {routes.map((route) => (
              <Box 
                key={route._id} 
                onClick={() => handleRouteClick(route)}
                cursor="pointer"
                transition="transform 0.2s"
                _hover={{ transform: 'scale(1.02)' }}
              >
                <RouteCard route={route} />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <Box py={8} textAlign="center">
            <Text>No routes found matching your criteria.</Text>
          </Box>
        )}
      </VStack>

      <RouteDetails 
        isOpen={isOpen} 
        onClose={onClose} 
        route={selectedRoute} 
      />
    </Container>
  );
};

export default Routes; 