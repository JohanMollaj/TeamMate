const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  qualifications: {
    type: String,
    default: ''
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);