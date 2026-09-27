const User = require('../models/User');
const jwt = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { registerSchema } = require('../validators/auth.schema');

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  // Find user by phone number
  const user = await User.findOne({ phoneNumber });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate token
  const token = jwt.generateToken({ userId: user._id });

  // Return user info and token
  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber
  };

  res.json({
    success: true,
    data: {
      user: responseUser,
      token
    },
    token,
    user: responseUser
  });
});

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  // Validate input
  const { fullName, phoneNumber, password, role, locationId, hostel, batch, shifts } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber });
  if (existingUser) {
    throw new ApiError(400, 'User with this phone number already exists');
  }

  // Create user object
  const userData = {
    fullName,
    phoneNumber,
    passwordHash: password, // Will be hashed by pre-save hook
    role
  };

  // Add role-specific fields
  if (role === 'STUDENT') {
    if (locationId && require('mongoose').Types.ObjectId.isValid(locationId)) userData.locationId = locationId;
    if (hostel) userData.hostel = hostel;
    if (batch) userData.batch = batch;
  } else if (role === 'TECHNICIAN') {
    if (shifts && Array.isArray(shifts) && shifts.length > 0) userData.shifts = shifts;
  } else if (role === 'WARDEN') {
    if (hostel) userData.hostel = hostel;
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = jwt.generateToken({ userId: user._id });

  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber
  };

  // Return user info and token
  res.status(201).json({
    success: true,
    data: {
      user: responseUser,
      token
    },
    token,
    user: responseUser
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        fullName: req.user.fullName,
        role: req.user.role,
        phoneNumber: req.user.phoneNumber
      }
    }
  });
});

module.exports = {
  login,
  register,
  getMe
};