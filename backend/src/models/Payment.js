const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    txnId: { type: String, unique: true, required: true },
    registrationId: { type: String }, // references custom regId or ObjectId
    eventId: { type: String },
    subCategory: { type: String },
    name: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
