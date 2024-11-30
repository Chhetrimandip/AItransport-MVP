import { Button, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { FaCar, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const RoleSwitcher = () => {
  const { user, login } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDriver, setIsDriver] = useState(user?.role === 'driver');

  const handleRoleSwitch = async () => {
    setIsLoading(true);
    try {
      const newRole = isDriver ? 'user' : 'driver';
      const { data } = await api.patch('/users/role', { role: newRole });
      
      // Update local storage and auth context
      localStorage.setItem('user', JSON.stringify(data));
      login(data);
      
      setIsDriver(!isDriver);
      toast({
        title: `Switched to ${newRole} mode`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to switch role',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      leftIcon={isDriver ? <FaCar /> : <FaUser />}
      onClick={handleRoleSwitch}
      colorScheme={isDriver ? 'green' : 'blue'}
      size="md"
      isLoading={isLoading}
    >
      {isDriver ? 'Switch to Passenger Mode' : 'Switch to Driver Mode'}
    </Button>
  );
};

export default RoleSwitcher; 