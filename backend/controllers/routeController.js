const asyncHandler = require('express-async-handler');
const Route = require('../models/routeModel');

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Driver only)
const createRoute = asyncHandler(async (req, res) => {
  const {
    startLocation,
    endLocation,
    vehicleId,
    departureTime,
    availableSeats,
    fare
  } = req.body;

  // Verify user is a driver
  if (req.user.role !== 'driver') {
    res.status(403);
    throw new Error('Only drivers can create routes');
  }

  const route = await Route.create({
    startLocation,
    endLocation,
    driver: req.user._id,
    vehicle: vehicleId,
    departureTime,
    availableSeats,
    fare,
    status: 'active'
  });

  res.status(201).json(route);
});

// @desc    Get recent routes
// @route   GET /api/routes/recent
// @access  Private
const getRecentRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({
    driver: req.user._id,
    status: 'active'
  })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(routes);
});

// @desc    Search routes
// @route   POST /api/routes/search
// @access  Private
const searchRoutes = asyncHandler(async (req, res) => {
  try {
    const { startLocation, endLocation } = req.body;
    const MAX_DISTANCE = 5000; // 5km in meters

    // Find routes that are:
    // 1. Active
    // 2. Have available seats
    // 3. Start point is within 5km of user's current location
    const routes = await Route.find({
      status: 'active',
      availableSeats: { $gt: 0 },
      'startLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: startLocation.coordinates
          },
          $maxDistance: MAX_DISTANCE
        }
      }
    })
    .populate('driver', 'name phone')
    .populate('vehicle', 'type vehicleNumber');

    // Calculate route similarity and distance for each route
    const routesWithScores = routes.map(route => {
      // Calculate distance from user to route's start point
      const distanceToStart = calculateDistance(
        startLocation.coordinates,
        route.startLocation.coordinates
      );

      // Calculate route direction similarity (dot product of vectors)
      const routeVector = [
        route.endLocation.coordinates[0] - route.startLocation.coordinates[0],
        route.endLocation.coordinates[1] - route.startLocation.coordinates[1]
      ];
      
      const userVector = [
        endLocation.coordinates[0] - startLocation.coordinates[0],
        endLocation.coordinates[1] - startLocation.coordinates[1]
      ];

      const similarity = calculateDirectionSimilarity(routeVector, userVector);

      return {
        ...route.toObject(),
        distanceToStart,
        routeSimilarity: similarity
      };
    });

    // Filter routes based on direction similarity (at least 0.7 similarity)
    const matchingRoutes = routesWithScores.filter(route => 
      route.routeSimilarity > 0.7 && route.distanceToStart <= MAX_DISTANCE
    );

    res.json(matchingRoutes);
  } catch (error) {
    console.error('Search Routes Error:', error);
    res.status(500).json({ 
      message: 'Error searching routes', 
      error: error.message 
    });
  }
});

// Helper function to calculate direction similarity (dot product)
function calculateDirectionSimilarity(vector1, vector2) {
  const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
  const magnitude1 = Math.sqrt(vector1[0] * vector1[0] + vector1[1] * vector1[1]);
  const magnitude2 = Math.sqrt(vector2[0] * vector2[0] + vector2[1] * vector2[1]);
  
  return dotProduct / (magnitude1 * magnitude2);
}

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(coords1, coords2) {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

module.exports = {
  createRoute,
  getRecentRoutes,
  searchRoutes
};