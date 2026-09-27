const express = require('express');
const router = express.Router();
const Location = require('../models/Location');

// GET /api/locations
router.get('/', async (req, res, next) => {
  try {
    const locations = await Location.find().sort({ buildingName: 1, floor: 1, roomNumber: 1 });
    res.json({
      success: true,
      data: locations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
