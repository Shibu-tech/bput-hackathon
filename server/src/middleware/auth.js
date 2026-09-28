const jwt = require('../utils/jwt');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError(401, 'Access token required');
    }

    const decoded = jwt.verifyToken(token);

    // Find user by id from token
    const user = await User.findById(decoded.userId).select('-passwordHash').populate('locationId');

    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};

module.exports = authenticate;