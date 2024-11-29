import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Avatar,
  Card,
  CardBody,
  SimpleGrid,
  Button,
  useColorModeValue,
  HStack,
  Icon,
  Container,
} from '@chakra-ui/react';
import { FaUser, FaCar, FaHistory, FaStar } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const bgColor = useColorModeValue('white', 'gray.700');

  const stats = [
    { label: 'Total Trips', value: '24', icon: FaHistory },
    { label: 'Favorite Routes', value: '3', icon: FaStar },
    { label: 'Vehicles Saved', value: '2', icon: FaCar },
  ];

  return (
    <Box p={{ base: 4, md: 8 }}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Profile Header */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="center">
                <Avatar size={{ base: "xl", md: "2xl" }} name={user?.name} src={user?.avatar} />
                <VStack spacing={1}>
                  <Heading size={{ base: "md", md: "lg" }}>{user?.name}</Heading>
                  <Text color="gray.500">{user?.email}</Text>
                </VStack>
                <Button 
                  leftIcon={<FaUser />} 
                  colorScheme="blue"
                  width={{ base: "100%", md: "auto" }}
                >
                  Edit Profile
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardBody>
                  <HStack spacing={4}>
                    <Icon as={stat.icon} boxSize={6} color="blue.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold">
                        {stat.value}
                      </Text>
                      <Text color="gray.500">{stat.label}</Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default Profile; 