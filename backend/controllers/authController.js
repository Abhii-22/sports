const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, getOtpExpiry, isOtpExpired } = require('../utils/otpGenerator');
const { sendVerificationEmail } = require('../utils/emailService');

// User Sign-Up
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Signup attempt for:', { email, name });

  try {
    // Validate input
    if (!email || !name || !password) {
      console.error('Missing required fields');
      return res.status(400).json({ 
        success: false,
        msg: 'All fields are required',
        missing: {
          email: !email,
          name: !name,
          password: !password
        }
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.error('User already exists:', email);
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists',
        error: 'USER_EXISTS'
      });
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = getOtpExpiry();
    console.log('Generated OTP for:', email);

    try {
      // Create and save user
      user = new User({
        name,
        email,
        password,
        emailVerificationOtp: otp,
        emailVerificationOtpExpiry: otpExpiry,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      console.log('User saved successfully:', user._id);

      // Send verification email (don't await to prevent blocking)
      console.log('Attempting to send verification email to:', email);
      sendVerificationEmail(email, otp)
        .then(sent => {
          if (!sent) {
            console.error('Failed to send verification email to:', email);
            // Don't fail the request if email sending fails
            // The user can request a new OTP later
          } else {
            console.log('Verification email sent to:', email);
          }
        })
        .catch(emailError => {
          console.error('Email sending error:', emailError);
        });

      // Prepare response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationOtp;
      delete userResponse.emailVerificationOtpExpiry;

      return res.status(201).json({
        success: true,
        msg: 'Registration successful! Please check your email for the verification code.',
        userId: user._id,
      });

    } catch (dbError) {
      console.error('Database error during signup:', {
        error: dbError.message,
        stack: dbError.stack,
        email,
        name
      });
      return res.status(500).json({
        success: false,
        msg: 'Error creating user account',
        error: 'DATABASE_ERROR'
      });
    }

  } catch (err) {
    console.error('Unexpected error in signup:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    return res.status(500).json({
      success: false,
      msg: 'An unexpected error occurred during registration',
      error: 'SERVER_ERROR'
    });
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
