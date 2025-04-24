const Content = require('../models/Content');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const axios = require('axios');

// Helper function to post content to social media platforms
const postToSocialMedia = async (content, platform, user) => {
  try {
    // Find the social account for the platform
    const socialAccount = user.socialAccounts.find(
      account => account.platform === platform && account.connected
    );
    
    if (!socialAccount) {
      throw new Error(`No connected account found for ${platform}`);
    }
    
    // Different handling based on platform
    switch (platform) {
      case 'linkedin':
        return await postToLinkedIn(content, socialAccount);
      case 'twitter':
        return await postToTwitter(content, socialAccount);
      case 'facebook':
        return await postToFacebook(content, socialAccount);
      case 'instagram':
        return await postToInstagram(content, socialAccount);
      default:
        throw new Error(`Posting to ${platform} is not implemented yet`);
    }
  } catch (error) {
    console.error(`Error posting to ${platform}:`, error);
    throw error;
  }
};

// Platform-specific posting functions
const postToLinkedIn = async (content, socialAccount) => {
  // This is a placeholder implementation
  // In a real application, this would use LinkedIn's API
  const response = await axios.post(
    'https://api.linkedin.com/v2/ugcPosts',
    {
      author: `urn:li:person:${socialAccount.username}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content.content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    success: true,
    postId: response.data.id,
    platform: 'linkedin'
  };
};

const postToTwitter = async (content, socialAccount) => {
  // This is a placeholder implementation
  // In a real application, this would use Twitter's API
  const response = await axios.post(
    'https://api.twitter.com/2/tweets',
    {
      text: content.content
    },
    {
      headers: {
        'Authorization': `Bearer ${socialAccount.accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return {
    success: true,
    postId: response.data.data.id,
    platform: 'twitter'
  };
};

const postToFacebook = async (content, socialAccount) => {
  // This is a placeholder implementation
  // In a real application, this would use Facebook's API
  const response = await axios.post(
    `https://graph.facebook.com/v16.0/${socialAccount.username}/feed`,
    {
      message: content.content,
      access_token: socialAccount.accessToken
    }
  );
  
  return {
    success: true,
    postId: response.data.id,
    platform: 'facebook'
  };
};

const postToInstagram = async (content, socialAccount) => {
  // This is a placeholder implementation
  // In a real application, this would use Instagram's API
  // Note: Instagram requires an image for posts
  const response = await axios.post(
    `https://graph.facebook.com/v16.0/${socialAccount.username}/media`,
    {
      image_url: content.mediaUrls[0],
      caption: content.content,
      access_token: socialAccount.accessToken
    }
  );
  
  // Publish the container
  const publishResponse = await axios.post(
    `https://graph.facebook.com/v16.0/${socialAccount.username}/media_publish`,
    {
      creation_id: response.data.id,
      access_token: socialAccount.accessToken
    }
  );
  
  return {
    success: true,
    postId: publishResponse.data.id,
    platform: 'instagram'
  };
};

// @desc    Publish content to social media
// @route   POST /api/content-manager/publish/:id
// @access  Private
exports.publishContent = async (req, res, next) => {
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
        message: 'Not authorized to publish this content'
      });
    }
    
    // Check if content is approved
    if (content.status !== 'approved' && content.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Content must be approved before publishing'
      });
    }
    
    // Get user with social accounts
    const user = await User.findById(req.user.id);
    
    // Post to social media
    const result = await postToSocialMedia(content, platform, user);
    
    // Update content status
    content.status = 'published';
    content.publishedDate = Date.now();
    await content.save();
    
    // If there was a schedule for this content, update it
    await Schedule.updateMany(
      { content: content._id, platform },
      { status: 'published', publishedDate: Date.now() }
    );
    
    res.status(200).json({
      success: true,
      data: {
        content,
        publishResult: result
      }
    });
  } catch (err) {
    console.error('Error publishing content:', err);
    res.status(500).json({
      success: false,
      message: 'Error publishing content',
      error: err.message
    });
  }
};

