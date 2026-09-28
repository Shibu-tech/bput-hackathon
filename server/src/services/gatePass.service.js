const GatePass = require('../models/GatePass');
const User = require('../models/User');
const { emitToUser, emitToRole } = require('../sockets');
const {
  issueRandomGatePassQr,
  generateRandomPassCode,
  verifyQrToken,
  generateQrDataUrl
} = require('../utils/qrGenerator');
const ApiError = require('../utils/ApiError');

/**
 * Create a new gate pass request with idempotency check
 * Automatically issues an initial random QR code and updates the DB
 */
const createGatePass = async (gatePassData) => {
  const {
    clientRequestId,
    studentId,
    hostel,
    reason,
    requestedExitTime,
    expectedReturnTime
  } = gatePassData;

  // 1. Check if gate pass with clientRequestId already exists (idempotency)
  if (clientRequestId) {
    const existingGatePass = await GatePass.findOne({ clientRequestId });
    if (existingGatePass) {
      return existingGatePass;
    }
  }

  // Convert time strings to Date objects for today
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const requestedExitDate = new Date(`${today}T${requestedExitTime}:00.000Z`);
  let expectedReturnDate = new Date(`${today}T${expectedReturnTime}:00.000Z`);

  // If return time is earlier than or equal to exit time (past midnight curfew, e.g. 21:00 -> 00:30), advance to next day
  if (expectedReturnDate <= requestedExitDate) {
    expectedReturnDate = new Date(expectedReturnDate.getTime() + 24 * 60 * 60 * 1000);
  }

  // Create gate pass in PENDING status
  const gatePass = new GatePass({
    clientRequestId,
    studentId,
    hostel,
    reason,
    requestedExitTime: requestedExitDate,
    expectedReturnTime: expectedReturnDate,
    status: 'PENDING'
  });

  // Generate initial random QR code and update DB on issue
  await issueRandomGatePassQr(gatePass, studentId, { expiresInMinutes: 60 });

  return gatePass;
};

/**
 * Issue / re-issue a brand new random QR code for a gate pass and update DB
 * @param {string} gatePassId - ID of the gate pass
 * @param {Object} user - The requesting user (STUDENT, WARDEN, or ADMIN)
 * @param {Object} options - Custom options (e.g. expiresInMinutes)
 */
const issueGatePassQr = async (gatePassId, user, options = {}) => {
  const gatePass = await GatePass.findById(gatePassId);

  if (!gatePass) {
    throw new ApiError(404, 'Gate pass not found');
  }

  // If user is student, verify ownership
  if (user && user.role === 'STUDENT' && gatePass.studentId.toString() !== user._id.toString()) {
    throw new ApiError(403, 'Access denied: You can only issue QR codes for your own gate pass');
  }

  // Check if pass is already terminated
  if (gatePass.status === 'REJECTED') {
    throw new ApiError(400, 'Cannot issue QR code for a rejected gate pass');
  }
  if (gatePass.status === 'RETURNED') {
    throw new ApiError(400, 'Cannot issue QR code for an already completed gate pass');
  }
  if (gatePass.status === 'EXPIRED') {
    throw new ApiError(400, 'Cannot issue QR code for an expired gate pass');
  }

  // Generate random QR code, QR image, token, and update MongoDB
  const issueResult = await issueRandomGatePassQr(gatePass, user ? user._id : null, options);

  // Notify student via socket
  await emitToUser(gatePass.studentId.toString(), 'gate:qr-issued', {
    gatePassId: gatePass._id,
    qrCode: issueResult.qrCode,
    issueCount: issueResult.issueCount,
    expiresAt: issueResult.qrExpiresAt
  });

  return {
    ...issueResult,
    gatePass
  };
};

/**
 * Update gate pass status (approve/reject)
 * When approved, issues a fresh random QR code and updates DB
 */
const updateGatePass = async (gatePassId, statusUpdate, approvedBy) => {
  const gatePass = await GatePass.findById(gatePassId);

  if (!gatePass) {
    throw new ApiError(404, 'Gate pass not found');
  }

  // Update status
  gatePass.status = statusUpdate.status;

  if (statusUpdate.status === 'APPROVED' || statusUpdate.status === 'REJECTED') {
    gatePass.approvedBy = approvedBy;
  }

  // If approved, issue fresh random QR code and update DB
  if (statusUpdate.status === 'APPROVED') {
    await issueRandomGatePassQr(gatePass, approvedBy, { expiresInMinutes: 60 });
  } else {
    await gatePass.save();
  }

  // Notify student
  await emitToUser(gatePass.studentId.toString(), 'gate:updated', {
    gatePassId: gatePass._id,
    status: gatePass.status,
    qrCode: gatePass.qrCode,
    qrImage: gatePass.qrImage
  });

  return gatePass;
};

/**
 * Get gate pass by ID
 */
const getGatePassById = async (gatePassId) => {
  const gatePass = await GatePass.findById(gatePassId)
    .populate('studentId', 'fullName role phoneNumber hostel batch')
    .populate('approvedBy', 'fullName role');

  return gatePass;
};

/**
 * Scan gate pass (exit or return)
 * Supports scanning raw random QR code, signed token, or parsed JSON payload
 */
