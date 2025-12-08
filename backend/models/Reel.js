const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Reel', reelSchema);
