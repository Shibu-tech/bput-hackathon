const noticeService = require('../services/notice.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (WARDEN, ADMIN, FACULTY)
 */
const createNotice = asyncHandler(async (req, res) => {
  const noticeData = {
    ...req.body,
    createdBy: req.user._id
  };

  const notice = await noticeService.createNotice(noticeData);

  res.status(201).json({
    success: true,
    data: notice
  });
});

/**
 * @desc    Get notices (with role-based filtering)
 * @route   GET /api/notices
 * @access  Private
 */
const getNotices = asyncHandler(async (req, res) => {
  const notices = await noticeService.getNoticesForUser(req.user);

  res.json({
    success: true,
    data: notices
  });
});

/**
 * @desc    Delete a notice
 * @route   DELETE /api/notices/:id
 * @access  Private (Creator, ADMIN)
 */
const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await noticeService.deleteNotice(id, req.user._id, req.user.role);

  res.json({
    success: true,
    message: 'Notice deleted successfully'
  });
});

module.exports = {
  createNotice,
  getNotices,
  deleteNotice
};