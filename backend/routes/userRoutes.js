const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserRole
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Debug middleware
router.use((req, res, next) => {
  console.log('User route hit:', {
    method: req.method,
    path: req.path,
    body: req.body
  });
  next();
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.patch('/role', protect, updateUserRole);

module.exports = router;
