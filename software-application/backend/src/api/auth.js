const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  register,
  login,
  getMe,
  updateSettings,
  updatePassword,
  connectSocialAccount,
  disconnectSocialAccount
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/settings', authenticate, updateSettings);
router.put('/password', authenticate, updatePassword);
router.post('/social', authenticate, connectSocialAccount);
router.delete('/social/:platform', authenticate, disconnectSocialAccount);

module.exports = router;
