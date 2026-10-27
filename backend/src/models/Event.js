const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, unique: true, required: true }, // e.g. 'evt-001'
    name: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // 'HH:mm'
    venue: { type: String, required: true },
    maxParticipants: { type: Number, required: true },
    registrationFee: { type: Number, default: 50 },
    registered: { type: Number, default: 0 },
    deadline: { type: String, required: true }, // 'YYYY-MM-DD'
    status: { type: String, enum: ['open', 'upcoming', 'planning', 'completed'], default: 'planning' },
    emoji: { type: String },
    posterTheme: { type: String },
    accentColor: { type: String },
    subCategories: [{ type: String }],
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
