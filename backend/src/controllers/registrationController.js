const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { syncEventToHistory } = require('../utils/historySync');

// @desc    Fetch all registrations (Admin can filter by eventId)
// @route   GET /api/registrations
// @access  Private
const getRegistrations = async (req, res) => {
  try {
    const { eventId } = req.query;
    const query = eventId ? { eventId } : {};
    const registrations = await Registration.find(query).populate('userRef', 'name regNo department color initials');
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch registrations for logged-in user
// @route   GET /api/registrations/me
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ regNo: req.user.regNo }).populate('eventRef');
    res.json({ success: true, data: registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a registration
// @route   POST /api/registrations
// @access  Private
const createRegistration = async (req, res) => {
  try {
    const { eventId, subCategory, teamMembers, tokenNumber, paymentId, paymentAmount } = req.body;
    
    // Check if event exists
    const event = await Event.findOne({ eventId });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check if already registered
    const exists = await Registration.findOne({ eventId, subCategory, regNo: req.user.regNo });
    if (exists) return res.status(400).json({ success: false, message: 'Already registered for this competition' });

    const registration = new Registration({
      regId: `reg-${eventId}-${req.user.regNo}-${Date.now()}`,
      eventRef: event._id,
      eventId,
      subCategory,
      userRef: req.user._id,
      name: req.user.name,
      regNo: req.user.regNo,
      department: req.user.department,
      source: req.user.role === 'Admin' ? 'admin' : 'self',
      status: 'pending', // Pending admin confirmation
      teamMembers: teamMembers || [],
      tokenNumber,
      paymentId,
      paymentAmount
    });

    const createdRegistration = await registration.save();
    
    // Increment event registered count
    event.registered += 1;
    await event.save();

    // Sync event participants to history
    await syncEventToHistory(eventId);

    res.status(201).json({ success: true, data: createdRegistration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a registration (e.g. confirm, allocate tokens)
// @route   PUT /api/registrations/:id
// @access  Private/Admin
const updateRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({ regId: req.params.id });

    if (registration) {
      Object.assign(registration, req.body);
      
      // Automatically generate a sequential token number when confirmed by admin
      if (registration.status === 'confirmed' && (!registration.tokenNumber || registration.tokenNumber === '')) {
        const Competition = require('../models/Competition');
        const comp = await Competition.findOne({ eventId: registration.eventId, subCategory: registration.subCategory });
        
        const count = await Registration.countDocuments({ 
          eventId: registration.eventId, 
          tokenNumber: { $exists: true, $ne: '' } 
        });
        
        const categoryStr = registration.subCategory.substring(0, 3).toUpperCase();
        const typeStr = comp && comp.individualOrTeam === 'Team' ? 'GRP' : 'IND';
        registration.tokenNumber = `${registration.eventId.substring(registration.eventId.length - 4).toUpperCase()}-${categoryStr}-${typeStr}-${String(count + 1).padStart(4, '0')}`;
      }

      const updatedRegistration = await registration.save();
      await syncEventToHistory(registration.eventId);
      res.json({ success: true, data: updatedRegistration });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a registration
// @route   DELETE /api/registrations/:id
// @access  Private/Admin
const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({ regId: req.params.id });

    if (registration) {
      const event = await Event.findOne({ eventId: registration.eventId });
      if (event && event.registered > 0) {
        event.registered -= 1;
        await event.save();
      }

      const eventId = registration.eventId;
      await registration.deleteOne();
      await syncEventToHistory(eventId);
      res.json({ success: true, message: 'Registration removed' });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance
// @route   PUT /api/registrations/:id/attendance
// @access  Private/Admin
const markAttendance = async (req, res) => {
  try {
    const registration = await Registration.findOne({ regId: req.params.id });
    if (registration) {
      registration.attended = req.body.attended;
      await registration.save();
      res.json({ success: true, data: registration });
    } else {
      res.status(404).json({ success: false, message: 'Registration not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getRegistrations,
  getMyRegistrations,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  markAttendance
};
