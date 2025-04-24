const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  getAllSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  getCalendarData,
  getPlatformAnalytics,
  getContentTypeAnalytics,
  getTopContent
} = require('../controllers/socialController');

// All routes require authentication
router.use(authenticate);

// Schedule routes
router.route('/schedule')
  .get(getAllSchedules);

router.route('/schedule/:id')
  .get(getSchedule)
  .put(updateSchedule)
  .delete(deleteSchedule);

// Calendar data
router.get('/calendar', getCalendarData);

// Analytics routes
router.get('/analytics/platforms', getPlatformAnalytics);
router.get('/analytics/content-types', getContentTypeAnalytics);
router.get('/analytics/top-content', getTopContent);

module.exports = router;
