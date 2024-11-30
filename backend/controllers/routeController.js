const asyncHandler = require('express-async-handler');
const Route = require('../models/routeModel');
const Vehicle = require('../models/vehicleModel');

// @desc    Get driver's routes
// @route   GET /api/routes
// @access  Private
const getDriverRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({ driver: req.user._id })
    .populate('vehicle')
    .sort({ departureTime: 1 });
  res.json(routes);
});

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Driver only)
const createRoute = asyncHandler(async (req, res) => {
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

  // Verify user is a driver
  if (req.user.role !== 'driver') {
    res.status(403);
    throw new Error('Only drivers can create routes');
  }

  const route = await Route.create({
    startLocation,
    endLocation,
    startCoordinates,
    endCoordinates,
    driver: req.user._id,
    vehicle: vehicleId,
    departureTime,
    estimatedArrivalTime,
    fare,
    availableSeats,
    status: 'scheduled'
  });

  await route.populate(['vehicle', 'driver']);
  
  res.status(201).json(route);
});

// @desc    Update route status
// @route   PATCH /api/routes/:id/status
// @access  Private (Driver only)
const updateRouteStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const route = await Route.findOne({
    _id: req.params.id,
    driver: req.user._id
  });

  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }

  route.status = status;
  await route.save();

  res.json(route);
});

// @desc    Get all active routes
// @route   GET /api/routes/active
// @access  Public
const getActiveRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({
    status: 'scheduled',
    'schedule.departureTime': { $gt: new Date() }
  })
    .populate('driver', 'name')
    .populate('vehicle')
    .sort({ 'schedule.departureTime': 1 });
  
  res.json(routes);
});

// @desc    Search routes
// @route   GET /api/routes/search
// @access  Public
const searchRoutes = asyncHandler(async (req, res) => {
  const {
    startLocation,
    endLocation,
    date,
    vehicleType,
    page = 1,
    limit = 10
  } = req.query;

  const query = {};

  if (startLocation) {
    query.startLocation = { $regex: startLocation, $options: 'i' };
  }

  if (endLocation) {
    query.endLocation = { $regex: endLocation, $options: 'i' };
  }

  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    query.departureTime = {
      $gte: searchDate,
      $lt: nextDay
    };
  }

  if (vehicleType) {
    query['vehicle.type'] = vehicleType;
  }

  // Only show scheduled or in-progress routes
  query.status = { $in: ['scheduled', 'in-progress'] };

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      { path: 'driver', select: 'name rating' },
      { path: 'vehicle', select: 'type vehicleNumber' }
    ],
    sort: { departureTime: 1 }
  };

  const routes = await Route.paginate(query, options);

  res.json({
    routes: routes.docs,
    totalPages: routes.totalPages,
    currentPage: routes.page,
    totalRoutes: routes.totalDocs
  });
});

// @desc    Get route details
// @route   GET /api/routes/:id
// @access  Public
const getRouteDetails = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('driver', 'name')
    .populate('vehicle');

  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }

  res.json(route);
});

module.exports = {
  getDriverRoutes,
  createRoute,
  updateRouteStatus,
  getActiveRoutes,
  searchRoutes,
  getRouteDetails
};
