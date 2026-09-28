const {
  signQrToken,
  verifyQrToken,
  generateRandomPassCode,
  generateQrDataUrl,
  issueRandomGatePassQr
} = require('./qrGenerator');

/**
 * Generate a short-lived token for gate pass QR code
 * @param {Object} payload - Data to encode in token (typically { passId })
 * @param {string} expiresIn - Expiration time (e.g., '15m', '30m')
 * @returns {string} - Signed JWT token
 */
const generateToken = (payload, expiresIn = '30m') => {
  return signQrToken(payload, expiresIn);
};

/**
 * Verify a gate pass QR token
 * @param {string} token - The JWT token to verify
 * @returns {Object} - Decoded payload if valid
 * @throws {Error} - If token is invalid
 */
const verifyToken = (token) => {
  return verifyQrToken(token);
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomPassCode,
  generateQrDataUrl,
  issueRandomGatePassQr
};