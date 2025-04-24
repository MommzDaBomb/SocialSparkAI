const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  contentType: {
    type: String,
    enum: ['blog', 'article', 'social_post', 'video_script', 'audiogram'],
    required: [true, 'Please specify content type']
  },
  platforms: [{
    type: String,
    enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok']
  }],
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'approved', 'scheduled', 'published', 'rejected'],
    default: 'draft'
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'technical'],
    default: 'professional'
  },
  keywords: [String],
  aiModel: {
    type: String,
    enum: ['chatgpt', 'claude', 'perplexity', 'poppyai', 'midjourney', 'flux'],
    required: true
  },
  mediaUrls: [String],
  scheduledDate: Date,
  publishedDate: Date,
  analytics: {
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
    }
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
ContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', ContentSchema);
