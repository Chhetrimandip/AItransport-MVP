import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Text,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';

const BookingModal = ({ isOpen, onClose, route, onBookingSubmit }) => {
  const [bookingData, setBookingData] = useState({
    name: '',
    phone: '',
    numberOfSeats: 1,
  });

  if (!route) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onBookingSubmit({
      ...bookingData,
      routeId: route._id,
      pickupLocation: route.startLocation,
      dropoffLocation: route.endLocation,
      totalFare: route.fare * bookingData.numberOfSeats
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Book Your Ride</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} as="form" onSubmit={handleSubmit}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={bookingData.name}
                onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Phone</FormLabel>
              <Input
                value={bookingData.phone}
                onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Number of Seats</FormLabel>
              <NumberInput max={route.availableSeats} min={1} defaultValue={1}>
                <NumberInputField
                  value={bookingData.numberOfSeats}
                  onChange={(e) => setBookingData({...bookingData, numberOfSeats: parseInt(e.target.value) || 1})}
                />
              </NumberInput>
            </FormControl>

            <Text>Total Fare: Rs {route.fare * bookingData.numberOfSeats}</Text>

            <Button type="submit" colorScheme="blue" width="100%">
              Confirm Booking
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BookingModal; 