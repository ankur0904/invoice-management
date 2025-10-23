const mongoose = require('mongoose');

// Schema to track available serial numbers for reuse
const serialNumberSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    unique: true
  },
  available: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookup of available numbers
serialNumberSchema.index({ available: 1, number: 1 });

module.exports = mongoose.model('SerialNumber', serialNumberSchema);
