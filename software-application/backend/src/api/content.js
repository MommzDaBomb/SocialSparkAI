const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  createContent,
  getAllContent,
  getContent,
  updateContent,
  deleteContent,
  approveContent,
  rejectContent,
  scheduleContent,
  getContentAnalytics,
  updateContentAnalytics
} = require('../controllers/contentController');

// All routes require authentication
router.use(authenticate);

// Content routes
router.route('/')
  .get(getAllContent)
  .post(createContent);

router.route('/:id')
  .get(getContent)
  .put(updateContent)
  .delete(deleteContent);

// Content actions
router.put('/:id/approve', approveContent);
router.put('/:id/reject', rejectContent);
router.post('/:id/schedule', scheduleContent);

// Content analytics
router.route('/:id/analytics')
  .get(getContentAnalytics)
  .put(updateContentAnalytics);

module.exports = router;
