const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  settings: {
    notifyEmail: {
      type: Boolean,
      default: true
    },
    notifyPush: {
      type: Boolean,
      default: true
    },
    defaultAiModel: {
      type: String,
      enum: ['chatgpt', 'claude', 'perplexity', 'poppyai', 'midjourney', 'flux'],
      default: 'chatgpt'
    },
    defaultTone: {
      type: String,
      enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'conversational', 'formal', 'technical'],
      default: 'professional'
    },
    autoSchedule: {
      type: Boolean,
      default: true
    },
    autoApprove: {
      type: Boolean,
      default: false
    },
    darkMode: {
      type: Boolean,
      default: false
    }
  },
  apiKeys: {
    openai: String,
    anthropic: String,
    perplexity: String,
    midjourney: String
  },
  socialAccounts: [{
    platform: {
      type: String,
      enum: ['linkedin', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok']
    },
    connected: {
      type: Boolean,
      default: false
    },
    accessToken: String,
    refreshToken: String,
    tokenExpiry: Date,
    username: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
