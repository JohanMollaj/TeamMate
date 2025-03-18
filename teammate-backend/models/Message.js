const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  type: {
    type: String,
    enum: ['direct', 'group'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Ensure either receiver or group is specified
MessageSchema.pre('save', function(next) {
  if ((this.type === 'direct' && !this.receiver) || 
      (this.type === 'group' && !this.group)) {
    return next(new Error('Direct messages need a receiver, group messages need a group'));
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);