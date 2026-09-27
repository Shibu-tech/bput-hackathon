const MessMenu = require('../models/MessMenu');
const User = require('../models/User');
const cacheService = require('./cache.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Set mess menu for a date and meal type (upsert)
 */
const setMenu = async (date, mealType, items, updatedById) => {
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  // Validate meal type
  const validMeals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  if (!validMeals.includes(mealType)) {
    throw new Error('Invalid meal type. Use BREAKFAST, LUNCH, or DINNER');
  }

  // Validate items is an array of strings
  if (!Array.isArray(items) || !items.every(item => typeof item === 'string')) {
    throw new Error('Items must be an array of strings');
  }

  // Find the user who is updating
  const updatedBy = await User.findById(updatedById);
  if (!updatedBy) {
    throw new Error('User not found');
  }

  // Upsert the mess menu
  const messMenu = await MessMenu.findOneAndUpdate(
    {
      menuDate: date,
      mealType: mealType
    },
    {
      menuDate: date,
      mealType: mealType,
      items: items,
      updatedBy: updatedById
    },
    {
      upsert: true,
      new: true
    }
  );

  // Update cache
  const cacheKey = `menu_${date}_${mealType}`;
  cacheService.set(cacheKey, messMenu, 24 * 60 * 60); // Cache for 24 hours

  return messMenu;
};

/**
 * Get mess menu by date and meal type
 */
const getMenuByDate = async (date, mealType) => {
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }

  // Validate meal type
  const validMeals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  if (!validMeals.includes(mealType)) {
    throw new Error('Invalid meal type. Use BREAKFAST, LUNCH, or DINNER');
  }

  // Try to get from cache first
  const cacheKey = `menu_${date}_${mealType}`;
  const cachedMenu = cacheService.get(cacheKey);
  if (cachedMenu) {
    return cachedMenu;
  }

  // If not in cache, get from database
  const messMenu = await MessMenu.findOne({
    menuDate: date,
    mealType: mealType
  }).populate('updatedBy', 'fullName role');

  // Cache the result if found
  if (messMenu) {
    cacheService.set(cacheKey, messMenu, 24 * 60 * 60); // Cache for 24 hours
  }

  return messMenu;
};

/**
 * Get today's mess menu for all meal types
 */
const getTodayMenu = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const meals = ['BREAKFAST', 'LUNCH', 'DINNER'];
  const menu = {};

  for (const meal of meals) {
    const mealMenu = await getMenuByDate(today, meal);
    menu[meal] = mealMenu || null;
  }

  return menu;
};

module.exports = {
  setMenu,
  getMenuByDate,
  getTodayMenu
};