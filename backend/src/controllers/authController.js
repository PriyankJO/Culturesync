const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { regNo, dob, staffName, phone } = req.body;

  let user;

  // Check if admin login
  if (staffName && phone) {
    // Normalizing and finding
    const normalizedStaff = staffName.trim().toLowerCase();
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // In our simplified logic, the password for admin is the normalized phone number
    // We'll search by staffName (case insensitive handled via frontend or sparse regNo)
    // Actually, in seed, we'll store staffName exactly or just find by username regex
    user = await User.findOne({ staffName: { $regex: new RegExp(`^${normalizedStaff}$`, 'i') }, role: 'Admin' });

    if (user && (await user.matchPassword(normalizedPhone))) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          staffName: user.staffName,
          department: user.department,
          role: user.role,
          mobile: user.mobile,
          email: user.email,
          avatar: user.avatar,
          status: user.status,
          initials: user.initials,
          color: user.color,
          token: generateToken(user._id),
        },
      });
    }
  } else if (regNo && dob) {
    // Student login
    const normalizedReg = regNo.trim().toLowerCase();
    
    user = await User.findOne({ regNo: { $regex: new RegExp(`^${normalizedReg}$`, 'i') }, role: 'Student' });

    if (user && (await user.matchPassword(dob))) {
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          regNo: user.regNo,
          department: user.department,
          role: user.role,
          mobile: user.mobile,
          email: user.email,
          dob: user.dob,
          avatar: user.avatar,
          status: user.status,
          initials: user.initials,
          color: user.color,
          token: generateToken(user._id),
        },
      });
    }
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        regNo: user.regNo,
        staffName: user.staffName,
        department: user.department,
        role: user.role,
        mobile: user.mobile,
        email: user.email,
        dob: user.dob,
        avatar: user.avatar,
        status: user.status,
        initials: user.initials,
        color: user.color,
      },
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, department, mobile, email, dob, avatar, color } = req.body;

    if (name) {
      user.name = name.trim();
      user.initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    }
    if (department !== undefined) user.department = department;
    if (mobile !== undefined) user.mobile = mobile;
    if (email !== undefined) user.email = email;
    if (avatar !== undefined) user.avatar = avatar;
    if (color !== undefined) user.color = color;

    // If student updates their DOB, keep password in sync with DOB
    if (dob && user.role === 'Student') {
      user.dob = dob;
      user.password = dob;
    }

    const updatedUser = await user.save();

    // If name or department was modified, sync registrations for this user
    if (name || department) {
      const Registration = require('../models/Registration');
      await Registration.updateMany(
        { userRef: user._id },
        { 
          ...(name ? { name: updatedUser.name } : {}),
          ...(department ? { department: updatedUser.department } : {})
        }
      );
    }

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        regNo: updatedUser.regNo,
        staffName: updatedUser.staffName,
        department: updatedUser.department,
        role: updatedUser.role,
        mobile: updatedUser.mobile,
        email: updatedUser.email,
        dob: updatedUser.dob,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        initials: updatedUser.initials,
        color: updatedUser.color,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new Admin user
// @route   POST /api/auth/add-admin
// @access  Private/Admin
const addAdmin = async (req, res) => {
  const { staffName, department, mobile, email } = req.body;
  
  try {
    const normalizedStaff = staffName.trim().toLowerCase();
    
    // Check if user exists
    const userExists = await User.findOne({ staffName: { $regex: new RegExp(`^${normalizedStaff}$`, 'i') }, role: 'Admin' });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An admin with this Staff Name already exists.' });
    }

    // Use mobile as password
    const normalizedPhone = mobile.replace(/\D/g, '');
    if (!normalizedPhone || normalizedPhone.length < 5) {
      return res.status(400).json({ success: false, message: 'Mobile number is required and must be valid to serve as password.' });
    }

    // Get initials
    const initials = staffName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const admin = await User.create({
      staffName: staffName.trim(),
      name: staffName.trim(), // for generic usage
      password: normalizedPhone,
      role: 'Admin',
      department,
      mobile,
      email, // NOTE: email field is not in schema but can be added if needed, schema allows strict:false mostly, but let's stick to defined schema
      initials,
      color: '#c9a84c',
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        staffName: admin.staffName,
        department: admin.department,
        role: admin.role,
        initials: admin.initials,
        color: admin.color,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAdmin,
};
