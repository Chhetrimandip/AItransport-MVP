import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { VStack } from '@chakra-ui/react';

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240 // Kathmandu coordinates
};

const Map = ({ onLocationSelect }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const mapRef = useRef(null);

  const handleLoad = useCallback((map) => {
    mapRef.current = map;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setOrigin(pos);
          map.panTo(pos);
        }
      );
    }
  }, []);

  return (
    <VStack spacing={4} width="100%">
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={origin || defaultCenter}
          zoom={15}
          onLoad={handleLoad}
        >
          {origin && (
            <Marker
              position={origin}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}
          {destination && (
            <Marker
              position={destination}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </VStack>
  );
};

export default Map; 