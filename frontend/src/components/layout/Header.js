import { Box, Flex, Button, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <Box bg="blue.500" px={4} py={4}>
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Link to="/">
          <Heading size="lg" color="white">Transport App</Heading>
        </Link>
        <Flex gap={4}>
          {user ? (
            <>
              <Button as={Link} to="/dashboard" colorScheme="whiteAlpha">
                Dashboard
              </Button>
              <Button colorScheme="whiteAlpha" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/login" colorScheme="whiteAlpha">
                Login
              </Button>
              <Button as={Link} to="/register" colorScheme="whiteAlpha" variant="outline">
                Register
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header; 