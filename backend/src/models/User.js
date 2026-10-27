const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    regNo: { type: String, unique: true, sparse: true }, // Student username
    staffName: { type: String, unique: true, sparse: true }, // Admin username
    password: { type: String, required: true }, // securely hashed
    role: { type: String, enum: ['Student', 'Admin'], required: true },
    name: { type: String, required: true },
    department: { type: String, required: true },
    mobile: { type: String },
    dob: { type: String }, // Stored as string 'YYYY-MM-DD' for students
    status: { type: String, enum: ['active', 'pending'], default: 'active' },
    color: { type: String },
    initials: { type: String },
    email: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
