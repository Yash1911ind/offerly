const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { ApiError, asyncHandler } = require('../utils/ApiError');

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const toNumberOrUndefined = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

// POST /api/auth/register  -> create an account (student by default)
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password, rollNo, branch, cgpa, adminCode } = req.body;

    // Admin accounts need the secret placement-cell code from .env
    let role = 'student';
    if (adminCode) {
      if (!process.env.ADMIN_CODE || adminCode !== process.env.ADMIN_CODE) {
        throw new ApiError(400, 'Invalid admin code');
      }
      role = 'admin';
    }

    if (await User.exists({ email: String(email || '').toLowerCase().trim() })) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      rollNo: role === 'student' ? rollNo : undefined,
      branch: role === 'student' && branch ? branch : undefined,
      cgpa: role === 'student' ? toNumberOrUndefined(cgpa) : undefined,
    });

    res.status(201).json({ token: signToken(user), user });
  })
);

// POST /api/auth/login  -> verify credentials with bcrypt, return a JWT
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid email or password');
    }

    res.json({ token: signToken(user), user });
  })
);

// GET /api/auth/me  -> protected: current user's profile
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/me  -> protected: update own profile (not role / email)
router.put(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    const { name, rollNo, branch, cgpa, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (name !== undefined) user.name = name;
    if (user.role === 'student') {
      if (rollNo !== undefined) user.rollNo = rollNo;
      if (branch !== undefined) user.branch = branch || undefined;
      if (cgpa !== undefined) user.cgpa = toNumberOrUndefined(cgpa);
    }
    if (password) user.password = password; // re-hashed by the pre-save hook
    await user.save();
    res.json({ user });
  })
);

module.exports = router;
