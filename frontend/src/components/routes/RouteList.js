import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Alert,
  AlertRoot as AlertIcon,
  Grid
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const RouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await api.get('/routes/nearby?lat=40.7128&lng=-74.0060');
        setRoutes(response.data);
      } catch (err) {
        setError('Failed to fetch routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) return <Spinner size="xl" />;
  if (error) return (
    <Alert status="error">
      <AlertIcon />
      {error}
    </Alert>
  );

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6} p={4}>
      {routes.map((route) => (
        <Box key={route._id} p={5} shadow="md" borderWidth="1px" borderRadius="lg">
          <Heading size="md">
            {route.startLocation.address} → {route.endLocation.address}
          </Heading>
          <VStack align="start" mt={4} spacing={2}>
            <Text>Driver: {route.driver.name}</Text>
            <Text>Departure: {new Date(route.schedule.departureTime).toLocaleString()}</Text>
            <Text>Available Seats: {route.availableSeats}</Text>
            <Text>Fare: ${route.fare}</Text>
          </VStack>
        </Box>
      ))}
    </Grid>
  );
};

export default RouteList; 