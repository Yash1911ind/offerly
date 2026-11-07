const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BRANCHES = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned unless explicitly requested
    },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    // Student profile fields (used for eligibility checks)
    rollNo: { type: String, trim: true, maxlength: 20 },
    branch: { type: String, enum: { values: BRANCHES, message: 'Invalid branch' } },
    cgpa: {
      type: Number,
      min: [0, 'CGPA cannot be below 0'],
      max: [10, 'CGPA cannot exceed 10'],
    },
  },
  { timestamps: true }
);

// Hash the password with bcrypt whenever it is created or changed
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

userSchema.statics.BRANCHES = BRANCHES;

module.exports = mongoose.model('User', userSchema);
