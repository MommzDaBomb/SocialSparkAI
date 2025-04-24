const Schedule = require('../models/Schedule');
const Content = require('../models/Content');

// @desc    Get all schedules for user
// @route   GET /api/social/schedule
// @access  Private
exports.getAllSchedules = async (req, res, next) => {
  try {
    const { platform, status, startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add filters if provided
    if (platform) query.platform = platform;
    if (status) query.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    
    const schedules = await Schedule.find(query)
      .populate('content', 'title contentType')
      .sort({ scheduledDate: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single schedule
// @route   GET /api/social/schedule/:id
// @access  Private
exports.getSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('content');
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this schedule'
      });
    }

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update schedule
// @route   PUT /api/social/schedule/:id
// @access  Private
exports.updateSchedule = async (req, res, next) => {
  try {
    let schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }
    
    schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete schedule
// @route   DELETE /api/social/schedule/:id
// @access  Private
exports.deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    // Make sure user owns the schedule
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this schedule'
      });
    }
    
    await schedule.remove();
    
    // Update content status if this was the only schedule
    const contentSchedules = await Schedule.countDocuments({ 
      content: schedule.content 
    });
    
    if (contentSchedules === 0) {
      await Content.findByIdAndUpdate(
        schedule.content,
        { status: 'approved', scheduledDate: null }
      );
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get calendar data (all schedules in calendar format)
// @route   GET /api/social/calendar
// @access  Private
exports.getCalendarData = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    
    const schedules = await Schedule.find(query)
      .populate('content', 'title contentType');
    
    // Transform data for calendar
    const calendarData = schedules.map(schedule => ({
      id: schedule._id,
      title: schedule.content.title,
      start: schedule.scheduledDate,
      platform: schedule.platform,
      contentType: schedule.content.contentType,
      status: schedule.status
    }));

    res.status(200).json({
      success: true,
      count: calendarData.length,
      data: calendarData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analytics overview by platform
// @route   GET /api/social/analytics/platforms
// @access  Private
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Aggregate content analytics by platform
    const platformAnalytics = await Content.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(req.user.id),
          ...(Object.keys(dateFilter).length > 0 && { publishedDate: dateFilter })
        } 
      },
      { $unwind: '$platforms' },
      {
        $group: {
          _id: '$platforms',
          totalContent: { $sum: 1 },
          totalImpressions: { $sum: '$analytics.impressions' },
          totalEngagement: { $sum: '$analytics.engagement' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' }
        }
      },
      {
        $project: {
          platform: '$_id',
          totalContent: 1,
          totalImpressions: 1,
          totalEngagement: 1,
          totalLikes: 1,
          totalShares: 1,
          totalComments: 1,
          engagementRate: { 
            $cond: [
              { $eq: ['$totalImpressions', 0] },
              0,
              { $multiply: [{ $divide: ['$totalEngagement', '$totalImpressions'] }, 100] }
            ]
          },
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: platformAnalytics.length,
      data: platformAnalytics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get analytics overview by content type
// @route   GET /api/social/analytics/content-types
// @access  Private
exports.getContentTypeAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Aggregate content analytics by content type
    const contentTypeAnalytics = await Content.aggregate([
      { 
        $match: { 
          user: mongoose.Types.ObjectId(req.user.id),
          ...(Object.keys(dateFilter).length > 0 && { publishedDate: dateFilter })
        } 
      },
      {
        $group: {
          _id: '$contentType',
          totalContent: { $sum: 1 },
          totalImpressions: { $sum: '$analytics.impressions' },
          totalEngagement: { $sum: '$analytics.engagement' },
          totalLikes: { $sum: '$analytics.likes' },
          totalShares: { $sum: '$analytics.shares' },
          totalComments: { $sum: '$analytics.comments' }
        }
      },
      {
        $project: {
          contentType: '$_id',
          totalContent: 1,
          totalImpressions: 1,
          totalEngagement: 1,
          totalLikes: 1,
          totalShares: 1,
          totalComments: 1,
          engagementRate: { 
            $cond: [
              { $eq: ['$totalImpressions', 0] },
              0,
              { $multiply: [{ $divide: ['$totalEngagement', '$totalImpressions'] }, 100] }
            ]
          },
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: contentTypeAnalytics.length,
      data: contentTypeAnalytics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get top performing content
// @route   GET /api/social/analytics/top-content
// @access  Private
exports.getTopContent = async (req, res, next) => {
  try {
    const { limit = 5, metric = 'engagement', startDate, endDate } = req.query;
    
    // Build date range filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    // Determine sort field based on metric
    let sortField;
    switch (metric) {
      case 'impressions':
        sortField = 'analytics.impressions';
        break;
      case 'likes':
        sortField = 'analytics.likes';
        break;
      case 'shares':
        sortField = 'analytics.shares';
        break;
      case 'comments':
        sortField = 'analytics.comments';
        break;
      default:
        sortField = 'analytics.engagement';
    }
    
    // Build sort object
    const sort = {};
    sort[sortField] = -1;
    
    // Find top content
    const topContent = await Content.find({
      user: req.user.id,
      ...(Object.keys(dateFilter).length > 0 && { publishedDate: dateFilter })
    })
    .sort(sort)
    .limit(parseInt(limit))
    .select('title contentType platforms analytics publishedDate');

    res.status(200).json({
      success: true,
      count: topContent.length,
      data: topContent
    });
  } catch (err) {
    next(err);
  }
};
