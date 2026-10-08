const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Upload new study note / material
 * @route   POST /api/notes
 * @access  Private (FACULTY, ADMIN, HOD)
 */
const createNote = asyncHandler(async (req, res) => {
  const {
    title,
    subject,
    description = '',
    batch = 'ALL',
    semester = 'All Semesters',
    category = 'Lecture Notes',
    fileUrl,
    fileName,
    fileSize = '1.0 MB',
    fileType = 'application/pdf'
  } = req.body;

  if (!title || !subject || !fileUrl || !fileName) {
    throw new ApiError(400, 'Title, Subject, File, and File Name are required');
  }

  const note = await Note.create({
    title,
    subject,
    description,
    batch,
    semester,
    category,
    fileUrl,
    fileName,
    fileSize,
    fileType,
    uploadedBy: req.user._id
  });

  const populated = await Note.findById(note._id)
    .populate('uploadedBy', 'fullName role designation email department');

  res.status(201).json({
    success: true,
    message: 'Study notes uploaded successfully',
    data: populated
  });
});

/**
 * @desc    Get all study notes with filtering
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = asyncHandler(async (req, res) => {
  const { subject, batch, category, search } = req.query;
  const filter = {};

  if (subject) filter.subject = { $regex: subject, $options: 'i' };
  if (category && category !== 'ALL') filter.category = category;
  if (batch && batch !== 'ALL') {
    filter.batch = { $in: [batch, 'ALL'] };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { fileName: { $regex: search, $options: 'i' } }
    ];
  }

  const notes = await Note.find(filter)
    .populate('uploadedBy', 'fullName role designation department')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: notes.length,
    data: notes
  });
});

/**
 * @desc    Get single note by ID and increment download counter
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Note.findByIdAndUpdate(
    id,
    { $inc: { downloadsCount: 1 } },
    { new: true }
  ).populate('uploadedBy', 'fullName role designation department email');

  if (!note) {
    throw new ApiError(404, 'Study note not found');
  }

  res.json({
    success: true,
    data: note
  });
});

/**
 * @desc    Delete study note
 * @route   DELETE /api/notes/:id
 * @access  Private (FACULTY, ADMIN)
 */
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id);

  if (!note) {
    throw new ApiError(404, 'Note not found');
  }

  if (req.user.role !== 'ADMIN' && note.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Unauthorized to delete this study note');
  }

  await Note.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Study note deleted successfully'
  });
});

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  deleteNote
};
