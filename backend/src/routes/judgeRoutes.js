const express = require('express');
const router = express.Router();
const Judge = require('../models/Judge');
const Score = require('../models/Score');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all judges
// @route   GET /api/judges
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const judges = await Judge.find({});
    res.json({ success: true, data: judges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a judge
// @route   POST /api/judges
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const judge = new Judge({
      judgeId: `jdg-${Date.now()}`,
      ...req.body
    });
    const createdJudge = await judge.save();
    res.status(201).json({ success: true, data: createdJudge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update a judge
// @route   PUT /api/judges/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const judge = await Judge.findOne({ judgeId: req.params.id });
    if (judge) {
      Object.assign(judge, req.body);
      const updatedJudge = await judge.save();
      res.json({ success: true, data: updatedJudge });
    } else {
      res.status(404).json({ success: false, message: 'Judge not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a judge
// @route   DELETE /api/judges/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const judge = await Judge.findOne({ judgeId: req.params.id });
    if (judge) {
      await judge.deleteOne();
      // Optionally delete their scores
      await Score.deleteMany({ judgeId: req.params.id });
      res.json({ success: true, message: 'Judge removed' });
    } else {
      res.status(404).json({ success: false, message: 'Judge not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
