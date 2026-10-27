const Competition = require('../models/Competition');

// @desc    Fetch all competitions
// @route   GET /api/competitions
// @access  Public
const getCompetitions = async (req, res) => {
  try {
    const competitions = await Competition.find({}).lean();
    
    const Registration = require('../models/Registration');
    for (let comp of competitions) {
      comp.registered = await Registration.countDocuments({ eventId: comp.eventId, subCategory: comp.subCategory });
    }

    res.json({ success: true, data: competitions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single competition
// @route   GET /api/competitions/:id
// @access  Public
const getCompetitionById = async (req, res) => {
  try {
    let competition = await Competition.findOne({ competitionId: req.params.id }).lean();
    if (!competition && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      competition = await Competition.findById(req.params.id).lean();
    }
    
    if (competition) {
      const Registration = require('../models/Registration');
      competition.registered = await Registration.countDocuments({ eventId: competition.eventId, subCategory: competition.subCategory });
      res.json({ success: true, data: competition });
    } else {
      res.status(404).json({ success: false, message: 'Competition not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a competition
// @route   POST /api/competitions
// @access  Private/Admin
const createCompetition = async (req, res) => {
  try {
    const Event = require('../models/Event');
    const event = await Event.findOne({ eventId: req.body.eventId });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const competition = new Competition({
      competitionId: `comp-${req.body.eventId}-${req.body.subCategory.replace(/\s+/g, '-').toLowerCase()}`,
      eventRef: event._id,
      ...req.body
    });

    const createdCompetition = await competition.save();
    res.status(201).json({ success: true, data: createdCompetition });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a competition
// @route   PUT /api/competitions/:id
// @access  Private/Admin
const updateCompetition = async (req, res) => {
  try {
    const competition = await Competition.findOne({ competitionId: req.params.id });

    if (competition) {
      Object.assign(competition, req.body);
      const updatedCompetition = await competition.save();
      res.json({ success: true, data: updatedCompetition });
    } else {
      res.status(404).json({ success: false, message: 'Competition not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a competition
// @route   DELETE /api/competitions/:id
// @access  Private/Admin
const deleteCompetition = async (req, res) => {
  try {
    const competition = await Competition.findOne({ competitionId: req.params.id });

    if (competition) {
      await competition.deleteOne();
      res.json({ success: true, message: 'Competition removed' });
    } else {
      res.status(404).json({ success: false, message: 'Competition not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCompetitions,
  getCompetitionById,
  createCompetition,
  updateCompetition,
  deleteCompetition,
};
