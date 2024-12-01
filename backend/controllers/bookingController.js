const asyncHandler = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Route = require('../models/routeModel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const {
    routeId,
    numberOfSeats,
    pickupLocation,
    dropoffLocation,
    estimatedPickupTime
  } = req.body;

  // Check if route exists and has available seats
  const route = await Route.findById(routeId);
  if (!route) {
    res.status(404);
    throw new Error('Route not found');
  }

  if (route.availableSeats < numberOfSeats) {
    res.status(400);
    throw new Error('Not enough seats available');
  }

  // Calculate total fare
  const totalFare = route.fare * numberOfSeats;

  // Create booking
  const booking = await Booking.create({
    user: req.user._id,
    route: routeId,
    pickupLocation,
    dropoffLocation,
    numberOfSeats,
    totalFare,
    status: 'pending',
    estimatedPickupTime: route.departureTime
  });

  // Update available seats
  route.availableSeats -= numberOfSeats;
  await route.save();

  // Populate booking with route and user details
  await booking.populate('route');
  await booking.populate('user', 'name email phone');

  res.status(201).json(booking);
});

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('route')
    .populate('user', 'name email');
  
  res.json(bookings);
});

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }

  // Verify user owns booking or is the route driver
  const route = await Route.findById(booking.route);
  if (booking.user.toString() !== req.user._id.toString() && 
      route.driver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this booking');
  }

  booking.status = status;
  
  if (status === 'cancelled') {
    // Return seats to available pool
    route.availableSeats += booking.numberOfSeats;
    await route.save();
  } else if (status === 'completed') {
    booking.completionTime = new Date();
  } else if (status === 'in-progress') {
    booking.actualPickupTime = new Date();
  }

  await booking.save();

  res.json(booking);
});

module.exports = {
  createBooking,
  getUserBookings,
  updateBookingStatus
};
