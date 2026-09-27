const jwt = require('./jwt');

/**
 * Generate a short-lived token for gate pass QR code
 * @param {Object} payload - Data to encode in token (typically { passId })
 * @param {string} expiresIn - Expiration time (e.g., '15m', '1h')
 * @returns {string} - Signed JWT token
 */
const generateToken = (payload, expiresIn = '15m') => {
  return jwt.generateToken(payload, expiresIn);
};

/**
 * Verify a gate pass QR token
 * @param {string} token - The JWT token to verify
 * @returns {Object} - Decoded payload if valid
 * @throws {Error} - If token is invalid
 */
const verifyToken = (token) => {
  return jwt.verifyToken(token);
};

module.exports = {
  generateToken,
  verifyToken
};