const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: [
      'STUDENT',
      'WARDEN',
      'TECHNICIAN',
      'SECURITY',
      'ADMIN',
      'MESS',
      'KIOSK',
      'FACULTY',
      'HOD',
      'ACCOUNTS',
      'EXAM_CELL',
    ],
    required: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  employeeId: {
    type: String,
    trim: true,
  },
  offerLetter: {
    type: String, // Supabase public URL or document URI
  },
  offerLetterPath: {
    type: String, // Supabase Storage object path (e.g. offer-letters/...)
    trim: true,
  },
  offerLetterFileId: {
    type: mongoose.Schema.Types.Mixed, // Legacy fallback
  },
  offerLetterFilename: {
    type: String,
    trim: true,
  },
  offerLetterContentType: {
    type: String,
  },
  offerLetterSize: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'],
    default: 'ACTIVE',
  },
  verificationNotes: {
    type: String,
    trim: true,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: {
    type: Date,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  passwordHash: {
    type: String,
    required: true
  },
  // Student-specific fields
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
  },
  hostel: {
    type: String,
    enum: ['Hostel A', 'Hostel B', 'Hostel C'],
  },
  roomNumber: {
    type: String,
    default: '101',
    trim: true,
  },
  bedLabel: {
    type: String,
    default: 'A',
  },
  batch: {
    type: String,
    // e.g., '2023', '2024', etc.
  },
  // Technician-specific fields
  shifts: [{
    category: {
      type: String,
      enum: ['IT', 'ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'HVAC', 'OTHER']
    },
    startMinute: { // Minutes since midnight (0-1439)
      type: Number,
      min: 0,
      max: 1439
    },
    endMinute: { // Minutes since midnight (0-1439)
      type: Number,
      min: 0,
      max: 1439
    }
  }],
  // Push subscriptions
  pushSubscriptions: [{
    endpoint: {
      type: String,
      required: true
    },
    keys: {
      p256dh: String,
      auth: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ role: 1, hostel: 1, batch: 1 });
userSchema.index({ 'pushSubscriptions.endpoint': 1 });

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.passwordHash && !this.passwordHash.startsWith('$2')) {
    return candidatePassword === this.passwordHash;
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('passwordHash')) return;

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
});

module.exports = mongoose.model('User', userSchema);