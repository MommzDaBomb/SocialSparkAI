const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
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
  postId: {
    type: String,
    required: true
  },
  metrics: {
    impressions: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    }
  },
  demographicData: {
    ageRanges: {
      type: Map,
      of: Number
    },
    genders: {
      type: Map,
      of: Number
    },
    locations: {
      type: Map,
      of: Number
    }
  },
  timeData: {
    hourlyEngagement: {
      type: Map,
      of: Number
    },
    peakEngagementTime: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
