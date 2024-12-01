const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoute,
  getRoutes,
  searchRoutes,
  getRouteById,
  updateRoute,
  deleteRoute,
  getRecentRoutes,
  getRouteBookings,
  updateRouteStatus
} = require('../controllers/routeController');

// Public routes
router.get('/search', searchRoutes);
router.get('/:id', getRouteById);

// Protected routes
router.use(protect);
router.post('/', createRoute);
router.get('/', getRoutes);
router.get('/recent', getRecentRoutes);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);
router.get('/:id/bookings', getRouteBookings);
router.patch('/:id/status', updateRouteStatus);

module.exports = router;
