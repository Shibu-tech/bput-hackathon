const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

/**
 * @desc    Get file / redirect to Supabase storage URL
 * @route   GET /api/files/:id
 * @access  Public / Authenticated
 */
const getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Search if any user has this file ID or Supabase document reference
  let user = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const objId = new mongoose.Types.ObjectId(id);
    user = await User.findOne({
      $or: [
        { _id: objId },
        { offerLetterFileId: objId },
        { offerLetterFileId: id },
      ],
    });
  }

  if (user && user.offerLetter) {
    if (user.offerLetter.startsWith('http://') || user.offerLetter.startsWith('https://')) {
      return res.redirect(user.offerLetter);
    }
  }

  throw new ApiError(404, 'File not found. Documents are now hosted directly on Supabase Storage.');
});

module.exports = {
  getFileById,
};
