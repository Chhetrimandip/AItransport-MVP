import { 
  Box, 
  Flex, 
  Button, 
  Heading, 
  IconButton, 
  useColorMode,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons';

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const navigate = useNavigate();

  const NavItems = () => (
    <>
      {user ? (
        <>
          <Button 
            as={Link} 
            to="/home" 
            variant={isMobile ? "solid" : "ghost"}
            colorScheme={isMobile ? "blue" : "whiteAlpha"}
          >
            Home
          </Button>
          <Button 
            as={Link} 
            to="/profile" 
            variant={isMobile ? "solid" : "ghost"}
            colorScheme={isMobile ? "blue" : "whiteAlpha"}
          >
            Profile
          </Button>
          <Button 
            onClick={logout}
            variant={isMobile ? "solid" : "ghost"}
            colorScheme={isMobile ? "red" : "whiteAlpha"}
          >
            Logout
          </Button>
          <Button onClick={() => navigate('/routes')}>Find Routes</Button>
        </>
      ) : (
        <>
          <Button 
            as={Link} 
            to="/login" 
            variant={isMobile ? "solid" : "ghost"}
            colorScheme={isMobile ? "blue" : "whiteAlpha"}
          >
            Login
          </Button>
          <Button 
            as={Link} 
            to="/register" 
            variant={isMobile ? "solid" : "ghost"}
            colorScheme={isMobile ? "blue" : "whiteAlpha"}
          >
            Register
          </Button>
          <Button onClick={() => navigate('/routes')}>Find Routes</Button>
        </>
      )}
      <IconButton
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant={isMobile ? "solid" : "ghost"}
        colorScheme={isMobile ? "purple" : "whiteAlpha"}
        aria-label="Toggle color mode"
      />
    </>
  );

  return (
    <Box 
      bg={colorMode === 'light' ? 'blue.500' : 'gray.800'} 
      px={4} 
      py={3} 
      position="sticky" 
      top="0" 
      zIndex="sticky"
      boxShadow="sm"
    >
      <Flex maxW="container.xl" mx="auto" justify="space-between" align="center">
        <Link to="/">
          <Heading size="md" color="white">Transport AI</Heading>
        </Link>

        {isMobile ? (
          <>
            <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpen}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              size="md"
              aria-label="Open menu"
            />
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
                <DrawerBody>
                  <VStack spacing={4} align="stretch" mt={4}>
                    <NavItems />
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Flex gap={4} align="center">
            <NavItems />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Header; 