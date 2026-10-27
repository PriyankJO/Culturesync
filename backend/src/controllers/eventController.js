const Event = require('../models/Event');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { syncEventToHistory, removeEventFromHistory } = require('../utils/historySync');

// @desc    Fetch all events
// @route   GET /api/events
// @access  Public (or protected if needed)
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).lean();
    
    // Dynamically calculate actual registered count to prevent mismatches
    for (let event of events) {
      event.registered = await Registration.countDocuments({ eventId: event.eventId });
    }

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    // Note: req.params.id might be our custom eventId (e.g. 'evt-001') or ObjectId. Let's try custom eventId first.
    let event = await Event.findOne({ eventId: req.params.id }).lean();
    if (!event && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      event = await Event.findById(req.params.id).lean();
    }
    
    if (event) {
      event.registered = await Registration.countDocuments({ eventId: event.eventId });
      res.json({ success: true, data: event });
    } else {
      res.status(404).json({ success: false, message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const event = new Event({
      eventId: `evt-${Date.now()}`,
      ...req.body
    });

    const createdEvent = await event.save();

    // Automatically sync created event to history
    await syncEventToHistory(createdEvent.eventId);

    res.status(201).json({ success: true, data: createdEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });

    if (event) {
      Object.assign(event, req.body);
      const updatedEvent = await event.save();

      // Automatically sync updated event to history
      await syncEventToHistory(updatedEvent.eventId);

      res.json({ success: true, data: updatedEvent });
    } else {
      res.status(404).json({ success: false, message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.id });

    if (event) {
      await Competition.deleteMany({ eventId: req.params.id });
      await Registration.deleteMany({ eventId: req.params.id });
      await removeEventFromHistory(req.params.id);
      await event.deleteOne();
      res.json({ success: true, message: 'Event removed' });
    } else {
      res.status(404).json({ success: false, message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
