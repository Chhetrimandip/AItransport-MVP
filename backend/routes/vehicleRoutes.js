const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getUserVehicles,
  registerVehicle,
  updateVehicleStatus
} = require('../controllers/vehicleController');

router.route('/')
  .get(protect, (req, res, next) => {
    console.log('GET /api/vehicles hit');
    next();
  }, getUserVehicles)
  .post(protect, registerVehicle);

router.patch('/:id/status', protect, updateVehicleStatus);

module.exports = router; 