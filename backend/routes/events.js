const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEventsByUser, trackEventView } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   POST api/events
// @desc    Create an event
// @access  Private
router.post('/', [auth, upload.single('eventImage')], createEvent);

// @route   GET api/events
// @desc    Get all events
// @access  Public
router.get('/', getEvents);

// @route   GET api/events/user/:userId
// @desc    Get events by user
// @access  Public
router.get('/user/:userId', getEventsByUser);

// @route   POST api/events/view/:id
// @desc    Track an event view
// @access  Private
router.post('/view/:id', auth, trackEventView);

module.exports = router;
