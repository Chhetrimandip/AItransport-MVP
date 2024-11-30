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
  const { startLocation, endLocation, departureTime } = req.body;

  const routes = await Route.find({
    status: 'active',
    departureTime: {
      $gte: new Date(departureTime)
    },
    availableSeats: { $gt: 0 }
  }).populate('driver vehicle');

  res.json(routes);
});

module.exports = {
  createRoute,
  getRecentRoutes,
  searchRoutes
};
