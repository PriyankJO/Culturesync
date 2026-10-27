const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema(
  {
    competitionId: { type: String, unique: true, required: true }, // e.g. 'comp-evt-001-dancing'
    eventRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventId: { type: String, required: true }, // to match frontend
    subCategory: { type: String, required: true },
    description: { type: String },
    individualOrTeam: { type: String, enum: ['Individual', 'Team'], default: 'Individual' },
    eligibility: {
      departments: [{ type: String }],
      year: { type: String },
      other: { type: String },
    },
    rules: [{ type: String }],
    judgingCriteria: [
      {
        id: { type: String },
        criteria: { type: String },
        weightage: { type: Number },
      },
    ],
    prizes: {
      first: { type: String },
      second: { type: String },
      third: { type: String },
      special: { type: String },
      certificates: { type: String },
    },
    contactPerson: { type: String },
    contactPhone: { type: String },
    contactEmail: { type: String },
    maxParticipants: { type: Number },
    registrationOpensOn: { type: String }, // 'YYYY-MM-DD'
    posterEmoji: { type: String },
    posterImage: { type: String },
    accentColor: { type: String },
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

const Competition = mongoose.model('Competition', competitionSchema);
module.exports = Competition;
