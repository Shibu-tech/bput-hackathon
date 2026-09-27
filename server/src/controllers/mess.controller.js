const messService = require('../services/mess.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Set mess menu for a date and meal type
 * @route   PUT /api/mess/:date/:meal
 * @access  Private (WARDEN)
 */
const setMenu = asyncHandler(async (req, res) => {
  const { date, meal } = req.params;
  const { items } = req.body;

  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ApiError(400, 'Invalid date format. Use YYYY-MM-DD');
  }

  // Validate meal type
  const validMeals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  if (!validMeals.includes(meal)) {
    throw new ApiError(400, 'Invalid meal type. Use BREAKFAST, LUNCH, or DINNER');
  }

  const menu = await messService.setMenu(date, meal, items, req.user._id);

  res.json({
    success: true,
    data: menu
  });
});

/**
 * @desc    Get today's mess menu
 * @route   GET /api/mess/today
 * @access  Private
 */
const getTodayMenu = asyncHandler(async (req, res) => {
  const menu = await messService.getTodayMenu();

  res.json({
    success: true,
    data: menu || null
  });
});

module.exports = {
  setMenu,
  getTodayMenu
};