const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Define a minimal Registration schema for the migration
const registrationSchema = new mongoose.Schema({
  tokenNumber: { type: String, unique: true, sparse: true }
}, { strict: false });

const Registration = mongoose.model('Registration', registrationSchema);

async function migrateTokens() {
  try {
    console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Find all registrations that have a tokenNumber
    const registrations = await Registration.find({ tokenNumber: { $exists: true, $ne: '' } });
    console.log(`Found ${registrations.length} registrations with tokens.`);

    let updatedCount = 0;

    for (const reg of registrations) {
      const parts = reg.tokenNumber.split('-');
      // We expect the token to end with a number. e.g. XXXX-DAN-IND-001 or DAN-IND-001
      const lastPart = parts[parts.length - 1];
      
      if (!isNaN(lastPart) && lastPart.length < 4) {
        // It's a number and shorter than 4 characters
        const newNumber = String(parseInt(lastPart, 10)).padStart(4, '0');
        parts[parts.length - 1] = newNumber;
        const newToken = parts.join('-');
        
        console.log(`Updating ${reg.tokenNumber} -> ${newToken}`);
        reg.tokenNumber = newToken;
        await reg.save();
        updatedCount++;
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} tokens.`);
    process.exit(0);
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

migrateTokens();
