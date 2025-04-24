const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey', {
    expiresIn: '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        settings: user.settings,
        socialAccounts: user.socialAccounts
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      settings: user.settings
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Connect social media account
// @route   POST /api/auth/social
// @access  Private
exports.connectSocialAccount = async (req, res, next) => {
  try {
    const { platform, accessToken, refreshToken, username } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    // Check if platform already connected
    const existingAccountIndex = user.socialAccounts.findIndex(
      account => account.platform === platform
    );

    if (existingAccountIndex !== -1) {
      // Update existing account
      user.socialAccounts[existingAccountIndex] = {
        platform,
        connected: true,
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        username
      };
    } else {
      // Add new account
      user.socialAccounts.push({
        platform,
        connected: true,
        accessToken,
        refreshToken,
        tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        username
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${platform} account connected successfully`,
      socialAccounts: user.socialAccounts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Disconnect social media account
// @route   DELETE /api/auth/social/:platform
// @access  Private
exports.disconnectSocialAccount = async (req, res, next) => {
  try {
    const { platform } = req.params;

    // Find user
    const user = await User.findById(req.user.id);

    // Filter out the platform
    user.socialAccounts = user.socialAccounts.filter(
      account => account.platform !== platform
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: `${platform} account disconnected successfully`,
      socialAccounts: user.socialAccounts
    });
  } catch (err) {
    next(err);
  }
};
