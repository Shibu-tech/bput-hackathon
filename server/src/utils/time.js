/**
 * Time utility functions
 */

/**
 * Convert IST time to minutes since midnight
 * @param {Date} date - Date object (defaults to now)
 * @returns {number} - Minutes since midnight in IST timezone
 */
const getISTMinutesSinceMidnight = (date = new Date()) => {
  // IST is UTC+5:30
  const istTime = new Date(date.getTime() + (5 * 60 + 30) * 60000);
  return istTime.getHours() * 60 + istTime.getMinutes();
};

/**
 * Convert minutes since midnight to HH:MM format
 * @param {number} minutesSinceMidnight - Minutes since midnight (0-1439)
 * @returns {string} - Time in HH:MM format
 */
const minutesToTimeString = (minutesSinceMidnight) => {
  const hours = Math.floor(minutesSinceMidnight / 60);
  const minutes = minutesSinceMidnight % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Convert HH:MM format to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Minutes since midnight
 */
const timeStringToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Check if a given time is within working hours (8 AM - 6 PM IST)
 * @param {number} minutesSinceMidnight - Minutes since midnight in IST
 * @returns {boolean} - True if within working hours
 */
const isWorkingHours = (minutesSinceMidnight) => {
  const WORK_START = 8 * 60; // 8:00 AM
  const WORK_END = 18 * 60;  // 6:00 PM
  return minutesSinceMidnight >= WORK_START && minutesSinceMidnight <= WORK_END;
};

module.exports = {
  getISTMinutesSinceMidnight,
  minutesToTimeString,
  timeStringToMinutes,
  isWorkingHours
};