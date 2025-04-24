const Content = require('../models/Content');
const Schedule = require('../models/Schedule');

// @desc    Create new content
// @route   POST /api/content
// @access  Private
exports.createContent = async (req, res, next) => {
  try {
    // Add user to request body
    req.body.user = req.user.id;
    
    const content = await Content.create(req.body);

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all content for user
// @route   GET /api/content
// @access  Private
exports.getAllContent = async (req, res, next) => {
  try {
    const { status, platform, contentType, search } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add filters if provided
    if (status) query.status = status;
    if (contentType) query.contentType = contentType;
    if (platform) query.platforms = platform;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const content = await Content.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: content.length,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single content
// @route   GET /api/content/:id
// @access  Private
exports.getContent = async (req, res, next) => {
  try {
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
        message: 'Not authorized to access this content'
      });
    }

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
exports.updateContent = async (req, res, next) => {
  try {
    let content = await Content.findById(req.params.id);
    
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
        message: 'Not authorized to update this content'
      });
    }
    
    content = await Content.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
exports.deleteContent = async (req, res, next) => {
  try {
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
        message: 'Not authorized to delete this content'
      });
    }
    
    await content.remove();
    
    // Also remove any schedules for this content
    await Schedule.deleteMany({ content: req.params.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve content
// @route   PUT /api/content/:id/approve
// @access  Private
exports.approveContent = async (req, res, next) => {
  try {
    let content = await Content.findById(req.params.id);
    
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
        message: 'Not authorized to approve this content'
      });
    }
    
    // Update status to approved
    content = await Content.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject content
// @route   PUT /api/content/:id/reject
// @access  Private
exports.rejectContent = async (req, res, next) => {
  try {
    let content = await Content.findById(req.params.id);
    
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
        message: 'Not authorized to reject this content'
      });
    }
    
    // Update status to rejected
    content = await Content.findByIdAndUpdate(
      req.params.id, 
      { status: 'rejected' }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule content
// @route   POST /api/content/:id/schedule
// @access  Private
exports.scheduleContent = async (req, res, next) => {
  try {
    const { platform, scheduledDate } = req.body;
    
    if (!platform || !scheduledDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide platform and scheduled date'
      });
    }
    
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
        message: 'Not authorized to schedule this content'
      });
    }
    
    // Create schedule
    const schedule = await Schedule.create({
      content: req.params.id,
      platform,
      scheduledDate,
      user: req.user.id
    });
    
    // Update content status to scheduled
    await Content.findByIdAndUpdate(
      req.params.id, 
      { 
        status: 'scheduled',
        scheduledDate
      }
    );

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get content analytics
// @route   GET /api/content/:id/analytics
// @access  Private
exports.getContentAnalytics = async (req, res, next) => {
  try {
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
        message: 'Not authorized to access this content'
      });
    }

    res.status(200).json({
      success: true,
      data: content.analytics
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update content analytics
// @route   PUT /api/content/:id/analytics
// @access  Private
exports.updateContentAnalytics = async (req, res, next) => {
  try {
    const { analytics } = req.body;
    
    let content = await Content.findById(req.params.id);
    
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
        message: 'Not authorized to update this content'
      });
    }
    
    // Update analytics
    content = await Content.findByIdAndUpdate(
      req.params.id, 
      { analytics }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: content.analytics
    });
  } catch (err) {
    next(err);
  }
};
