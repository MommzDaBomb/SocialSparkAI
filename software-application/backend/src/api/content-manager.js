const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  publishContent,
  scheduleContentBatch,
  repurposeContent,
  bulkApproveContent,
  getContentCalendar,
  getContentLibrary,
  getContentStats
} = require('../controllers/contentManagerController');

// All routes require authentication
router.use(authenticate);

// Content management routes
router.post('/publish/:id', publishContent);
router.post('/schedule', scheduleContentBatch);
router.post('/repurpose/:id', repurposeContent);
router.post('/approve', bulkApproveContent);
router.get('/calendar', getContentCalendar);
router.get('/library', getContentLibrary);
router.get('/stats', getContentStats);

module.exports = router;
