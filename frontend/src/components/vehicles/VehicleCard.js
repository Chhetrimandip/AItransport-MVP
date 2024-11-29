import {
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Divider,
  useToast,
} from '@chakra-ui/react';
import { FaCar, FaChevronDown } from 'react-icons/fa';
import api from '../../utils/api';

const VehicleCard = ({ vehicle, onStatusUpdate }) => {
  const toast = useToast();

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.patch(`/vehicles/${vehicle._id}/status`, { status: newStatus });
      onStatusUpdate();
      toast({
        title: 'Status updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'maintenance':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between">
            <HStack>
              <Icon as={FaCar} color="blue.500" />
              <Text fontWeight="bold">{vehicle.vehicleNumber}</Text>
            </HStack>
            <Badge colorScheme={getStatusColor(vehicle.status)}>
              {vehicle.status}
            </Badge>
          </HStack>
          
          <Divider />
          
          <Text fontSize="sm">Type: {vehicle.type}</Text>
          <Text fontSize="sm">Capacity: {vehicle.capacity} seats</Text>
          {vehicle.description && (
            <Text fontSize="sm" noOfLines={2}>
              {vehicle.description}
            </Text>
          )}
          
          <Menu>
            <MenuButton as={Button} rightIcon={<FaChevronDown />} size="sm">
              Update Status
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleStatusUpdate('active')}>
                Set Active
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate('maintenance')}>
                Set Maintenance
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate('inactive')}>
                Set Inactive
              </MenuItem>
            </MenuList>
          </Menu>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VehicleCard; 