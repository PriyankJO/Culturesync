const User = require('../models/User');

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'Student' });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create student
// @route   POST /api/users/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  try {
    const { regNo, name, department, dob, mobile, initials, color } = req.body;

    const userExists = await User.findOne({ regNo });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Student already exists' });
    }

    const user = await User.create({
      regNo,
      name,
      department,
      dob,
      password: dob, // Default password is DOB for students
      role: 'Student',
      mobile,
      initials,
      color: color || 'blue',
      events: 0,
      status: 'active'
    });

    if (user) {
      res.status(201).json({ success: true, data: user });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/users/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (req.body.name) {
        user.name = req.body.name.trim();
        user.initials = req.body.initials || user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      }
      if (req.body.department !== undefined) user.department = req.body.department;
      if (req.body.dob !== undefined) {
        user.dob = req.body.dob;
        if (user.role === 'Student') {
          user.password = req.body.dob; // Keep password in sync with DOB
        }
      }
      if (req.body.mobile !== undefined) user.mobile = req.body.mobile;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.color !== undefined) user.color = req.body.color;
      if (req.body.status !== undefined) user.status = req.body.status;
      if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

      const updatedUser = await user.save();

      // Sync registrations if name or department was modified
      if (req.body.name || req.body.department) {
        const Registration = require('../models/Registration');
        await Registration.updateMany(
          { userRef: user._id },
          {
            ...(req.body.name ? { name: updatedUser.name } : {}),
            ...(req.body.department ? { department: updatedUser.department } : {})
          }
        );
      }

      res.json({ success: true, data: updatedUser });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/users/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user && user.role === 'Student') {
      const Registration = require('../models/Registration');
      const Event = require('../models/Event');
      const Score = require('../models/Score');

      // Find all registrations for this student
      const registrations = await Registration.find({ userRef: user._id });

      // Decrement event registered counts
      for (const reg of registrations) {
        const event = await Event.findOne({ eventId: reg.eventId });
        if (event && event.registered > 0) {
          event.registered -= 1;
          await event.save();
        }
      }

      // Delete registrations
      await Registration.deleteMany({ userRef: user._id });

      // Delete scores associated with this student
      await Score.deleteMany({ regNo: user.regNo });

      await user.deleteOne();
      res.json({ success: true, message: 'Student and related records removed' });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
