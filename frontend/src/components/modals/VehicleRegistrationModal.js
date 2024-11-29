import React, { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { api } from '../../api';

const VehicleRegistrationModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    vehicleNumber: '',
    capacity: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post('/api/vehicles', formData);
      toast({
        title: 'Vehicle registered successfully',
        status: 'success',
        duration: 3000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.response?.data?.message || 'Failed to register vehicle',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the modal component code ...
};

export default VehicleRegistrationModal; 