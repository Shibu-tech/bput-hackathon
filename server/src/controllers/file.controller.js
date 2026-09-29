const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  getFileMetadata,
  openDownloadStream,
} = require('../services/gridfs.service');

/**
 * @desc    Stream file from MongoDB GridFS
 * @route   GET /api/files/:id
 * @access  Public / Authenticated
 */
const getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid file ID format');
  }

  const fileMeta = await getFileMetadata(id);
  if (!fileMeta) {
    throw new ApiError(404, 'File not found in storage');
  }

  const contentType = fileMeta.contentType || fileMeta.metadata?.contentType || 'application/pdf';
  res.set({
    'Content-Type': contentType,
    'Content-Length': fileMeta.length,
    'Content-Disposition': `inline; filename="${encodeURIComponent(fileMeta.filename || 'offer_letter.pdf')}"`,
    'Cache-Control': 'public, max-age=86400',
  });

  const downloadStream = openDownloadStream(id);

  downloadStream.on('error', (err) => {
    console.error('Error streaming file from GridFS:', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Error streaming file' });
    }
  });

  downloadStream.pipe(res);
});

module.exports = {
  getFileById,
};
