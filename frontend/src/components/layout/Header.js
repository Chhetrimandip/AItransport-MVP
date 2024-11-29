import { 
  Box, 
  Flex, 
  Button, 
  Heading, 
  IconButton, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
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
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HamburgerIcon } from '@chakra-ui/icons';

const Header = () => {
  const { user, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const NavItems = () => (
    <>
      {user ? (
        <>
          <Button as={Link} to="/home" colorScheme="whiteAlpha">
            Home
          </Button>
          <Button as={Link} to="/profile" colorScheme="whiteAlpha">
            Profile
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
    </>
  );

  return (
    <Box bg="blue.500" px={2} py={2} position="sticky" top="0" zIndex="sticky">
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
              size="sm"
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
          <Flex gap={4}>
            <NavItems />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default Header; 