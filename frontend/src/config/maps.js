export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const defaultMapConfig = {
  libraries: ['places'],
  googleMapsApiKey: GOOGLE_MAPS_API_KEY
};

export const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

export const defaultCenter = {
  lat: 27.7172,
  lng: 85.3240 // Kathmandu coordinates
}; 