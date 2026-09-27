const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

/**
 * Generate a JWT token
 * @param {Object} payload - The payload to sign
 * @param {string} expiresIn - Expiration time (e.g., '7d', '24h')
 * @returns {string} - Signed JWT token
 */
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} - Decoded payload if valid
 * @throws {Error} - If token is invalid
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken
};