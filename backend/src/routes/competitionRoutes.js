const express = require('express');
const router = express.Router();
const {
  getCompetitions,
  getCompetitionById,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} = require('../controllers/competitionController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getCompetitions).post(protect, admin, createCompetition);
router
  .route('/:id')
  .get(getCompetitionById)
  .put(protect, admin, updateCompetition)
  .delete(protect, admin, deleteCompetition);

module.exports = router;
