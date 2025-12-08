const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProfile, updateProfile, uploadProfilePicture } = require('../controllers/profileController');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, getProfile);

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, updateProfile);

// @route   POST api/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post('/picture', [auth, upload.single('profilePicture')], uploadProfilePicture);

module.exports = router;
