const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOtp: String,
  emailVerificationOtpExpiry: Date,
  bio: {
    type: String,
    default: 'Welcome to my profile!',
  },
  profilePictureUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1780&auto=format&fit=crop',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
