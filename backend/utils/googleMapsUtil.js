const { Client } = require('@google/maps');

const googleMapsClient = new Client({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

const getRouteDetails = async (origin, destination) => {
  try {
    const response = await googleMapsClient
      .directions({
        origin: origin,
        destination: destination,
        mode: 'transit'
      })
      .asPromise();

    return {
      distance: response.json.routes[0].legs[0].distance,
      duration: response.json.routes[0].legs[0].duration,
      steps: response.json.routes[0].legs[0].steps
    };
  } catch (error) {
    console.error('Error fetching route details:', error);
    throw error;
  }
};

const geocodeAddress = async (address) => {
  try {
    const response = await googleMapsClient
      .geocode({
        address: address
      })
      .asPromise();

    return {
      coordinates: [
        response.json.results[0].geometry.location.lng,
        response.json.results[0].geometry.location.lat
      ],
      formattedAddress: response.json.results[0].formatted_address
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

module.exports = {
  getRouteDetails,
  geocodeAddress
};
