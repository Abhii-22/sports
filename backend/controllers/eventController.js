const Event = require('../models/Event');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const { title, sportName, date, place, prize1, prize2, prize3, prize4, prize5 } = req.body;
    const rules = req.body.rules || 'No rules specified';

    const prizes = {
      '1st': prize1 || '',
      '2nd': prize2 || '',
      '3rd': prize3 || '',
      '4th': prize4 || '',
      '5th': prize5 || '',
    };

    const eventData = {
      title: title || 'Untitled Event',
      sportName: sportName || '',
      date: date || new Date(),
      place: place || '',
      rules: rules,
      prizes: prizes,
      uploadedBy: req.user.id,
    };

    // Only add poster if file was uploaded
    if (req.file) {
      eventData.poster = `/uploads/${req.file.filename}`;
    }

    const newEvent = new Event(eventData);

    const event = await newEvent.save();
    res.json(event);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 }).populate('uploadedBy', 'name');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get events by user
// Track event view
exports.trackEventView = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Check if user has already viewed this event
    if (req.user && !event.viewedBy.includes(req.user.id)) {
      event.viewedBy.push(req.user.id);
      event.viewCount += 1;
      await event.save();
    }

    res.json({ viewCount: event.viewCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get events by user
exports.getEventsByUser = async (req, res) => {
  try {
    const events = await Event.find({ uploadedBy: req.params.userId }).sort({ createdAt: -1 }).populate('uploadedBy', 'name');
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
