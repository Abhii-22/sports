const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, getOtpExpiry, isOtpExpired } = require('../utils/otpGenerator');
const { sendVerificationEmail } = require('../utils/emailService');

// User Sign-Up
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    user = new User({
      name,
      email,
      password,
      emailVerificationOtp: otp,
      emailVerificationOtpExpiry: otpExpiry,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user first
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    // Don't include sensitive data in response
    user = user.toObject();
    delete user.password;
    delete user.emailVerificationOtp;
    delete user.emailVerificationOtpExpiry;

    res.status(201).json({
      msg: 'Registration successful! Please check your email for the verification code.',
      userId: user._id,
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).send('Server error during registration');
  }
};

// Verify Email with OTP
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ msg: 'Email already verified' });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    if (isOtpExpired(user.emailVerificationOtpExpiry)) {
      return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpiry = undefined;
    await user.save();

    // Generate JWT for the newly verified user
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          msg: 'Email verified successfully!',
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
          }
        });
      }
    );
  } catch (err) {
    console.error('Email verification error:', err.message);
    res.status(500).send('Server error during email verification');
  }
};

// Resend verification OTP
exports.resendVerificationOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    // Generate new OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();

    // Update user with new OTP
    user.emailVerificationOtp = otp;
    user.emailVerificationOtpExpiry = otpExpiry;
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({ msg: 'Failed to send verification email' });
    }

    res.json({ msg: 'Verification code has been resent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).send('Server error while resending verification code');
  }
};

// User Sign-In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        msg: 'Please verify your email address first',
        requiresVerification: true,
        email: user.email
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) throw err;
      
      // Don't include sensitive data in response
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        profilePictureUrl: user.profilePictureUrl,
        bio: user.bio
      };
      
      res.json({ 
        token,
        user: userResponse 
      });
    });
  } catch (err) {
    console.error('Sign in error:', err.message);
    res.status(500).send('Server error during sign in');
  }
};
