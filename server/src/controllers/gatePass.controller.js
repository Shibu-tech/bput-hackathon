const gatePassService = require('../services/gatePass.service');
const { generateRandomPassCode, generateQrDataUrl, signQrToken } = require('../utils/qrGenerator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const User = require('../models/User');

/**
 * @desc    Create a new gate pass request
 * @route   POST /api/gate-passes
 * @access  Private (STUDENT, WARDEN, ADMIN)
 */
const createGatePass = asyncHandler(async (req, res) => {
  let studentId = req.body.studentId;

  if (!studentId && req.user && req.user.role === 'STUDENT') {
    studentId = req.user._id;
  }

  // If still no studentId, attempt resolving from rollNumber / phone
  if (!studentId && (req.body.rollNumber || req.body.phoneNumber || req.body.parentPhone)) {
    const rawNum = req.body.phoneNumber || req.body.parentPhone || req.body.rollNumber;
    const phone = String(rawNum).replace(/[^0-9]/g, '').slice(-10);
    if (phone) {
      const matched = await User.findOne({ phoneNumber: { $regex: phone } });
      if (matched) studentId = matched._id;
    }
  }

  // Fallback to current user or first student
  if (!studentId) {
    if (req.user && req.user.role === 'STUDENT') {
      studentId = req.user._id;
    } else {
      const anyStudent = await User.findOne({ role: 'STUDENT' });
      studentId = anyStudent ? anyStudent._id : req.user._id;
    }
  }

  const gatePassData = {
    ...req.body,
    studentId
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
 * @desc    Issue a fresh random QR code for a gate pass and update DB
 * @route   POST /api/gate-passes/:id/issue-qr, GET /api/gate-passes/:id/qr
 * @access  Private (STUDENT, WARDEN, ADMIN)
 */
const issueQrCode = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expiresInMinutes = req.query.expiresIn ? parseInt(req.query.expiresIn, 10) : 30;

  const result = await gatePassService.issueGatePassQr(id, req.user, { expiresInMinutes });

  res.json({
    success: true,
    message: 'Random QR code generated and recorded in database',
    data: {
      passId: result.passId,
      qrCode: result.qrCode,
      qrImage: result.qrImage,
      token: result.token,
      issueCount: result.issueCount,
      qrIssuedAt: result.qrIssuedAt,
      qrExpiresAt: result.qrExpiresAt,
      expiresIn: result.expiresIn
    }
  });
});

/**
 * @desc    Generate a standalone random QR code (utility API)
 * @route   POST /api/gate-passes/generate-qr
 * @access  Private
 */
const generateRandomQr = asyncHandler(async (req, res) => {
  const { customPrefix, expiresInMinutes = 30, metadata = {} } = req.body;

  const randomCode = customPrefix
    ? `${customPrefix}-${generateRandomPassCode().replace('GP-', '')}`
    : generateRandomPassCode();

  const token = signQrToken({
    code: randomCode,
    metadata,
    generatedAt: Date.now()
  }, `${expiresInMinutes}m`);

  const qrPayload = JSON.stringify({
    type: 'CAMPUS_PASS',
    code: randomCode,
    token,
    ...metadata
  });

  const qrImage = await generateQrDataUrl(qrPayload);

  res.json({
    success: true,
    data: {
      qrCode: randomCode,
      qrImage,
      token,
      expiresIn: expiresInMinutes * 60,
      generatedAt: new Date()
    }
  });
});

/**
 * @desc    Scan gate pass (exit or return)
 * @route   POST /api/gate-passes/scan
 * @access  Private (SECURITY)
 */
const scanGatePass = asyncHandler(async (req, res) => {
  const { token, qrCode, passCode, scanData } = req.body;

  const input = scanData || token || qrCode || passCode;

  if (!input) {
    throw new ApiError(400, 'QR scan data, token, or pass code is required');
  }

  const gatePass = await gatePassService.scanGatePass(input);

  res.json({
    success: true,
    message: `Pass successfully verified. Status: ${gatePass.status}`,
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

/**
 * @desc    Get gate pass by ID
 * @route   GET /api/gate-passes/:id
 * @access  Private
 */
const getGatePassById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const gatePass = await gatePassService.getGatePassById(id);

  if (!gatePass) {
    throw new ApiError(404, 'Gate pass not found');
  }

  // If student, ensure user is owner
  if (req.user.role === 'STUDENT' && gatePass.studentId?._id?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({
    success: true,
    data: gatePass
  });
});

/**
 * @desc    Delete dummy/mock gate passes from DB
 * @route   DELETE /api/gate-passes/dummy
 * @access  Private (ADMIN, WARDEN)
 */
const deleteDummyPasses = asyncHandler(async (req, res) => {
  const result = await gatePassService.deleteDummyPasses();

  res.json({
    success: true,
    message: `Deleted dummy gate passes from database`,
    deletedCount: result.deletedCount
  });
});

module.exports = {
  createGatePass,
  updateGatePass,
  issueQrCode,
  generateRandomQr,
  scanGatePass,
  getOverduePasses,
  getGatePasses,
  getGatePassById,
  deleteDummyPasses
};