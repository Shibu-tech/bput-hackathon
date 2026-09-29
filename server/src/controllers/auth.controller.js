const User = require('../models/User');
const jwt = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { registerSchema } = require('../validators/auth.schema');
const { uploadBase64ToGridFS } = require('../services/gridfs.service');

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { phoneNumber, password } = req.body;

  const trimmedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
  if (!trimmedPhone || !/^\d{10}$/.test(trimmedPhone)) {
    throw new ApiError(400, 'Phone number must be exactly 10 digits');
  }

  // Find user by phone number
  const user = await User.findOne({ phoneNumber }).populate('locationId');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check verification status for staff accounts
  if (user.status === 'PENDING') {
    throw new ApiError(403, 'Your staff registration is pending Super Admin verification. You will be able to sign in once approved.');
  }

  if (user.status === 'REJECTED') {
    throw new ApiError(403, 'Your staff registration request has been rejected by the Super Admin.');
  }

  // Generate token
  const token = jwt.generateToken({ userId: user._id });

  // Return user info and token
  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    email: user.email || '',
    designation: user.designation || '',
    employeeId: user.employeeId || '',
    status: user.status || 'ACTIVE',
    hostel: user.hostel || user.locationId?.buildingName || '',
    roomNumber: user.roomNumber || user.locationId?.roomNumber || '',
    batch: user.batch || ''
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
  const {
    fullName,
    phoneNumber,
    password,
    role,
    email,
    designation,
    employeeId,
    offerLetter,
    locationId,
    hostel,
    roomNumber,
    batch,
    shifts
  } = req.body;

  const trimmedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
  if (!trimmedPhone || !/^\d{10}$/.test(trimmedPhone)) {
    throw new ApiError(400, 'Phone number must be exactly 10 digits');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ phoneNumber: trimmedPhone });
  if (existingUser) {
    throw new ApiError(400, 'User with this phone number already exists');
  }

  // Check if staff registration needs pending verification
  const isStaffRole = !['STUDENT', 'ADMIN', 'KIOSK'].includes(role);
  const initialStatus = isStaffRole ? 'PENDING' : 'ACTIVE';

  // Create user object
  const userData = {
    fullName,
    phoneNumber,
    passwordHash: password, // Will be hashed by pre-save hook
    role,
    status: initialStatus,
  };

  if (email) userData.email = email.trim().toLowerCase();
  if (designation) userData.designation = designation.trim();
  if (employeeId) userData.employeeId = employeeId.trim();

  // If offer letter is provided, upload directly into MongoDB GridFS
  if (offerLetter) {
    if (typeof offerLetter === 'string' && (offerLetter.startsWith('data:') || offerLetter.length > 200)) {
      try {
        const cleanFilename = `${(fullName || 'Staff').replace(/[^a-zA-Z0-9]/g, '_')}_Offer_Letter.pdf`;
        const gridfsFile = await uploadBase64ToGridFS(cleanFilename, offerLetter, {
          candidateName: fullName,
          phoneNumber: trimmedPhone,
          employeeId: employeeId || '',
          role,
        });

        userData.offerLetterFileId = gridfsFile.fileId;
        userData.offerLetter = `/api/files/${gridfsFile.fileId}`;
        userData.offerLetterFilename = gridfsFile.filename;
        userData.offerLetterContentType = gridfsFile.contentType;
        userData.offerLetterSize = gridfsFile.length;
      } catch (gridfsErr) {
        console.warn('GridFS storage warning (falling back to direct URI):', gridfsErr.message);
        userData.offerLetter = offerLetter;
      }
    } else {
      userData.offerLetter = offerLetter;
    }
  }

  // Add role-specific fields
  if (role === 'STUDENT') {
    if (locationId && require('mongoose').Types.ObjectId.isValid(locationId)) userData.locationId = locationId;
    if (hostel) userData.hostel = hostel;
    if (roomNumber) userData.roomNumber = roomNumber;
    if (batch) userData.batch = batch;
  } else if (role === 'TECHNICIAN') {
    if (shifts && Array.isArray(shifts) && shifts.length > 0) userData.shifts = shifts;
  } else if (role === 'WARDEN') {
    if (hostel) userData.hostel = hostel;
  }

  // Create user
  const user = await User.create(userData);
  const populatedUser = await User.findById(user._id).populate('locationId');

  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    email: user.email || '',
    designation: user.designation || '',
    employeeId: user.employeeId || '',
    status: user.status,
    hostel: user.hostel || populatedUser?.locationId?.buildingName || '',
    roomNumber: user.roomNumber || populatedUser?.locationId?.roomNumber || '',
    batch: user.batch || ''
  };

  // If staff, return pending response without active login session token
  if (isStaffRole) {
    return res.status(201).json({
      success: true,
      isPending: true,
      message: 'Staff registration submitted successfully. Awaiting Super Admin verification.',
      data: {
        user: responseUser,
      },
      user: responseUser,
    });
  }

  // Generate token for non-pending users (e.g. students or admins)
  const token = jwt.generateToken({ userId: user._id });

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
        phoneNumber: req.user.phoneNumber,
        hostel: req.user.hostel || req.user.locationId?.buildingName || '',
        roomNumber: req.user.roomNumber || req.user.locationId?.roomNumber || '',
        batch: req.user.batch || ''
      }
    }
  });
});

