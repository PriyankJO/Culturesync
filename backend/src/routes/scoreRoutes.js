const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all scores or by filter
// @route   GET /api/scores
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { eventId, subCategory, judgeId } = req.query;
    let query = {};
    if (eventId) query.eventId = eventId;
    if (subCategory) query.subCategory = subCategory;
    if (judgeId) query.judgeId = judgeId;

    const scores = await Score.find(query);
    res.json({ success: true, data: scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Add or Update score
// @route   POST /api/scores
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { eventId, subCategory, regNo, judgeId, score, remarks } = req.body;
    let existingScore = await Score.findOne({ eventId, subCategory, regNo, judgeId });

    if (existingScore) {
      existingScore.score = score;
      existingScore.remarks = remarks;
      const updated = await existingScore.save();
      return res.json({ success: true, data: updated });
    } else {
      const newScore = new Score({
        scoreId: `mrk-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        eventId, subCategory, regNo, judgeId, score, remarks
      });
      const created = await newScore.save();
      return res.status(201).json({ success: true, data: created });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
