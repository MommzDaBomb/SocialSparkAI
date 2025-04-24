const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  generateContent,
  generateContentIdeas,
  researchTopic,
  improveContent,
  generateImage
} = require('../controllers/aiController');

// All routes require authentication
router.use(authenticate);

// AI routes
router.post('/generate', generateContent);
router.post('/ideas', generateContentIdeas);
router.post('/research', researchTopic);
router.post('/improve', improveContent);
router.post('/image', generateImage);

module.exports = router;
