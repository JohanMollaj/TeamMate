const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  submissionFiles: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  grade: {
    value: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dateGraded: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);