const validateRoute = (req, res, next) => {
  const {
    startLocation,
    endLocation,
    startCoordinates,
    endCoordinates,
    vehicleId,
    departureTime,
    estimatedArrivalTime,
    fare,
    availableSeats
  } = req.body;

  const errors = [];

  // Location validation
  if (!startLocation) errors.push('Start location is required');
  if (!endLocation) errors.push('End location is required');
  if (!startCoordinates || !startCoordinates.lat || !startCoordinates.lng) {
    errors.push('Start coordinates are required');
  }
  if (!endCoordinates || !endCoordinates.lat || !endCoordinates.lng) {
    errors.push('End coordinates are required');
  }

  // Other validations remain the same
  if (!vehicleId) errors.push('Vehicle is required');
  if (!departureTime) errors.push('Departure time is required');
  if (!estimatedArrivalTime) errors.push('Estimated arrival time is required');
  if (!fare) errors.push('Fare is required');
  if (!availableSeats) errors.push('Available seats is required');

  // Time validation
  const departure = new Date(departureTime);
  const arrival = new Date(estimatedArrivalTime);
  const now = new Date();

  if (departure < now) {
    errors.push('Departure time must be in the future');
  }

  if (arrival <= departure) {
    errors.push('Estimated arrival time must be after departure time');
  }

  // Numeric validation
  if (fare <= 0) errors.push('Fare must be greater than 0');
  if (availableSeats <= 0) errors.push('Available seats must be greater than 0');

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = { validateRoute }; 