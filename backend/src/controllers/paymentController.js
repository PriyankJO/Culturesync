const Payment = require('../models/Payment');
const Registration = require('../models/Registration');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Admin)
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ date: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process a payment & update registration
// @route   POST /api/payments
// @access  Private (User)
const processPayment = async (req, res) => {
  try {
    const { registrationId, eventId, subCategory, name, amount, txnId } = req.body;

    // 1. Verify Registration exists and is unpaid
    const registration = await Registration.findOne({ regId: registrationId });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    if (registration.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Registration is already paid' });
    }

    // 2. Create the Payment record
    const payment = await Payment.create({
      txnId: txnId || `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      registrationId,
      eventId,
      subCategory,
      name,
      amount,
      status: 'success'
    });

    // 3. Update the Registration to 'paid' and link the payment ID
    registration.paymentStatus = 'paid';
    registration.paymentId = payment.txnId;
    await registration.save();

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayments,
  processPayment
};
