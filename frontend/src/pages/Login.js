import React, { useState } from 'react';
import {
  Container,
  Button,
  Input,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
  Text,
  Link as ChakraLink
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending login request with:', formData);

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        name: data.name,
        email: data.email,
        id: data._id
      }));

      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Container maxW="md" py={8}>
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        <Heading>Login</Heading>

        <FormControl isInvalid={errors.email}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={errors.password}>
          <FormLabel>Password</FormLabel>
          <Input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        <Button
          colorScheme="blue"
          width="full"
          type="submit"
          isLoading={isLoading}
        >
          Login
        </Button>

        <Text>
          Don't have an account?{' '}
          <ChakraLink as={RouterLink} to="/register" color="blue.500">
            Register here
          </ChakraLink>
        </Text>
      </VStack>
    </Container>
  );
};

export default Login; 