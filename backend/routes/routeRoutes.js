const express = require('express');
const router = express.Router();
const {
  createRoute,
  getNearbyRoutes,
  updateRouteStatus,
  getDriverRoutes,
  searchRoutes,
  getActiveRoutes
} = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');
const { validateRoute } = require('../middleware/routeValidation');

router.post('/', protect, validateRoute, createRoute);
router.get('/driver', protect, getDriverRoutes);
router.get('/nearby', getNearbyRoutes);
router.get('/search', searchRoutes);
router.get('/active', getActiveRoutes);
router.patch('/:id/status', protect, updateRouteStatus);

module.exports = router;