// @desc    Schedule content for publishing
// @route   POST /api/content-manager/schedule
// @access  Private
exports.scheduleContentBatch = async (req, res, next) => {
  try {
    const { schedules } = req.body;
    
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid schedules'
      });
    }
    
    const results = [];
    
    for (const schedule of schedules) {
      const { contentId, platform, scheduledDate } = schedule;
      
      if (!contentId || !platform || !scheduledDate) {
        results.push({
          success: false,
          message: 'Missing required fields',
          schedule
        });
        continue;
      }
      
      // Get content
      const content = await Content.findById(contentId);
      
      if (!content) {
        results.push({
          success: false,
          message: 'Content not found',
          schedule
        });
        continue;
      }
      
      // Make sure user owns the content
      if (content.user.toString() !== req.user.id) {
        results.push({
          success: false,
          message: 'Not authorized to schedule this content',
          schedule
        });
        continue;
      }
      
      // Create schedule
      const newSchedule = await Schedule.create({
        content: contentId,
        platform,
        scheduledDate: new Date(scheduledDate),
        user: req.user.id
      });
      
      // Update content status
      content.status = 'scheduled';
      content.scheduledDate = new Date(scheduledDate);
      await content.save();
      
      results.push({
        success: true,
        data: newSchedule
      });
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error scheduling content batch:', err);
    res.status(500).json({
      success: false,
      message: 'Error scheduling content batch',
      error: err.message
    });
  }
};

// @desc    Repurpose content
// @route   POST /api/content-manager/repurpose/:id
// @access  Private
exports.repurposeContent = async (req, res, next) => {
  try {
    const { targetPlatform, targetContentType } = req.body;
    
    if (!targetPlatform || !targetContentType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide target platform and content type'
      });
    }
    
    // Get original content
    const originalContent = await Content.findById(req.params.id);
    
    if (!originalContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    // Make sure user owns the content
    if (originalContent.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to repurpose this content'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      claude: user.apiKeys?.claude,
      perplexity: user.apiKeys?.perplexity
    };
    
    // Check if user has any API key
    if (!apiKeys.openai && !apiKeys.claude && !apiKeys.perplexity) {
      return res.status(400).json({
        success: false,
        message: 'No AI API keys configured'
      });
    }
    
    // Determine which API to use (prefer Claude for repurposing if available)
    const apiToUse = apiKeys.claude ? 'claude' : (apiKeys.openai ? 'openai' : 'perplexity');
    
    // Create prompt for repurposing
    let prompt = `Repurpose the following ${originalContent.contentType} content originally created for ${originalContent.platforms[0]} into a ${targetContentType} for ${targetPlatform}.\n\n`;
    prompt += `Original content:\n${originalContent.content}\n\n`;
    prompt += `Please maintain the same tone (${originalContent.tone}) and include these keywords: ${originalContent.keywords.join(', ')}.`;
    
    // Make API call based on selected service
    let repurposedContent;
    if (apiToUse === 'openai' && apiKeys.openai) {
      const OpenAIService = require('../services/ai/openaiService');
      const openai = new OpenAIService(apiKeys.openai);
      repurposedContent = await openai.generateContent(prompt);
    } else if (apiToUse === 'claude' && apiKeys.claude) {
      const ClaudeService = require('../services/ai/claudeService');
      const claude = new ClaudeService(apiKeys.claude);
      repurposedContent = await claude.generateContent(prompt);
    } else if (apiToUse === 'perplexity' && apiKeys.perplexity) {
      const PerplexityService = require('../services/ai/perplexityService');
      const perplexity = new PerplexityService(apiKeys.perplexity);
      repurposedContent = await perplexity.generateContent(prompt);
    }
    
    // Create new content entry
    const newContent = await Content.create({
      title: `${originalContent.title} (Repurposed for ${targetPlatform})`,
      description: `Repurposed from ${originalContent.contentType} for ${originalContent.platforms[0]}`,
      content: repurposedContent,
      contentType: targetContentType,
      platforms: [targetPlatform],
      status: 'pending_approval',
      tone: originalContent.tone,
      keywords: originalContent.keywords,
      aiModel: apiToUse,
      user: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: newContent
    });
  } catch (err) {
    console.error('Error repurposing content:', err);
    res.status(500).json({
      success: false,
      message: 'Error repurposing content',
      error: err.message
    });
  }
};

