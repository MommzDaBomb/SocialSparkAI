const Analytics = require('../models/Analytics');
const Content = require('../models/Content');
const User = require('../models/User');
const axios = require('axios');

// Helper function to fetch analytics from social media platforms
const fetchAnalyticsFromPlatform = async (platform, postId, accessToken) => {
  try {
    // Different handling based on platform
    switch (platform) {
      case 'linkedin':
        return await fetchLinkedInAnalytics(postId, accessToken);
      case 'twitter':
        return await fetchTwitterAnalytics(postId, accessToken);
      case 'facebook':
        return await fetchFacebookAnalytics(postId, accessToken);
      case 'instagram':
        return await fetchInstagramAnalytics(postId, accessToken);
      default:
        throw new Error(`Analytics fetching for ${platform} is not implemented yet`);
    }
  } catch (error) {
    console.error(`Error fetching analytics from ${platform}:`, error);
    throw error;
  }
};

// Platform-specific analytics fetching functions
const fetchLinkedInAnalytics = async (postId, accessToken) => {
  // This is a placeholder implementation
  // In a real application, this would use LinkedIn's API
  const response = await axios.get(
    `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${postId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Process and transform the data
  const metrics = {
    impressions: response.data.elements[0]?.totalShareStatistics?.impressionCount || 0,
    engagement: response.data.elements[0]?.totalShareStatistics?.engagement || 0,
    clicks: response.data.elements[0]?.totalShareStatistics?.clickCount || 0,
    likes: response.data.elements[0]?.totalShareStatistics?.likeCount || 0,
    comments: response.data.elements[0]?.totalShareStatistics?.commentCount || 0,
    shares: response.data.elements[0]?.totalShareStatistics?.shareCount || 0
  };
  
  return {
    metrics,
    demographicData: {}, // LinkedIn may provide demographic data in a real implementation
    timeData: {} // LinkedIn may provide time data in a real implementation
  };
};

const fetchTwitterAnalytics = async (postId, accessToken) => {
  // This is a placeholder implementation
  // In a real application, this would use Twitter's API
  const response = await axios.get(
    `https://api.twitter.com/2/tweets/${postId}/metrics`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Process and transform the data
  const metrics = {
    impressions: response.data.impression_count || 0,
    engagement: response.data.engagement_count || 0,
    likes: response.data.like_count || 0,
    retweets: response.data.retweet_count || 0,
    replies: response.data.reply_count || 0,
    clicks: response.data.url_link_clicks || 0
  };
  
  return {
    metrics,
    demographicData: {}, // Twitter may provide demographic data in a real implementation
    timeData: {} // Twitter may provide time data in a real implementation
  };
};

const fetchFacebookAnalytics = async (postId, accessToken) => {
  // This is a placeholder implementation
  // In a real application, this would use Facebook's API
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${postId}/insights?metric=post_impressions,post_engagements,post_reactions_by_type_total`,
    {
      params: {
        access_token: accessToken
      }
    }
  );
  
  // Process and transform the data
  const metrics = {
    impressions: response.data.data[0]?.values[0]?.value || 0,
    engagement: response.data.data[1]?.values[0]?.value || 0,
    likes: response.data.data[2]?.values[0]?.value?.like || 0,
    comments: 0, // Would be available in a real implementation
    shares: 0 // Would be available in a real implementation
  };
  
  return {
    metrics,
    demographicData: {}, // Facebook may provide demographic data in a real implementation
    timeData: {} // Facebook may provide time data in a real implementation
  };
};

const fetchInstagramAnalytics = async (postId, accessToken) => {
  // This is a placeholder implementation
  // In a real application, this would use Instagram's API (via Facebook Graph API)
  const response = await axios.get(
    `https://graph.facebook.com/v16.0/${postId}/insights?metric=impressions,reach,engagement,saved`,
    {
      params: {
        access_token: accessToken
      }
    }
  );
  
  // Process and transform the data
  const metrics = {
    impressions: response.data.data[0]?.values[0]?.value || 0,
    reach: response.data.data[1]?.values[0]?.value || 0,
    engagement: response.data.data[2]?.values[0]?.value || 0,
    saves: response.data.data[3]?.values[0]?.value || 0,
    likes: 0, // Would be available in a real implementation
    comments: 0 // Would be available in a real implementation
  };
  
  return {
    metrics,
    demographicData: {}, // Instagram may provide demographic data in a real implementation
    timeData: {} // Instagram may provide time data in a real implementation
  };
};

