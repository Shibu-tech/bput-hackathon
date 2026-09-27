const GatePass = require('../models/GatePass');
const Student = require('../models/User'); // Using User model for students
const { emitToUser } = require('../sockets');
const qrToken = require('../utils/qrToken');
const ApiError = require('../utils/ApiError');

/**
 * Create a new gate pass request with idempotency check
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

  const [exitHours, exitMinutes] = requestedExitTime.split(':').map(Number);
  const [returnHours, returnMinutes] = expectedReturnTime.split(':').map(Number);

  const requestedExitDate = new Date(`${today}T${requestedExitTime}:00.000Z`);
  const expectedReturnDate = new Date(`${today}T${expectedReturnTime}:00.000Z`);

  // Create gate pass
  const gatePass = await GatePass.create({
    clientRequestId,
    studentId,
    hostel,
    reason,
    requestedExitTime: requestedExitDate,
    expectedReturnTime: expectedReturnDate,
    status: 'PENDING'
  });

  return gatePass;
};

/**
 * Update gate pass status (approve/reject)
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

  await gatePass.save();

  // Notify student
  await emitToUser(gatePass.studentId.toString(), 'gate:updated', {
    gatePassId: gatePass._id,
    status: gatePass.status
  });

  return gatePass;
};

/**
 * Get gate pass by ID
 */
const getGatePassById = async (gatePassId) => {
  const gatePass = await GatePass.findById(gatePassId);

  return gatePass;
};

/**
 * Scan gate pass (exit or return)
 * Uses atomic findOneAndUpdate to transition APPROVED -> EXITED -> RETURNED
 */
const scanGatePass = async (passId) => {
  // First try: APPROVED -> EXITED
  let gatePass = await GatePass.findOneAndUpdate(
    {
      _id: passId,
      status: 'APPROVED'
    },
    {
      status: 'EXITED',
      actualExitTime: new Date()
    },
    { new: true }
  );

  // If that didn't match, try: EXITED -> RETURNED
  if (!gatePass) {
    gatePass = await GatePass.findOneAndUpdate(
      {
        _id: passId,
        status: 'EXITED'
      },
      {
        status: 'RETURNED',
        actualReturnTime: new Date()
      },
      { new: true }
    );
  }

  if (!gatePass) {
    throw new ApiError(400, 'Invalid or already-used gate pass');
  }

  // Notify student of status change
  await emitToUser(gatePass.studentId.toString(), 'gate:updated', {
    gatePassId: gatePass._id,
    status: gatePass.status
  });

  return gatePass;
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

module.exports = {
  createGatePass,
  updateGatePass,
  getGatePassById,
  scanGatePass,
  getOverduePasses,
  getGatePasses
};