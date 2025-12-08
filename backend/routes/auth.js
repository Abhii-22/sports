const express = require('express');
const router = express.Router();
const { 
  signUp, 
  signIn, 
  verifyEmail, 
  resendVerificationOtp 
} = require('../controllers/authController');

// @route   POST api/auth/signup
// @desc    Register a user
// @access  Public
// Sign-up route
router.post('/signup', signUp);

// @route   POST api/auth/signin
// @desc    Authenticate user & get token
// @access  Public
// Sign-in route
router.post('/signin', signIn);

// @route   POST api/auth/verify-email
// @desc    Verify email with OTP
// @access  Public
// Verify email with OTP
router.post('/verify-email', verifyEmail);

// @route   POST api/auth/resend-verification
// @desc    Resend verification OTP
// @access  Public
// Resend verification OTP
router.post('/resend-verification', resendVerificationOtp);

module.exports = router;
