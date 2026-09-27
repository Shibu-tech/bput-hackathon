const pushService = require('../services/push.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Subscribe to push notifications
 * @route   POST /api/push/subscribe
 * @access  Private
 */
const subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;

  if (!endpoint || !keys) {
    return res.status(400).json({
      success: false,
      message: 'Endpoint and keys are required'
    });
  }

  const subscription = await pushService.addSubscription(
    req.user._id,
    endpoint,
    keys
  );

  res.json({
    success: true,
    data: subscription
  });
});

module.exports = {
  subscribe
};