// @desc    Sync analytics for a specific content
// @route   POST /api/analytics/sync/:id
// @access  Private
exports.syncContentAnalytics = async (req, res, next) => {
  try {
    const { platform } = req.body;
    
    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a platform'
      });
    }
    
    // Get content
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Make sure user owns the content
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to sync analytics for this content'
      });
    }
    
    // Check if content is published
    if (content.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot sync analytics for unpublished content'
      });
    }
    
    // Get user with social accounts
    const user = await User.findById(req.user.id);
    
    // Find the social account for the platform
    const socialAccount = user.socialAccounts.find(
      account => account.platform === platform && account.connected
    );
    
    if (!socialAccount) {
      return res.status(400).json({
        success: false,
        message: `No connected account found for ${platform}`
      });
    }
    
    // Find existing analytics record
    let analytics = await Analytics.findOne({
      content: content._id,
      platform,
      user: req.user.id
    });
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics record not found. Please ensure content has been published with a valid post ID.'
      });
    }
    
    // Fetch analytics from platform
    const analyticsData = await fetchAnalyticsFromPlatform(
      platform,
      analytics.postId,
      socialAccount.accessToken
    );
    
    // Update analytics record
    analytics.metrics = analyticsData.metrics;
    if (analyticsData.demographicData) {
      analytics.demographicData = analyticsData.demographicData;
    }
    if (analyticsData.timeData) {
      analytics.timeData = analyticsData.timeData;
    }
    analytics.lastUpdated = Date.now();
    
    await analytics.save();
    
    // Also update the content's analytics field
    content.analytics = {
      impressions: analyticsData.metrics.impressions || 0,
      engagement: analyticsData.metrics.engagement || 0,
      clicks: analyticsData.metrics.clicks || 0,
      shares: analyticsData.metrics.shares || 0,
      likes: analyticsData.metrics.likes || 0,
      comments: analyticsData.metrics.comments || 0
    };
    
    await content.save();
    
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Error syncing content analytics:', err);
    res.status(500).json({
      success: false,
      message: 'Error syncing content analytics',
      error: err.message
    });
  }
};

// @desc    Create analytics record after publishing
// @route   POST /api/analytics/record
// @access  Private
exports.createAnalyticsRecord = async (req, res, next) => {
  try {
    const { contentId, platform, postId } = req.body;
    
    if (!contentId || !platform || !postId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get content
    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Make sure user owns the content
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to create analytics for this content'
      });
    }
    
    // Check if analytics record already exists
    const existingAnalytics = await Analytics.findOne({
      content: contentId,
      platform,
      user: req.user.id
    });
    
    if (existingAnalytics) {
      return res.status(400).json({
        success: false,
        message: 'Analytics record already exists for this content and platform'
      });
    }
    
    // Create analytics record
    const analytics = await Analytics.create({
      content: contentId,
      platform,
      postId,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: analytics
    });
  } catch (err) {
    console.error('Error creating analytics record:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating analytics record',
      error: err.message
    });
  }
};

