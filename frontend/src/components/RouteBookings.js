import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Badge,
  Box,
  Spinner,
  Center,
  useToast,
} from '@chakra-ui/react';
import api from '../utils/api';

const RouteBookings = ({ isOpen, onClose, route }) => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!route?._id) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching bookings for route:', route._id);
        const response = await api.get(`/routes/${route._id}/bookings`);
        console.log('Bookings response:', response.data);
        setBookings(response.data);
      } catch (error) {
        console.error('Error details:', error.response?.data);
        toast({
          title: 'Error fetching bookings',
          description: error.response?.data?.message || 'Unable to fetch bookings',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && route) {
      fetchBookings();
    }
  }, [isOpen, route, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bookings for Route</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {bookings.map(booking => (
              <Box key={booking._id} p={4} borderWidth={1} borderRadius="md" width="100%">
                <Text fontWeight="bold">{booking.user.name}</Text>
                <Text>Phone: {booking.user.phone}</Text>
                <Text>Seats: {booking.numberOfSeats}</Text>
                <Badge colorScheme={booking.status === 'confirmed' ? 'green' : 'yellow'}>
                  {booking.status}
                </Badge>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RouteBookings; 