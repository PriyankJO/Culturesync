const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Synchronize all existing events into History on connection
    const { syncAllEventsToHistory } = require('../utils/historySync');
    await syncAllEventsToHistory();
    console.log('Event history synchronized with active events.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
