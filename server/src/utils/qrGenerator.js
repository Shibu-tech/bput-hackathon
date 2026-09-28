const crypto = require('crypto');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const QR_SECRET = process.env.QR_TOKEN_SECRET || process.env.JWT_SECRET || 'qr-default-secret-key-fetbox';

/**
 * Generate a cryptographically random, uppercase gate pass code
 * Format: GP-XXXX-XXXX (e.g. GP-A49F-8E2B)
 */
const generateRandomPassCode = () => {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `GP-${part1}-${part2}`;
};

/**
 * Generate a high quality QR Code base64 Data URL (PNG)
 * @param {string} payload - Data string to encode in QR
 * @returns {Promise<string>} - Base64 Data URL image string
 */
const generateQrDataUrl = async (payload) => {
  return await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    margin: 2,
    scale: 6,
    color: {
      dark: '#0f172a', // Slate 900
      light: '#ffffff'
    }
  });
};

/**
 * Generate a signed JWT token containing random QR verification claims
 */
const signQrToken = (payload, expiresIn = '30m') => {
  return jwt.sign(payload, QR_SECRET, { expiresIn });
};

/**
 * Verify a signed QR token
 */
const verifyQrToken = (token) => {
  return jwt.verify(token, QR_SECRET);
};

/**
 * Issue a brand-new random QR code for a gate pass and update MongoDB
 * @param {Object} gatePass - Mongoose GatePass document
 * @param {string|mongoose.Types.ObjectId} issuedBy - User ID issuing the QR code
 * @param {Object} options - Options such as custom expiresInMinutes
 * @returns {Promise<Object>} - Issue details including random code, image, and token
 */
const issueRandomGatePassQr = async (gatePass, issuedBy = null, options = {}) => {
  const expiresInMinutes = options.expiresInMinutes || 30; // 30 minutes default validity
  const qrCode = generateRandomPassCode();
  const issueCount = (gatePass.issueCount || 0) + 1;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

  // Sign verification token
  const token = signQrToken({
    passId: gatePass._id.toString(),
    studentId: gatePass.studentId.toString(),
    qrCode,
    issueCount,
    nonce: crypto.randomBytes(4).toString('hex')
  }, `${expiresInMinutes}m`);

  // QR Payload embedded into visual QR: JSON payload containing pass details & verification token
  const qrDataPayload = JSON.stringify({
    type: 'GATE_PASS',
    passId: gatePass._id.toString(),
    qrCode,
    token
  });

  // Generate visual QR image
  const qrImage = await generateQrDataUrl(qrDataPayload);

  // Update DB on each issue of gate pass
  gatePass.qrCode = qrCode;
  gatePass.qrImage = qrImage;
  gatePass.qrToken = token;
  gatePass.qrIssuedAt = now;
  gatePass.qrExpiresAt = expiresAt;
  gatePass.issueCount = issueCount;

  if (!Array.isArray(gatePass.issueHistory)) {
    gatePass.issueHistory = [];
  }

  gatePass.issueHistory.push({
    qrCode,
    issuedAt: now,
    issuedBy: issuedBy || gatePass.studentId,
    expiresAt
  });

  await gatePass.save();

  return {
    passId: gatePass._id,
    qrCode,
    qrImage,
    token,
    issueCount,
    qrIssuedAt: now,
    qrExpiresAt: expiresAt,
    expiresIn: expiresInMinutes * 60
  };
};

module.exports = {
  generateRandomPassCode,
  generateQrDataUrl,
  signQrToken,
  verifyQrToken,
  issueRandomGatePassQr
};
