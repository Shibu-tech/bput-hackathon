const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { uploadBufferToSupabase } = require('../services/supabase.service');

/**
 * @desc    Get file / stream from GridFS or redirect to Supabase storage URL
 * @route   GET /api/files/:id
 * @access  Public / Authenticated
 */
const getFileById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // 1. Search if any user has this file ID or Supabase document reference
  let user = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const objId = new mongoose.Types.ObjectId(id);
    user = await User.findOne({
      $or: [
        { _id: objId },
        { offerLetterFileId: objId },
        { offerLetterFileId: id },
        { offerLetter: `/api/files/${id}` },
        { offerLetter: `/api/files/${objId.toString()}` },
      ],
    });
  } else {
    user = await User.findOne({
      $or: [
        { offerLetterFileId: id },
        { offerLetter: `/api/files/${id}` },
      ],
    });
  }

  // 2. If user has an active Supabase / remote URL, redirect immediately
  if (user && user.offerLetter) {
    if (user.offerLetter.startsWith('http://') || user.offerLetter.startsWith('https://')) {
      return res.redirect(user.offerLetter);
    }

    // 3. If offerLetter is stored as base64 data URI
    if (user.offerLetter.startsWith('data:')) {
      const matches = user.offerLetter.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename =
          user.offerLetterFilename ||
          `${user.fullName ? user.fullName.replace(/\s+/g, '_') : 'document'}_Offer_Letter.pdf`;
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length);
        return res.send(buffer);
      }
    }
  }

  // 4. Check GridFS storage (e.g. legacy or other systems saving to MongoDB GridFS)
  const candidateIds = [];
  if (mongoose.Types.ObjectId.isValid(id)) {
    candidateIds.push(new mongoose.Types.ObjectId(id));
  }
  if (user?.offerLetterFileId && mongoose.Types.ObjectId.isValid(user.offerLetterFileId)) {
    const userFileObjId = new mongoose.Types.ObjectId(user.offerLetterFileId);
    if (!candidateIds.some((cid) => cid.equals(userFileObjId))) {
      candidateIds.push(userFileObjId);
    }
  }

  for (const candidateId of candidateIds) {
    for (const bucketName of ['offerLetters', 'fs']) {
      try {
        const filesCol = mongoose.connection.db.collection(`${bucketName}.files`);
        const fileDoc = await filesCol.findOne({ _id: candidateId });
        if (fileDoc) {
          const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
          const downloadStream = bucket.openDownloadStream(candidateId);

          const chunks = [];
          for await (const chunk of downloadStream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          const filename = fileDoc.filename || user?.offerLetterFilename || 'Offer_Letter.pdf';
          const contentType =
            fileDoc.contentType ||
            fileDoc.metadata?.contentType ||
            (filename.toLowerCase().endsWith('.png')
              ? 'image/png'
              : filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')
              ? 'image/jpeg'
              : 'application/pdf');

          // Asynchronously migrate to Supabase Storage in the background so future requests are instantaneous
          uploadBufferToSupabase(filename, buffer, contentType)
            .then(async (uploaded) => {
              if (uploaded?.publicUrl) {
                await User.updateMany(
                  {
                    $or: [
                      { offerLetterFileId: candidateId },
                      { offerLetterFileId: candidateId.toString() },
                      { offerLetter: `/api/files/${candidateId.toString()}` },
                      ...(user ? [{ _id: user._id }] : []),
                    ],
                  },
                  {
                    $set: {
                      offerLetter: uploaded.publicUrl,
                      offerLetterPath: uploaded.path,
                      offerLetterContentType: contentType,
                      offerLetterSize: buffer.length,
                    },
                  }
                );
                console.log(`Auto-migrated GridFS file ${filename} (${candidateId}) to Supabase: ${uploaded.publicUrl}`);
              }
            })
            .catch((e) => {
              console.warn('Supabase auto-migration notice:', e.message);
            });

          res.setHeader('Content-Type', contentType);
          res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
          res.setHeader('Content-Length', buffer.length);
          return res.send(buffer);
        }
      } catch (err) {
        console.warn(`GridFS lookup notice for bucket ${bucketName} with id ${candidateId}:`, err.message);
      }
    }
  }

  throw new ApiError(404, 'File not found. Documents are now hosted directly on Supabase Storage.');
});

module.exports = {
  getFileById,
};
