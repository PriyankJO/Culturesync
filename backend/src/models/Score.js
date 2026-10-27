const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    scoreId: { type: String, unique: true, required: true },
    eventId: { type: String, required: true },
    subCategory: { type: String, required: true },
    regNo: { type: String, required: true }, // The student being judged
    judgeId: { type: String, required: true },
    score: { type: Number, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

const Score = mongoose.model('Score', scoreSchema);
module.exports = Score;