// @desc    Bulk approve content
// @route   POST /api/content-manager/approve
// @access  Private
exports.bulkApproveContent = async (req, res, next) => {
  try {
    const { contentIds } = req.body;
    
    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid content IDs'
      });
    }
    
    const results = [];
    
    for (const contentId of contentIds) {
      try {
        // Get content
        const content = await Content.findById(contentId);
        
        if (!content) {
          results.push({
            success: false,
            message: 'Content not found',
            contentId
          });
          continue;
        }
        
        // Make sure user owns the content
        if (content.user.toString() !== req.user.id) {
          results.push({
            success: false,
            message: 'Not authorized to approve this content',
            contentId
          });
          continue;
        }
        
        // Update status to approved
        content.status = 'approved';
        await content.save();
        
        results.push({
          success: true,
          data: content
        });
      } catch (error) {
        results.push({
          success: false,
          message: error.message,
          contentId
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (err) {
    console.error('Error bulk approving content:', err);
    res.status(500).json({
      success: false,
      message: 'Error bulk approving content',
      error: err.message
    });
  }
};

// @desc    Get content calendar
// @route   GET /api/content-manager/calendar
// @access  Private
exports.getContentCalendar = async (req, res, next) => {
  try {
    const { startDate, endDate, platforms } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }
    
    // Platform filter
    if (platforms) {
      const platformList = platforms.split(',');
      query.platform = { $in: platformList };
    }
    
    // Get schedules
    const schedules = await Schedule.find(query)
      .populate('content', 'title contentType status');
    
    // Transform data for calendar
    const calendarData = schedules.map(schedule => ({
      id: schedule._id,
      contentId: schedule.content._id,
      title: schedule.content.title,
      start: schedule.scheduledDate,
      end: new Date(schedule.scheduledDate.getTime() + 30 * 60000), // Add 30 minutes
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
    console.error('Error getting content calendar:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting content calendar',
      error: err.message
    });
  }
};

// @desc    Get content library
// @route   GET /api/content-manager/library
// @access  Private
exports.getContentLibrary = async (req, res, next) => {
  try {
    const { 
      search, 
      platforms, 
      contentTypes, 
      status, 
      startDate, 
      endDate,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Platform filter
    if (platforms) {
      const platformList = platforms.split(',');
      query.platforms = { $in: platformList };
    }
    
    // Content type filter
    if (contentTypes) {
      const contentTypeList = contentTypes.split(',');
      query.contentType = { $in: contentTypeList };
    }
    
    // Status filter
    if (status) {
      const statusList = status.split(',');
      query.status = { $in: statusList };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Build sort options
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by creation date, newest first
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get content with pagination
    const content = await Content.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Content.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: content.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      data: content
    });
  } catch (err) {
    console.error('Error getting content library:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting content library',
      error: err.message
    });
  }
};

// @desc    Get content statistics
// @route   GET /api/content-manager/stats
// @access  Private
exports.getContentStats = async (req, res, next) => {
  try {
    // Count content by status
    const statusStats = await Content.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Count content by platform
    const platformStats = await Content.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$platforms' },
      { $group: { _id: '$platforms', count: { $sum: 1 } } }
    ]);
    
    // Count content by content type
    const contentTypeStats = await Content.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ]);
    
    // Count content by AI model
    const aiModelStats = await Content.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$aiModel', count: { $sum: 1 } } }
    ]);
    
    // Get content creation over time (by month)
    const contentOverTime = await Content.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Format the results
    const formattedStatusStats = statusStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const formattedPlatformStats = platformStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const formattedContentTypeStats = contentTypeStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const formattedAiModelStats = aiModelStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});
    
    const formattedContentOverTime = contentOverTime.map(item => ({
      date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      count: item.count
    }));
    
    res.status(200).json({
      success: true,
      data: {
        byStatus: formattedStatusStats,
        byPlatform: formattedPlatformStats,
        byContentType: formattedContentTypeStats,
        byAiModel: formattedAiModelStats,
        overTime: formattedContentOverTime
      }
    });
  } catch (err) {
    console.error('Error getting content stats:', err);
    res.status(500).json({
      success: false,
      message: 'Error getting content stats',
      error: err.message
    });
  }
};
