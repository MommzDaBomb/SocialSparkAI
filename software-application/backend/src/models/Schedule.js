const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.ObjectId,
    ref: 'Content',
    required: true
  },
  platform: {
    type: String,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed'],
    default: 'scheduled'
  },
  publishedDate: Date,
  failureReason: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
