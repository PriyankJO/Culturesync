const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile, updateUserProfile, addAdmin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.route('/me')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post('/add-admin', protect, admin, addAdmin);

module.exports = router;
