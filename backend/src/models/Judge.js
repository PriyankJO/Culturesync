const mongoose = require('mongoose');

const judgeSchema = new mongoose.Schema(
  {
    judgeId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    expertise: { type: String },
    assignedEvents: [{ type: String }], // Array of eventId strings
  },
  { timestamps: true }
);

const Judge = mongoose.model('Judge', judgeSchema);
module.exports = Judge;
