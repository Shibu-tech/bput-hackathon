const noticeService = require('../services/notice.service');
const pushService = require('../services/push.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new notice
 * @route   POST /api/notices
 * @access  Private (WARDEN, ADMIN)
 */
const createNotice = asyncHandler(async (req, res) => {
  // Add createdBy from authenticated user
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

module.exports = {
  createNotice,
  getNotices
};