const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  buildingName: {
    type: String,
    required: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true,
    min: 0
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Unique index on buildingName, floor, roomNumber
locationSchema.index({ buildingName: 1, floor: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);