const gatePassService = require('../services/gatePass.service');
const qrToken = require('../utils/qrToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new gate pass request
 * @route   POST /api/gate-passes
 * @access  Private (STUDENT)
 */
const createGatePass = asyncHandler(async (req, res) => {
  // Add studentId from authenticated user
  const gatePassData = {
    ...req.body,
    studentId: req.user._id
  };

  const gatePass = await gatePassService.createGatePass(gatePassData);

  res.status(201).json({
    success: true,
    data: gatePass
  });
});

/**
 * @desc    Update gate pass status (approve/reject)
 * @route   PATCH /api/gate-passes/:id
 * @access  Private (WARDEN)
 */
const updateGatePass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const gatePass = await gatePassService.updateGatePass(
    id,
    { status },
    req.user._id
  );

  res.json({
    success: true,
    data: gatePass
  });
});

/**
 * @desc    Get QR code for gate pass
 * @route   GET /api/gate-passes/:id/qr
 * @access  Private (STUDENT)
 */
const getQrCode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get the gate pass to verify ownership
  const gatePass = await gatePassService.getGatePassById(id);

  // Check if the gate pass belongs to the current user
  if (gatePass.studentId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  // Generate QR token
  const qrTokenData = {
    passId: gatePass._id,
    timestamp: Date.now()
  };

  const token = qrToken.generateToken(qrTokenData, '15m'); // 15 minutes expiry

  res.json({
    success: true,
    data: {
      token,
      expiresIn: 15 * 60 // 15 minutes in seconds
    }
  });
});

/**
 * @desc    Scan gate pass (exit or return)
 * @route   POST /api/gate-passes/scan
 * @access  Private (SECURITY)
 */
const scanGatePass = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, 'QR token is required');
  }

  // Verify token
  const decoded = qrToken.verifyToken(token);
  const { passId } = decoded;

  // Scan the gate pass
  const gatePass = await gatePassService.scanGatePass(passId);

  res.json({
    success: true,
    data: gatePass
  });
});

/**
 * @desc    Get overdue gate passes
 * @route   GET /api/gate-passes/overdue
 * @access  Private (WARDEN)
 */
const getOverduePasses = asyncHandler(async (req, res) => {
  const gatePasses = await gatePassService.getOverduePasses();

  res.json({
    success: true,
    data: gatePasses
  });
});

/**
 * @desc    Get gate passes
 * @route   GET /api/gate-passes
 * @access  Private
 */
const getGatePasses = asyncHandler(async (req, res) => {
  const gatePasses = await gatePassService.getGatePasses(req.user);

  res.json({
    success: true,
    data: gatePasses
  });
});

module.exports = {
  createGatePass,
  updateGatePass,
  getQrCode,
  scanGatePass,
  getOverduePasses,
  getGatePasses
};