// @desc    Get analytics for a specific content
// @route   GET /api/analytics/content/:id
// @access  Private
exports.getContentAnalytics = async (req, res, next) => {
  try {
    // Get content
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Make sure user owns the content
    if (content.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view analytics for this content'
      });
    }
    
    // Get analytics records for this content
    const analytics = await Analytics.find({
      content: req.params.id,
      user: req.user.id
    });
    
    res.status(200).json({
      success: true,
      count: analytics.length,
      data: analytics
    });
  } catch (err) {
    console.error('Error getting content analytics:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting content analytics',
      error: err.message
    });
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getAnalyticsDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate, platforms } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Build platform filter
    const platformFilter = {};
    if (platforms) {
      platformFilter.platform = { $in: platforms.split(',') };
    }
    
    // Combine filters
    const filter = {
      user: req.user.id,
      ...dateFilter,
      ...platformFilter
    };
    
    // Get total metrics across all platforms
    const totalMetrics = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$metrics.impressions' },
          totalEngagement: { $sum: '$metrics.engagement' },
          totalClicks: { $sum: '$metrics.clicks' },
          totalShares: { $sum: '$metrics.shares' },
          totalLikes: { $sum: '$metrics.likes' },
          totalComments: { $sum: '$metrics.comments' },
          totalSaves: { $sum: '$metrics.saves' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get metrics by platform
    const metricsByPlatform = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$platform',
          impressions: { $sum: '$metrics.impressions' },
          engagement: { $sum: '$metrics.engagement' },
          clicks: { $sum: '$metrics.clicks' },
          shares: { $sum: '$metrics.shares' },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          saves: { $sum: '$metrics.saves' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get metrics by content type (join with Content collection)
    const metricsByContentType = await Analytics.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'contents',
          localField: 'content',
          foreignField: '_id',
          as: 'contentData'
        }
      },
      { $unwind: '$contentData' },
      {
        $group: {
          _id: '$contentData.contentType',
          impressions: { $sum: '$metrics.impressions' },
          engagement: { $sum: '$metrics.engagement' },
          clicks: { $sum: '$metrics.clicks' },
          shares: { $sum: '$metrics.shares' },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get top performing content
    const topContent = await Analytics.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'contents',
          localField: 'content',
          foreignField: '_id',
          as: 'contentData'
        }
      },
      { $unwind: '$contentData' },
      {
        $project: {
          content: 1,
          platform: 1,
          metrics: 1,
          contentTitle: '$contentData.title',
          contentType: '$contentData.contentType',
          totalEngagement: { $sum: ['$metrics.likes', '$metrics.comments', '$metrics.shares', '$metrics.clicks'] }
        }
      },
      { $sort: { totalEngagement: -1 } },
      { $limit: 10 }
    ]);
    
    // Get engagement over time (by day)
    const engagementOverTime = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          impressions: { $sum: '$metrics.impressions' },
          engagement: { $sum: '$metrics.engagement' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);
    
    // Format the results
    const formattedEngagementOverTime = engagementOverTime.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
      impressions: item.impressions,
      engagement: item.engagement,
      count: item.count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        summary: totalMetrics[0] || {
          totalImpressions: 0,
          totalEngagement: 0,
          totalClicks: 0,
          totalShares: 0,
          totalLikes: 0,
          totalComments: 0,
          totalSaves: 0,
          count: 0
        },
        byPlatform: metricsByPlatform,
        byContentType: metricsByContentType,
        topContent,
        overTime: formattedEngagementOverTime
      }
    });
  } catch (err) {
    console.error('Error getting analytics dashboard:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting analytics dashboard',
      error: err.message
    });
  }
};

// @desc    Get platform comparison
// @route   GET /api/analytics/platform-comparison
// @access  Private
exports.getPlatformComparison = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }
    
    // Combine filters
    const filter = {
      user: req.user.id,
      ...dateFilter
    };
    
    // Get metrics by platform
    const platformData = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$platform',
          impressions: { $sum: '$metrics.impressions' },
          engagement: { $sum: '$metrics.engagement' },
          clicks: { $sum: '$metrics.clicks' },
          shares: { $sum: '$metrics.shares' },
          likes: { $sum: '$metrics.likes' },
          comments: { $sum: '$metrics.comments' },
          saves: { $sum: '$metrics.saves' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          platform: '$_id',
          impressions: 1,
          engagement: 1,
          clicks: 1,
          shares: 1,
          likes: 1,
          comments: 1,
          saves: 1,
          count: 1,
          engagementRate: {
            $cond: [
              { $eq: ['$impressions', 0] },
              0,
              { $multiply: [{ $divide: ['$engagement', '$impressions'] }, 100] }
            ]
          },
          _id: 0
        }
      },
      { $sort: { engagementRate: -1 } }
    ]);
    
    // Get best performing content type by platform
    const contentTypeByPlatform = await Analytics.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'contents',
          localField: 'content',
          foreignField: '_id',
          as: 'contentData'
        }
      },
      { $unwind: '$contentData' },
      {
        $group: {
          _id: {
            platform: '$platform',
            contentType: '$contentData.contentType'
          },
          impressions: { $sum: '$metrics.impressions' },
          engagement: { $sum: '$metrics.engagement' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          platform: '$_id.platform',
          contentType: '$_id.contentType',
          impressions: 1,
          engagement: 1,
          count: 1,
          engagementRate: {
            $cond: [
              { $eq: ['$impressions', 0] },
              0,
              { $multiply: [{ $divide: ['$engagement', '$impressions'] }, 100] }
            ]
          }
        }
      },
      { $sort: { engagementRate: -1 } }
    ]);
    
    // Group by platform to find best content type for each
    const bestContentTypeByPlatform = {};
    contentTypeByPlatform.forEach(item => {
      if (!bestContentTypeByPlatform[item.platform] || 
          item.engagementRate > bestContentTypeByPlatform[item.platform].engagementRate) {
        bestContentTypeByPlatform[item.platform] = item;
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        platformComparison: platformData,
        bestContentTypes: Object.values(bestContentTypeByPlatform)
      }
    });
  } catch (err) {
    console.error('Error getting platform comparison:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting platform comparison',
      error: err.message
    });
  }
};

