const asyncHandler = require('express-async-handler');
const Route = require('../models/routeModel');

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Driver only)
const createRoute = asyncHandler(async (req, res) => {
  const {
    startLocation,
    endLocation,
    vehicle,
    schedule,
    fare,
    availableSeats
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
    vehicle,
    schedule,
    fare,
    availableSeats
  });

  res.status(201).json(route);
});

// @desc    Get nearby routes
// @route   GET /api/routes/nearby
// @access  Public
const getNearbyRoutes = asyncHandler(async (req, res) => {
  const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters

  const routes = await Route.find({
    'startLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(maxDistance)
      }
    },
    status: 'scheduled',
    'schedule.departureTime': { $gt: new Date() }
  }).populate('driver', 'name email');

  res.json(routes);
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

  if (route.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this route');
  }

  route.status = status;
  await route.save();

  res.json(route);
});

// @desc    Get recent routes
// @route   GET /api/routes/recent
// @access  Private
const getRecentRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find().sort({ createdAt: -1 }).limit(5);
  res.json(routes);
});

// Add to your existing route search endpoint
const searchRoutes = async (req, res) => {
  try {
    const { boardingTime } = req.query;
    
    // Convert boardingTime string to Date object for comparison
    const requestedTime = new Date(`1970-01-01T${boardingTime}`);
    
    // Find routes that match the requested time (within a 30-minute window)
    const routes = await Route.find({
      status: 'active',
      departureTime: {
        $gte: new Date(requestedTime.getTime() - 30 * 60000), // 30 minutes before
        $lte: new Date(requestedTime.getTime() + 30 * 60000)  // 30 minutes after
      }
    }).populate('driver', 'name vehicleType');

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Error searching routes:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching routes',
      error: error.message
    });
  }
};

module.exports = {
  createRoute,
  getNearbyRoutes,
  updateRouteStatus,
  getRecentRoutes,
  searchRoutes
};
