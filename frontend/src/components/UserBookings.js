import { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  Text,
  Badge,
  Heading,
  SimpleGrid,
  Button,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import api from '../utils/api';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
    } catch (error) {
      toast({
        title: 'Error fetching bookings',
        description: error.response?.data?.message || 'Unable to fetch your bookings',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings(); // Refresh the bookings list
      toast({
        title: 'Booking Cancelled',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error cancelling booking',
        description: error.response?.data?.message || 'Unable to cancel booking',
        status: 'error',
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner />
      </Center>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">My Scheduled Rides</Heading>
      {bookings.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={8}>
          You haven't booked any rides yet
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {bookings.map(booking => (
            <Box key={booking._id} p={4} borderWidth={1} borderRadius="lg" shadow="sm">
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">
                  {booking.route?.startLocation.address?.split(',')[0]} → 
                  {booking.route?.endLocation.address?.split(',')[0]}
                </Text>
                <Text fontSize="sm">
                  Departure: {new Date(booking.estimatedPickupTime).toLocaleString()}
                </Text>
                <Text fontSize="sm">Vehicle: {booking.route?.vehicle?.vehicleNumber}</Text>
                <Text fontSize="sm">Seats: {booking.numberOfSeats}</Text>
                <Text fontSize="sm">Total Fare: Rs {booking.totalFare}</Text>
                <Badge 
                  colorScheme={
                    booking.status === 'confirmed' ? 'green' : 
                    booking.status === 'cancelled' ? 'red' : 
                    booking.status === 'completed' ? 'blue' : 
                    'yellow'
                  }
                >
                  {booking.status}
                </Badge>
                {booking.status === 'pending' && (
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleCancelBooking(booking._id)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </VStack>
  );
};

export default UserBookings; 