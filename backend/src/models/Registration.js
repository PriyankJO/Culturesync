const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    regId: { type: String, unique: true, required: true }, // custom ID 'reg-evt-001-1'
    eventRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    eventId: { type: String, required: true },
    subCategory: { type: String, required: true },
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    regNo: { type: String, required: true },
    department: { type: String, required: true },
    source: { type: String, enum: ['self', 'admin'], default: 'self' },
    status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    attended: { type: Boolean, default: false },
    teamMembers: [{ type: String }],
    tokenNumber: { type: String, unique: true, sparse: true },
    paymentId: { type: String },
    paymentAmount: { type: Number },
    allocatedDate: { type: String },
    allocatedTime: { type: String },
    allocatedVenue: { type: String },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Registration = mongoose.model('Registration', registrationSchema);
module.exports = Registration;
