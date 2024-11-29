const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  updateBookingStatus
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getUserBookings);
router.patch('/:id/status', protect, updateBookingStatus);

module.exports = router;
