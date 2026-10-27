const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { syncAllEventsToHistory } = require('../utils/historySync');

// @desc    Get all event history (automatically syncs existing & new events)
// @route   GET /api/history
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Automatically ensure all created events are synced to history
    await syncAllEventsToHistory();

    const history = await History.find({}).sort({ year: -1, date: -1, createdAt: -1 });
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Explicitly trigger full history sync
// @route   POST /api/history/sync
// @access  Public
router.post('/sync', async (req, res) => {
  try {
    await syncAllEventsToHistory();
    const history = await History.find({}).sort({ year: -1, date: -1, createdAt: -1 });
    res.json({ success: true, message: 'Events synchronized successfully', data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