/**
 * @desc    Update student assigned room
 * @route   PATCH /api/auth/room
 * @access  Private
 */
const updateRoom = asyncHandler(async (req, res) => {
  const { hostel, roomNumber, bedLabel } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (hostel) user.hostel = hostel;
  if (roomNumber) user.roomNumber = roomNumber;
  if (bedLabel) user.bedLabel = bedLabel;

  await user.save();

  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    hostel: user.hostel,
    roomNumber: user.roomNumber,
    bedLabel: user.bedLabel || 'A'
  };

  res.json({
    success: true,
    data: { user: responseUser },
    user: responseUser
  });
});

/**
 * @desc    Get all staff registration requests (Super Admin)
 * @route   GET /api/auth/staff-requests
 * @access  Private (Super Admin)
 */
const getStaffRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {
    $or: [
      { employeeId: { $exists: true, $ne: '' } },
      { role: { $in: ['FACULTY', 'HOD', 'ACCOUNTS', 'EXAM_CELL', 'WARDEN', 'MESS', 'TECHNICIAN', 'SECURITY'] } }
    ]
  };

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const requests = await User.find(filter)
    .populate('verifiedBy', 'fullName role')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: requests.length,
    data: requests.map((u) => ({
      id: u._id.toString(),
      fullName: u.fullName,
      email: u.email || '',
      phoneNumber: u.phoneNumber,
      role: u.role,
      designation: u.designation || '',
      employeeId: u.employeeId || '',
      offerLetter: u.offerLetter || (u.offerLetterFileId ? `/api/files/${u.offerLetterFileId}` : ''),
      offerLetterName: u.offerLetterFilename || `${u.fullName.replace(/\s+/g, '_')}_Offer_Letter.pdf`,
      offerLetterFileId: u.offerLetterFileId ? u.offerLetterFileId.toString() : null,
      status: u.status || 'PENDING',
      verificationNotes: u.verificationNotes || '',
      verifiedAt: u.verifiedAt,
      verifiedBy: u.verifiedBy?.fullName,
      createdAt: u.createdAt,
    }))
  });
});

/**
 * @desc    Verify/Approve/Reject staff registration request
 * @route   PATCH /api/auth/staff-requests/:id/verify
 * @access  Private (Super Admin)
 */
const verifyStaffRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be APPROVED or REJECTED');
  }

  const staffUser = await User.findById(id);
  if (!staffUser) {
    throw new ApiError(404, 'Staff registration request not found');
  }

  staffUser.status = status;
  if (notes !== undefined) staffUser.verificationNotes = notes;
  staffUser.verifiedBy = req.user?._id;
  staffUser.verifiedAt = new Date();

  await staffUser.save();

  res.json({
    success: true,
    message: `Staff member successfully ${status === 'APPROVED' ? 'approved' : 'rejected'}.`,
    data: {
      id: staffUser._id.toString(),
      fullName: staffUser.fullName,
      role: staffUser.role,
      status: staffUser.status,
      verificationNotes: staffUser.verificationNotes,
      verifiedAt: staffUser.verifiedAt
    }
  });
});

module.exports = {
  login,
  register,
  getMe,
  updateRoom,
  getStaffRequests,
  verifyStaffRequest
};