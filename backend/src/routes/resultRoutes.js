const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { syncEventToHistory } = require('../utils/historySync');

// @desc    Get all results
// @route   GET /api/results
// @access  Public
router.get('/', async (req, res) => {
  try {
    const results = await Result.find({});
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create result
// @route   POST /api/results
// @access  Private/Admin (Skipping auth for simplicity if required)
router.post('/', async (req, res) => {
  try {
    const result = new Result({
      resultId: `res-${Date.now()}`,
      ...req.body
    });
    const created = await result.save();

    if (created.eventId) {
      await syncEventToHistory(created.eventId);
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
