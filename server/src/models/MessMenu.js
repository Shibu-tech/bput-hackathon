const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
  menuDate: {
    type: String, // Format: "YYYY-MM-DD"
    required: true
  },
  mealType: {
    type: String,
    enum: ['BREAKFAST', 'LUNCH', 'DINNER'],
    required: true
  },
  items: {
    type: [String],
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Unique index on menuDate and mealType
messMenuSchema.index({ menuDate: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);