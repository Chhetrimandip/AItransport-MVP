import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Divider,
  Box,
  Button,
  useToast,
} from '@chakra-ui/react';
import { 
  FaMapMarkerAlt, 
  FaClock, 
  FaRupeeSign, 
  FaCar, 
  FaUser,
  FaCalendar
} from 'react-icons/fa';

const RouteDetails = ({ isOpen, onClose, route }) => {
  const toast = useToast();

  if (!route) return null;

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = () => {
    const departure = new Date(route.departureTime);
    const arrival = new Date(route.estimatedArrivalTime);
    const diff = arrival - departure;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Route Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch" pb={6}>
            {/* Status Badge */}
            <HStack justify="space-between">
              <Badge 
                colorScheme={route.status === 'scheduled' ? 'green' : 'gray'}
                fontSize="md"
                p={2}
              >
                {route.status.toUpperCase()}
              </Badge>
              <Text fontSize="sm">Route ID: {route._id}</Text>
            </HStack>

            {/* Locations */}
            <Box bg="gray.50" p={4} borderRadius="md">
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="green.500" />
                  <Text fontWeight="bold">From:</Text>
                  <Text>{route.startLocation}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaMapMarkerAlt} color="red.500" />
                  <Text fontWeight="bold">To:</Text>
                  <Text>{route.endLocation}</Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Schedule */}
            <Box>
              <VStack align="stretch" spacing={3}>
                <HStack>
                  <Icon as={FaCalendar} />
                  <Text fontWeight="bold">Departure:</Text>
                  <Text>{formatDateTime(route.departureTime)}</Text>
                </HStack>
                <HStack>
                  <Icon as={FaClock} />
                  <Text fontWeight="bold">Duration:</Text>
                  <Text>{calculateDuration()}</Text>
                </HStack>
              </VStack>
            </Box>

            <Divider />

            {/* Vehicle Details */}
            {route.vehicle && (
              <Box>
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Icon as={FaCar} />
                    <Text fontWeight="bold">Vehicle:</Text>
                    <Text>{route.vehicle.vehicleNumber} ({route.vehicle.type})</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaUser} />
                    <Text fontWeight="bold">Capacity:</Text>
                    <Text>{route.availableSeats} seats available</Text>
                  </HStack>
                </VStack>
              </Box>
            )}

            <Divider />

            {/* Fare Details */}
            <Box bg="blue.50" p={4} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold">Fare per seat:</Text>
                <HStack>
                  <Icon as={FaRupeeSign} />
                  <Text fontSize="xl" fontWeight="bold">
                    {route.fare}
                  </Text>
                </HStack>
              </HStack>
            </Box>

            {/* Action Buttons */}
            <HStack justify="flex-end" pt={4}>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button 
                colorScheme="blue"
                onClick={() => {
                  // Handle booking logic here
                  toast({
                    title: "Feature coming soon!",
                    description: "Booking functionality will be available soon.",
                    status: "info",
                    duration: 3000,
                  });
                }}
              >
                Book Now
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RouteDetails; 