import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import api from '../../utils/api';

const AddVehicleModal = ({ isOpen, onClose, onVehicleAdded }) => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    vehicleNumber: '',
    capacity: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/vehicles', formData);
      toast({
        title: 'Vehicle added successfully',
        status: 'success',
        duration: 3000,
      });
      onVehicleAdded();
      onClose();
      setFormData({
        type: '',
        vehicleNumber: '',
        capacity: '',
        description: ''
      });
    } catch (error) {
      toast({
        title: 'Failed to add vehicle',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Vehicle</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Vehicle Type</FormLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="Select type"
                >
                  <option value="bus">Bus</option>
                  <option value="train">Train</option>
                  <option value="taxi">Taxi</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Vehicle Number</FormLabel>
                <Input
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Enter vehicle number"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Capacity</FormLabel>
                <Input
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Enter passenger capacity"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter vehicle description"
                />
              </FormControl>
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Add Vehicle
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddVehicleModal; 