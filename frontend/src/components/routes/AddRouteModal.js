import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  useToast,
  Box,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../utils/api';

const AddRouteModal = ({ isOpen, onClose, onRouteAdded, vehicles }) => {
  const [formData, setFormData] = useState({
    startLocation: '',
    endLocation: '',
    vehicleId: '',
    departureTime: '',
    estimatedArrivalTime: '',
    fare: '',
    availableSeats: ''
  });

  const [mapPoints, setMapPoints] = useState({
    start: null,
    end: null
  });

  const [isSettingStart, setIsSettingStart] = useState(true);
  const toast = useToast();

  // Reuse the existing searchLocation function from Map.js
  const searchLocation = async (query) => {
    if (query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      return data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          
          if (isSettingStart) {
            setMapPoints(prev => ({ ...prev, start: { lat, lng }}));
            setFormData(prev => ({ ...prev, startLocation: data.display_name }));
          } else {
            setMapPoints(prev => ({ ...prev, end: { lat, lng }}));
            setFormData(prev => ({ ...prev, endLocation: data.display_name }));
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
        }
      }
    });
    return null;
  };

  // Add this function to validate times
  const validateTimes = () => {
    const departure = new Date(formData.departureTime);
    const arrival = new Date(formData.estimatedArrivalTime);
    const now = new Date();

    if (departure < now) {
      toast({
        title: 'Invalid departure time',
        description: 'Departure time must be in the future',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    if (arrival <= departure) {
      toast({
        title: 'Invalid arrival time',
        description: 'Estimated arrival time must be after departure time',
        status: 'error',
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateTimes()) return;
    
    try {
      const response = await api.post('/routes', {
        ...formData,
        startCoordinates: mapPoints.start,
        endCoordinates: mapPoints.end
      });
      
      onRouteAdded();
      onClose();
      toast({
        title: 'Route created successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error creating route',
        description: error.response?.data?.message || 'Please try again',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxW="900px">
        <ModalHeader>Create New Route</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack align="start" spacing={6}>
            <VStack spacing={4} flex={1}>
              <FormControl isRequired>
                <FormLabel>Start Location</FormLabel>
                <Input
                  value={formData.startLocation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    startLocation: e.target.value
                  }))}
                  placeholder="Click on map or enter location"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>End Location</FormLabel>
                <Input
                  value={formData.endLocation}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endLocation: e.target.value
                  }))}
                  placeholder="Click on map or enter location"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Vehicle</FormLabel>
                <Select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    vehicleId: e.target.value
                  }))}
                  placeholder="Select vehicle"
                >
                  {vehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber} - {vehicle.type}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Add Departure Time */}
              <FormControl isRequired>
                <FormLabel>Departure Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    departureTime: e.target.value
                  }))}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </FormControl>

              {/* Add Estimated Arrival Time */}
              <FormControl isRequired>
                <FormLabel>Estimated Arrival Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.estimatedArrivalTime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    estimatedArrivalTime: e.target.value
                  }))}
                  min={formData.departureTime}
                />
              </FormControl>

              {/* Add Fare */}
              <FormControl isRequired>
                <FormLabel>Fare (₹)</FormLabel>
                <Input
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fare: e.target.value
                  }))}
                  placeholder="Enter fare amount"
                  min="0"
                />
              </FormControl>

              {/* Add Available Seats */}
              <FormControl isRequired>
                <FormLabel>Available Seats</FormLabel>
                <Input
                  type="number"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availableSeats: e.target.value
                  }))}
                  placeholder="Enter number of seats"
                  min="1"
                />
              </FormControl>
            </VStack>

            <Box flex={1} h="400px" borderRadius="md" overflow="hidden">
              <MapContainer
                center={[27.7172, 85.3240]} // Default to Kathmandu
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <MapEvents />
                {mapPoints.start && (
                  <Marker position={[mapPoints.start.lat, mapPoints.start.lng]} />
                )}
                {mapPoints.end && (
                  <Marker position={[mapPoints.end.lat, mapPoints.end.lng]} />
                )}
              </MapContainer>
            </Box>
          </HStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={4}>
            <Button
              colorScheme={isSettingStart ? 'green' : 'gray'}
              onClick={() => setIsSettingStart(true)}
            >
              Set Start Point
            </Button>
            <Button
              colorScheme={!isSettingStart ? 'red' : 'gray'}
              onClick={() => setIsSettingStart(false)}
            >
              Set End Point
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Route
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddRouteModal; 