const express = require('express');
const router = express.Router();
const {
  createRoute,
  getNearbyRoutes,
  updateRouteStatus
} = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRoute);
router.get('/nearby', getNearbyRoutes);
router.patch('/:id/status', protect, updateRouteStatus);

module.exports = router;
