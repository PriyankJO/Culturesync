const express = require('express');
const router = express.Router();
const { getPayments, processPayment } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getPayments);
router.post('/', protect, processPayment);

module.exports = router;

