const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  getRecentRoutes,
  searchRoutes,
  getRouteBookings
} = require('../controllers/routeController');

// Apply protect middleware to all routes
router.use(protect);

// Specific routes first
router.get('/recent', getRecentRoutes);
router.post('/search', searchRoutes);

// Then parameter-based routes
router.get('/:id/bookings', getRouteBookings);
router.get('/:id', getRouteById);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

// Basic routes last
router.post('/', createRoute);
router.get('/', getRoutes);

module.exports = router;
