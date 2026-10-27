const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/students')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/students/:id')
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
