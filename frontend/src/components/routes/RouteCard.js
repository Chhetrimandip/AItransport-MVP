import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaClock, FaRupeeSign, FaChevronDown } from 'react-icons/fa';
import api from '../../utils/api';

const RouteCard = ({ route, onStatusUpdate }) => {
  const toast = useToast();

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/routes/${route._id}/status`, { status: newStatus });
      onStatusUpdate();
      toast({
        title: 'Route status updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!route) return null;

  return (
    <Card>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <Badge colorScheme={route.status === 'scheduled' ? 'green' : 'gray'}>
              {route.status}
            </Badge>
            {route.vehicle && (
              <Text fontSize="sm">Vehicle: {route.vehicle.vehicleNumber}</Text>
            )}
          </HStack>

          <VStack align="stretch" spacing={2}>
            <HStack>
              <Icon as={FaMapMarkerAlt} color="green.500" />
              <Text>{route.startLocation}</Text>
            </HStack>
            <HStack>
              <Icon as={FaMapMarkerAlt} color="red.500" />
              <Text>{route.endLocation}</Text>
            </HStack>
          </VStack>

          <HStack justify="space-between">
            <HStack>
              <Icon as={FaClock} />
              <Text fontSize="sm">
                {route.departureTime ? formatDateTime(route.departureTime) : 'N/A'}
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaRupeeSign} />
              <Text fontWeight="bold">₹{route.fare || 0}</Text>
            </HStack>
          </HStack>

          <Text fontSize="sm">Available Seats: {route.availableSeats || 0}</Text>

          <Menu>
            <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm">
              Update Status
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleStatusUpdate('scheduled')}>
                Set Scheduled
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate('in-progress')}>
                Set In Progress
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate('completed')}>
                Set Completed
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate('cancelled')}>
                Cancel Route
              </MenuItem>
            </MenuList>
          </Menu>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default RouteCard; 