const scanGatePass = async (scanInput) => {
  let passId = null;
  let codeToMatch = null;

  // 1. Determine input format
  if (typeof scanInput === 'object' && scanInput !== null) {
    if (scanInput.token) {
      try {
        const decoded = verifyQrToken(scanInput.token);
        passId = decoded.passId;
        codeToMatch = decoded.qrCode;
      } catch (err) {
        throw new ApiError(400, 'Invalid or expired QR token');
      }
    } else if (scanInput.passId || scanInput.qrCode) {
      passId = scanInput.passId;
      codeToMatch = scanInput.qrCode;
    }
  } else if (typeof scanInput === 'string') {
    const trimmed = scanInput.trim();

    // Check if it's JSON string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.token) {
          const decoded = verifyQrToken(parsed.token);
          passId = decoded.passId;
          codeToMatch = decoded.qrCode;
        } else {
          passId = parsed.passId;
          codeToMatch = parsed.qrCode;
        }
      } catch {
        // Not valid JSON, continue
      }
    }

    // Check if it's a JWT token
    if (!passId && trimmed.split('.').length === 3) {
      try {
        const decoded = verifyQrToken(trimmed);
        passId = decoded.passId;
        codeToMatch = decoded.qrCode;
      } catch {
        throw new ApiError(400, 'Invalid or expired QR token');
      }
    }

    // Check if it's a raw QR Code string e.g. "GP-XXXX-XXXX"
    if (!passId && !codeToMatch) {
      codeToMatch = trimmed.toUpperCase();
    }
  }

  // 2. Find gate pass in DB
  let gatePass = null;
  if (passId) {
    gatePass = await GatePass.findById(passId);
  } else if (codeToMatch) {
    gatePass = await GatePass.findOne({ qrCode: codeToMatch });
  }

  if (!gatePass) {
    throw new ApiError(404, 'Gate pass not found in database');
  }

  // 3. Verify random QR code matches the currently active issue in the DB
  if (codeToMatch && gatePass.qrCode && gatePass.qrCode.toUpperCase() !== codeToMatch.toUpperCase()) {
    throw new ApiError(400, 'This QR code has been superseded by a newer issue. Please present the latest QR code.');
  }

  // 4. Check QR code expiration
  if (gatePass.qrExpiresAt && new Date() > gatePass.qrExpiresAt && gatePass.status === 'APPROVED') {
    throw new ApiError(400, 'This QR code has expired. Please re-issue a new QR code.');
  }

  // 5. Atomic state transitions
  if (gatePass.status === 'APPROVED') {
    gatePass.status = 'EXITED';
    gatePass.actualExitTime = new Date();
    await gatePass.save();
  } else if (gatePass.status === 'EXITED') {
    gatePass.status = 'RETURNED';
    gatePass.actualReturnTime = new Date();
    await gatePass.save();
  } else if (gatePass.status === 'PENDING') {
    throw new ApiError(400, 'Gate pass is still pending warden approval');
  } else if (gatePass.status === 'REJECTED') {
    throw new ApiError(400, 'Gate pass was rejected by warden');
  } else if (gatePass.status === 'RETURNED') {
    throw new ApiError(400, 'Gate pass has already been used and student has returned');
  } else if (gatePass.status === 'EXPIRED') {
    throw new ApiError(400, 'Gate pass has expired');
  } else {
    throw new ApiError(400, `Cannot scan pass with status: ${gatePass.status}`);
  }

  // Notify student & security terminals
  await emitToUser(gatePass.studentId.toString(), 'gate:updated', {
    gatePassId: gatePass._id,
    status: gatePass.status,
    actualExitTime: gatePass.actualExitTime,
    actualReturnTime: gatePass.actualReturnTime
  });

  return await GatePass.findById(gatePass._id)
    .populate('studentId', 'fullName role phoneNumber hostel batch')
    .populate('approvedBy', 'fullName role');
};

/**
 * Get overdue gate passes (APPROVED past expectedReturnTime with no exit scan)
 */
const getOverduePasses = async () => {
  const now = new Date();

  const overduePasses = await GatePass.find({
    status: 'APPROVED',
    expectedReturnTime: { $lt: now }
  })
  .populate('studentId', 'fullName role phoneNumber hostel batch')
  .populate('approvedBy', 'fullName role');

  return overduePasses;
};

/**
 * Get gate passes based on user role
 */
const getGatePasses = async (user) => {
  let query = {};
  if (user && user.role === 'STUDENT') {
    query.studentId = user._id;
  }
  return GatePass.find(query)
    .populate('studentId', 'fullName role phoneNumber hostel batch')
    .populate('approvedBy', 'fullName role')
    .sort({ createdAt: -1 });
};

/**
 * Delete dummy or mock gate passes from database
 */
const deleteDummyPasses = async () => {
  // Delete passes that have clientRequestId or reasons indicating test/dummy passes, or delete all mock passes
  const result = await GatePass.deleteMany({
    $or: [
      { reason: { $regex: /dummy|mock|test/i } },
      { clientRequestId: { $regex: /dummy|mock|test/i } }
    ]
  });
  return result;
};

module.exports = {
  createGatePass,
  issueGatePassQr,
  updateGatePass,
  getGatePassById,
  scanGatePass,
  getOverduePasses,
  getGatePasses,
  deleteDummyPasses
};