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
} from '@chakra-ui/react';
import api from '../utils/api';

const RouteBookings = ({ isOpen, onClose, route }) => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get(`/routes/${route._id}/bookings`);
        setBookings(response.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    if (isOpen && route) {
      fetchBookings();
    }
  }, [isOpen, route]);

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