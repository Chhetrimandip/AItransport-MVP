const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRoute,
  getRecentRoutes,
  searchRoutes
} = require('../controllers/routeController');

// Route creation endpoint
router.post('/', protect, createRoute);

// Get recent routes
router.get('/recent', protect, getRecentRoutes);

// Search routes
router.post('/search', protect, searchRoutes);

module.exports = router;
