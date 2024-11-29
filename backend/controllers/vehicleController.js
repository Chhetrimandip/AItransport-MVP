const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/vehicleModel');

// @desc    Get user's vehicles
// @route   GET /api/vehicles
// @access  Private
const getUserVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user._id });
  res.json(vehicles);
});

// @desc    Register new vehicle
// @route   POST /api/vehicles
// @access  Private
const registerVehicle = asyncHandler(async (req, res) => {
  const { type, vehicleNumber, capacity, description } = req.body;

  const vehicle = await Vehicle.create({
    owner: req.user._id,
    type,
    vehicleNumber,
    capacity,
    description,
    status: 'active',
    verificationStatus: 'pending'
  });

  res.status(201).json(vehicle);
});

// @desc    Update vehicle status
// @route   PATCH /api/vehicles/:id/status
// @access  Private
const updateVehicleStatus = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ 
    _id: req.params.id,
    owner: req.user._id 
  });

  if (!vehicle) {
    res.status(404);
    throw new Error('Vehicle not found');
  }

  vehicle.status = req.body.status;
  await vehicle.save();

  res.json(vehicle);
});

module.exports = {
  getUserVehicles,
  registerVehicle,
  updateVehicleStatus
}; 