const Event = require('../models/Event');
const History = require('../models/History');
const Registration = require('../models/Registration');
const Result = require('../models/Result');

/**
 * Synchronize a single event into the History collection.
 * Pulls latest registrations as participants and competition results as winners.
 * @param {string} eventId 
 */
const syncEventToHistory = async (eventId) => {
  try {
    if (!eventId) return null;
    const targetEventId = typeof eventId === 'object' ? eventId.eventId : eventId;
    const event = await Event.findOne({ eventId: targetEventId });
    if (!event) return null;

    // Calculate year from event date or fallback to current year
    let year = new Date().getFullYear();
    if (event.date) {
      const parts = event.date.split('-');
      const parsedYear = parseInt(parts[0], 10);
      if (!isNaN(parsedYear) && parsedYear > 1900) {
        year = parsedYear;
      }
    }

    // Retrieve participants from registrations for this event
    const registrations = await Registration.find({ eventId: event.eventId });
    const participants = registrations.map((r) => ({
      name: r.name,
      regNo: r.regNo,
      department: r.department,
      subCategory: r.subCategory || (event.subCategories?.[0] || 'General'),
    }));

    // Retrieve winners from results for this event
    const results = await Result.find({ eventId: event.eventId });
    const winners = [];
    for (const res of results) {
      if (Array.isArray(res.winners)) {
        for (const w of res.winners) {
          winners.push({
            rank: w.rank,
            medal: w.medal || 'faMedal',
            name: w.name,
            regNo: w.regNo || '',
            department: w.department || '',
            subCategory: res.subCategory || w.subCategory || (event.subCategories?.[0] || 'General'),
          });
        }
      }
    }

    const subCategories =
      Array.isArray(event.subCategories) && event.subCategories.length > 0
        ? event.subCategories
        : ['General'];

    const histData = {
      histId: `hist-${event.eventId}`,
      eventId: event.eventId,
      eventKey: event.category ? event.category.toLowerCase() : 'event',
      eventName: event.name,
      category: event.category || 'General',
      emoji: event.emoji || 'faIcons',
      venue: event.venue || 'College Campus',
      date: event.date || new Date().toISOString().split('T')[0],
      year: year,
      subCategories: subCategories,
      participants: participants,
      winners: winners,
    };

    const updated = await History.findOneAndUpdate(
      {
        $or: [
          { eventId: event.eventId },
          { histId: `hist-${event.eventId}` },
        ],
      },
      { $set: histData },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return updated;
  } catch (error) {
    console.error(`Failed to sync event ${eventId} to history:`, error.message);
    throw error;
  }
};

/**
 * Remove an event from the History collection
 * @param {string} eventId 
 */
const removeEventFromHistory = async (eventId) => {
  try {
    if (!eventId) return;
    await History.deleteMany({
      $or: [
        { eventId: eventId },
        { histId: `hist-${eventId}` },
      ],
    });
  } catch (error) {
    console.error(`Failed to delete event ${eventId} from history:`, error.message);
  }
};

/**
 * Synchronize all events in the Event collection into History
 */
const syncAllEventsToHistory = async () => {
  try {
    const events = await Event.find({});
    for (const event of events) {
      try {
        await syncEventToHistory(event.eventId);
      } catch (err) {
        console.error(`Error syncing event ${event.eventId}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error during syncAllEventsToHistory:', error.message);
  }
};

module.exports = {
  syncEventToHistory,
  removeEventFromHistory,
  syncAllEventsToHistory,
};
