const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupImage: {
    type: String,
    default: null
  },
  inviteCode: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Generate a random invite code before saving a new group
GroupSchema.pre('save', function(next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Group', GroupSchema);