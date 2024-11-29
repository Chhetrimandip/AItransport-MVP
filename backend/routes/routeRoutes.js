const express = require('express');
const router = express.Router();
const { getRecentRoutes } = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');

router.get('/recent', protect, getRecentRoutes);

module.exports = router;
