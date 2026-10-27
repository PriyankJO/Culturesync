const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    histId: { type: String, unique: true, required: true },
    eventId: { type: String },
    eventKey: { type: String },
    eventName: { type: String },
    category: { type: String },
    emoji: { type: String },
    venue: { type: String },
    date: { type: String },
    year: { type: Number },
    subCategories: [{ type: String }],
    participants: [
      {
        name: { type: String },
        regNo: { type: String },
        department: { type: String },
        subCategory: { type: String },
      }
    ],
    winners: [
      {
        rank: { type: Number },
        medal: { type: String },
        name: { type: String },
        regNo: { type: String },
        department: { type: String },
        subCategory: { type: String },
      }
    ],
  },
  { timestamps: true }
);

const History = mongoose.model('History', historySchema);
module.exports = History;
