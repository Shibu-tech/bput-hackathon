const User = require('../models/User');
const jwt = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { uploadBase64ToSupabase } = require('../services/supabase.service');

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
  const user = await User.findOne({ phoneNumber: trimmedPhone }).populate('locationId');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check verification status for staff accounts (auto-activate FACULTY & HOD)
  if (user.status === 'PENDING') {
    if (user.role === 'FACULTY' || user.role === 'HOD') {
      user.status = 'ACTIVE';
      await user.save();
    } else {
      throw new ApiError(403, 'Your staff registration is pending Super Admin verification. You will be able to sign in once approved.');
    }
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
    department: user.department || 'Computer Science & Engineering',
    cabin: user.cabin || 'Academic Block B, Room 304',
    officeHours: user.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
    bio: user.bio || '',
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
    offerLetterName,
    locationId,
    hostel,
    roomNumber,
    batch,
    shifts,
    department,
    cabin,
    officeHours,
    bio,
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

  // Check if staff registration needs pending verification (Faculty & HOD accounts are immediately active)
  const isStaffRole = !['STUDENT', 'ADMIN', 'KIOSK', 'FACULTY', 'HOD'].includes(role);
  const initialStatus = isStaffRole ? 'PENDING' : 'ACTIVE';

  // Create user object
  const userData = {
    fullName,
    phoneNumber: trimmedPhone,
    passwordHash: password, // Will be hashed by pre-save hook
    role,
    status: initialStatus,
  };

  if (email) userData.email = email.trim().toLowerCase();
  if (designation) userData.designation = designation.trim();
  if (employeeId) userData.employeeId = employeeId.trim();
  if (department) userData.department = department.trim();
  if (cabin) userData.cabin = cabin.trim();
  if (officeHours) userData.officeHours = officeHours.trim();
  if (bio) userData.bio = bio.trim();

  // If offer letter is provided, upload directly into Supabase Storage
  if (offerLetter) {
    if (typeof offerLetter === 'string' && (offerLetter.startsWith('data:') || offerLetter.length > 200)) {
      try {
        let ext = '.pdf';
        if (offerLetter.startsWith('data:image/png')) ext = '.png';
        else if (offerLetter.startsWith('data:image/jpeg') || offerLetter.startsWith('data:image/jpg')) ext = '.jpg';
        else if (offerLetterName && offerLetterName.includes('.')) {
          ext = '.' + offerLetterName.split('.').pop();
        }

        const safePrefix = (fullName || 'Staff').replace(/[^a-zA-Z0-9]/g, '_');
        const cleanFilename = offerLetterName
          ? offerLetterName.replace(/[^a-zA-Z0-9._-]/g, '_')
          : `${safePrefix}_Offer_Letter${ext}`;

        const supabaseFile = await uploadBase64ToSupabase(cleanFilename, offerLetter, {
          candidateName: fullName,
          phoneNumber: trimmedPhone,
          employeeId: employeeId || '',
          role,
        });

        // Store direct public URL from Supabase
        userData.offerLetter = supabaseFile.publicUrl;
        userData.offerLetterPath = supabaseFile.path;
        userData.offerLetterFilename = supabaseFile.filename;
        userData.offerLetterContentType = supabaseFile.contentType;
        userData.offerLetterSize = supabaseFile.size;
        console.log(`Document successfully uploaded to Supabase Storage: ${supabaseFile.publicUrl}`);
      } catch (uploadErr) {
        console.error('Supabase storage upload error:', uploadErr.message);
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
    offerLetter: user.offerLetter || '',
    offerLetterUrl: user.offerLetter || '',
    offerLetterName: user.offerLetterFilename || `${user.fullName.replace(/\s+/g, '_')}_Offer_Letter.pdf`,
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
  const user = await User.findById(req.user._id).populate('locationId');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        email: user.email || '',
        designation: user.designation || '',
        employeeId: user.employeeId || '',
        department: user.department || 'Computer Science & Engineering',
        cabin: user.cabin || 'Academic Block B, Room 304',
        officeHours: user.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
        bio: user.bio || '',
        status: user.status || 'ACTIVE',
        hostel: user.hostel || user.locationId?.buildingName || '',
        roomNumber: user.roomNumber || user.locationId?.roomNumber || '',
        batch: user.batch || ''
      }
    }
  });
});

/**
 * @desc    Update user profile (Faculty, Staff, Student)
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, email, designation, department, cabin, officeHours, bio } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (fullName !== undefined) user.fullName = fullName.trim();
  if (email !== undefined) user.email = email.trim().toLowerCase();
  if (designation !== undefined) user.designation = designation.trim();
  if (department !== undefined) user.department = department.trim();
  if (cabin !== undefined) user.cabin = cabin.trim();
  if (officeHours !== undefined) user.officeHours = officeHours.trim();
  if (bio !== undefined) user.bio = bio.trim();

  await user.save();

  const responseUser = {
    id: user._id,
    fullName: user.fullName,
    role: user.role,
    phoneNumber: user.phoneNumber,
    email: user.email || '',
    designation: user.designation || '',
    employeeId: user.employeeId || '',
    department: user.department || '',
    cabin: user.cabin || '',
    officeHours: user.officeHours || '',
    bio: user.bio || '',
    status: user.status || 'ACTIVE',
    hostel: user.hostel || '',
    roomNumber: user.roomNumber || '',
    batch: user.batch || ''
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: responseUser },
    user: responseUser
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
    data: requests.map((u) => {
      let docUrl = u.offerLetter || '';
      if (!docUrl && u.offerLetterFileId) {
        docUrl = `/api/files/${u.offerLetterFileId.toString()}`;
      } else if (!docUrl) {
        docUrl = `/api/files/${u._id.toString()}`;
      }

      return {
        id: u._id.toString(),
        fullName: u.fullName,
        email: u.email || '',
        phoneNumber: u.phoneNumber,
        role: u.role,
        designation: u.designation || '',
        employeeId: u.employeeId || '',
        offerLetter: docUrl,
        offerLetterUrl: docUrl,
        offerLetterName: u.offerLetterFilename || `${u.fullName.replace(/\s+/g, '_')}_Offer_Letter.pdf`,
        offerLetterPath: u.offerLetterPath || '',
        offerLetterContentType: u.offerLetterContentType || 'application/pdf',
        offerLetterSize: u.offerLetterSize || 0,
        offerLetterFileId: u.offerLetterFileId ? u.offerLetterFileId.toString() : null,
        status: u.status || 'PENDING',
        verificationNotes: u.verificationNotes || '',
        verifiedAt: u.verifiedAt,
        verifiedBy: u.verifiedBy?.fullName,
        createdAt: u.createdAt,
      };
    })
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
  updateProfile,
  updateRoom,
  getStaffRequests,
  verifyStaffRequest
};