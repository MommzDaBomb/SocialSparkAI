const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const {
  syncContentAnalytics,
  createAnalyticsRecord,
  getContentAnalytics,
  getAnalyticsDashboard,
  getPlatformComparison,
  getContentPerformanceReport,
  getAudienceInsights
} = require('../controllers/analyticsController');

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.post('/sync/:id', syncContentAnalytics);
router.post('/record', createAnalyticsRecord);
router.get('/content/:id', getContentAnalytics);
router.get('/dashboard', getAnalyticsDashboard);
router.get('/platform-comparison', getPlatformComparison);
router.get('/content-performance', getContentPerformanceReport);
router.get('/audience-insights', getAudienceInsights);

module.exports = router;