// @desc    Get content performance report
// @route   GET /api/analytics/content-performance
// @access  Private
exports.getContentPerformanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, contentType, platform, limit = 10 } = req.query;
    
    // Build filters
    const filter = { user: req.user.id };
    
    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    // Platform filter
    if (platform) {
      filter.platform = platform;
    }
    
    // Get analytics data
    let analyticsQuery = Analytics.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'contents',
          localField: 'content',
          foreignField: '_id',
          as: 'contentData'
        }
      },
      { $unwind: '$contentData' }
    ]);
    
    // Content type filter (applied after lookup)
    if (contentType) {
      analyticsQuery = analyticsQuery.append({ 
        $match: { 'contentData.contentType': contentType } 
      });
    }
    
    // Complete the aggregation
    const contentPerformance = await analyticsQuery.append([
      {
        $project: {
          content: 1,
          platform: 1,
          metrics: 1,
          contentTitle: '$contentData.title',
          contentType: '$contentData.contentType',
          createdAt: 1,
          totalEngagement: { $sum: ['$metrics.likes', '$metrics.comments', '$metrics.shares', '$metrics.clicks'] },
          engagementRate: {
            $cond: [
              { $eq: ['$metrics.impressions', 0] },
              0,
              { $multiply: [{ $divide: [{ $sum: ['$metrics.likes', '$metrics.comments', '$metrics.shares', '$metrics.clicks'] }, '$metrics.impressions'] }, 100] }
            ]
          }
        }
      },
      { $sort: { engagementRate: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Get average metrics for comparison
    const averageMetrics = await Analytics.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgImpressions: { $avg: '$metrics.impressions' },
          avgEngagement: { $avg: '$metrics.engagement' },
          avgLikes: { $avg: '$metrics.likes' },
          avgComments: { $avg: '$metrics.comments' },
          avgShares: { $avg: '$metrics.shares' },
          avgClicks: { $avg: '$metrics.clicks' }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        topPerformingContent: contentPerformance,
        averageMetrics: averageMetrics[0] || {
          avgImpressions: 0,
          avgEngagement: 0,
          avgLikes: 0,
          avgComments: 0,
          avgShares: 0,
          avgClicks: 0
        }
      }
    });
  } catch (err) {
    console.error('Error getting content performance report:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting content performance report',
      error: err.message
    });
  }
};

// @desc    Get audience insights
// @route   GET /api/analytics/audience-insights
// @access  Private
exports.getAudienceInsights = async (req, res, next) => {
  try {
    const { platform } = req.query;
    
    // Build filter
    const filter = { user: req.user.id };
    
    // Platform filter
    if (platform) {
      filter.platform = platform;
    }
    
    // Get analytics with demographic data
    const analytics = await Analytics.find(filter)
      .select('demographicData platform');
    
    // Process demographic data
    const ageRanges = {};
    const genders = {};
    const locations = {};
    
    analytics.forEach(record => {
      // Process age ranges
      if (record.demographicData && record.demographicData.ageRanges) {
        for (const [age, count] of record.demographicData.ageRanges.entries()) {
          if (!ageRanges[age]) {
            ageRanges[age] = 0;
          }
          ageRanges[age] += count;
        }
      }
      
      // Process genders
      if (record.demographicData && record.demographicData.genders) {
        for (const [gender, count] of record.demographicData.genders.entries()) {
          if (!genders[gender]) {
            genders[gender] = 0;
          }
          genders[gender] += count;
        }
      }
      
      // Process locations
      if (record.demographicData && record.demographicData.locations) {
        for (const [location, count] of record.demographicData.locations.entries()) {
          if (!locations[location]) {
            locations[location] = 0;
          }
          locations[location] += count;
        }
      }
    });
    
    // Convert to arrays and sort
    const ageRangesArray = Object.entries(ageRanges).map(([age, count]) => ({ age, count }));
    const gendersArray = Object.entries(genders).map(([gender, count]) => ({ gender, count }));
    const locationsArray = Object.entries(locations)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 locations
    
    res.status(200).json({
      success: true,
      data: {
        ageDistribution: ageRangesArray,
        genderDistribution: gendersArray,
        topLocations: locationsArray
      }
    });
  } catch (err) {
    console.error('Error getting audience insights:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting audience insights',
      error: err.message
    });
  }
};
