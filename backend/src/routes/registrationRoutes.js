const express = require('express');
const router = express.Router();
const {
  getRegistrations,
  getMyRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  markAttendance
} = require('../controllers/registrationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRegistrations).post(protect, createRegistration);
router.route('/me').get(protect, getMyRegistrations);
router
  .route('/:id')
  .put(protect, admin, updateRegistration)
  .delete(protect, admin, deleteRegistration);
router.route('/:id/attendance').put(protect, admin, markAttendance);

module.exports = router;
