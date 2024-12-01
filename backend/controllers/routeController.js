const asyncHandler = require('express-async-handler');
const Route = require('../models/routeModel');
const Booking = require('../models/bookingModel');

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
    .populate('vehicle', 'vehicleNumber type');

    // Calculate route similarity and add address information
    const routesWithDetails = routes.map(route => {
      const distanceToStart = calculateDistance(
        startLocation.coordinates,
        route.startLocation.coordinates
      );

      return {
        ...route.toObject(),
        distanceToStart,
        startLocation: {
          ...route.startLocation,
          address: route.startLocation.address || startLocation.address
        },
        endLocation: {
          ...route.endLocation,
          address: route.endLocation.address || endLocation.address
        }
      };
    });

    res.json(routesWithDetails);
  } catch (error) {
    console.error('Search routes error:', error);
    res.status(500).json({ message: 'Error searching routes' });
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

// @desc    Get bookings for a specific route
// @route   GET /api/routes/:id/bookings
// @access  Private
const getRouteBookings = asyncHandler(async (req, res) => {
  try {
    console.log('Starting getRouteBookings...');
    console.log('Request params:', req.params);
    console.log('User ID:', req.user._id);
    
    const route = await Route.findById(req.params.id);
    console.log('Found route:', route);
    
    if (!route) {
      console.log('Route not found');
      res.status(404);
      throw new Error('Route not found');
    }

    // Verify user is the driver of this route
    const isDriver = route.driver.toString() === req.user._id.toString();
    console.log('Auth check:', { 
      routeDriver: route.driver.toString(), 
      requestUser: req.user._id.toString(),
      isDriver 
    });

    if (!isDriver) {
      res.status(403);
      throw new Error('Not authorized to view these bookings');
    }

    const bookings = await Booking.find({ route: req.params.id })
      .populate('user', 'name phone')
      .sort('-createdAt');
    
    console.log('Found bookings:', bookings.length);
    res.json(bookings);
  } catch (error) {
    console.error('Error in getRouteBookings:', error);
    throw error;
  }
});

// @desc    Update route status
// @route   PATCH /api/routes/:id/status
// @access  Private (Driver only)
const updateRouteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const route = await Route.findById(req.params.id);

  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }

  // Verify user is the driver
  if (route.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this route');
  }

  route.status = status;
  await route.save();

  res.json(route);
});

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private
const getRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find()
    .populate('driver', 'name phone')
    .populate('vehicle', 'vehicleNumber type');
  res.json(routes);
});

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Private
const getRouteById = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('driver', 'name phone')
    .populate('vehicle', 'vehicleNumber type');
  
  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }
  
  res.json(route);
});

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private
const updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  
  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }
  
  if (route.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this route');
  }
  
  const updatedRoute = await Route.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  
  res.json(updatedRoute);
});

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private
const deleteRoute = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  
  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }
  
  if (route.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this route');
  }
  
  await route.deleteOne();
  res.json({ message: 'Route removed' });
});

module.exports = {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  getRecentRoutes,
  searchRoutes,
  getRouteBookings,
  updateRouteStatus,
  calculateDistance,
  calculateDirectionSimilarity
};