const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    resultId: { type: String, unique: true, required: true },
    eventName: { type: String, required: true }, // e.g. "Onam - Dancing"
    eventId: { type: String },
    subCategory: { type: String },
    emoji: { type: String },
    winners: [
      {
        rank: { type: Number },
        medal: { type: String },
        name: { type: String },
        department: { type: String },
        regNo: { type: String }, // Optional
      }
    ],
  },
  { timestamps: true }
);

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;
