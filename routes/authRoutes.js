const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Existing Routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);

// New Profile Update Route
router.put('/profile/update', protect, updateProfile);

module.exports = router;