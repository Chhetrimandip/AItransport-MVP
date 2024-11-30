import React, { useState } from 'react';
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
  Select,
  Button,
  VStack,
  useToast,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import api from '../../utils/api';

const VehicleRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: '',
    vehicleNumber: '',
    capacity: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/vehicles', formData);
      toast({
        title: 'Vehicle Added',
        description: 'Your vehicle has been registered successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess(response.data);
      onClose();
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.message || 'Failed to register vehicle',
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
        <ModalHeader>Register New Vehicle</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="flex-start">
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Vehicle Number</FormLabel>
              <Input value={formData.vehicleNumber} onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Capacity</FormLabel>
              <NumberInput value={formData.capacity} onChange={(value) => setFormData({ ...formData, capacity: value })}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </FormControl>
            <Button isLoading={isLoading} onClick={handleSubmit}>
              Register
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default VehicleRegistrationModal; 