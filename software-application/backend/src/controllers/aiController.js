const AIManager = require('../services/ai/aiManager');
const Content = require('../models/Content');
const User = require('../models/User');

// @desc    Generate content using AI
// @route   POST /api/ai/generate
// @access  Private
exports.generateContent = async (req, res, next) => {
  try {
    const {
      topic,
      platforms,
      contentTypes,
      tone,
      keywords,
      preferredAiModel,
      generateImages,
      includeResearch
    } = req.body;
    
    // Validate required fields
    if (!topic || !platforms || !contentTypes || !tone || !preferredAiModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      claude: user.apiKeys?.claude,
      perplexity: user.apiKeys?.perplexity,
      midjourney: user.apiKeys?.midjourney
    };
    
    // Check if user has the required API key for preferred model
    if (!apiKeys[preferredAiModel]) {
      return res.status(400).json({
        success: false,
        message: `API key for ${preferredAiModel} is not configured`
      });
    }
    
    // Initialize AI manager
    const aiManager = new AIManager(apiKeys);
    
    // Generate content package
    const contentPackage = await aiManager.generateContentPackage({
      topic,
      platforms,
      contentTypes,
      tone,
      keywords,
      preferredAiModel,
      generateImages,
      includeResearch
    });
    
    // Create content entries in database
    const contentEntries = [];
    
    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        const content = contentPackage.generatedContent[platform][contentType];
        
        // Skip if content wasn't generated
        if (!content) continue;
        
        // Determine title based on content type
        let title = `${topic} - ${platform} ${contentType}`;
        if (contentType === 'blog' || contentType === 'article') {
          // Extract title from the first line of the content
          const firstLine = content.split('\n')[0];
          if (firstLine.startsWith('# ')) {
            title = firstLine.substring(2);
          }
        }
        
        // Get image URL if available
        const mediaUrls = [];
        if (contentPackage.images[`${platform}_${contentType}`]) {
          mediaUrls.push(contentPackage.images[`${platform}_${contentType}`][0].url);
        }
        
        // Create content entry
        const contentEntry = await Content.create({
          title,
          description: `AI-generated ${contentType} for ${platform}`,
          content,
          contentType,
          platforms: [platform],
          status: 'pending_approval',
          tone,
          keywords,
          aiModel: preferredAiModel,
          mediaUrls,
          user: req.user.id
        });
        
        contentEntries.push(contentEntry);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Content generated successfully',
      data: {
        contentEntries,
        research: contentPackage.research
      }
    });
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating content',
      error: err.message
    });
  }
};

// @desc    Generate content ideas using AI
// @route   POST /api/ai/ideas
// @access  Private
exports.generateContentIdeas = async (req, res, next) => {
  try {
    const { topic, contentType, tone, count, preferredAiModel } = req.body;
    
    // Validate required fields
    if (!topic || !contentType || !tone || !preferredAiModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      claude: user.apiKeys?.claude,
      perplexity: user.apiKeys?.perplexity
    };
    
    // Check if user has the required API key for preferred model
    if (!apiKeys[preferredAiModel]) {
      return res.status(400).json({
        success: false,
        message: `API key for ${preferredAiModel} is not configured`
      });
    }
    
    // Initialize AI manager
    const aiManager = new AIManager(apiKeys);
    
    // Generate content ideas
    const ideas = await aiManager.generateContentIdeas(
      topic,
      contentType,
      tone,
      count || 5,
      preferredAiModel
    );
    
    res.status(200).json({
      success: true,
      data: ideas
    });
  } catch (err) {
    console.error('Error generating content ideas:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating content ideas',
      error: err.message
    });
  }
};

// @desc    Research topic using AI
// @route   POST /api/ai/research
// @access  Private
exports.researchTopic = async (req, res, next) => {
  try {
    const { topic, depth, preferredAiModel } = req.body;
    
    // Validate required fields
    if (!topic || !preferredAiModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      claude: user.apiKeys?.claude,
      perplexity: user.apiKeys?.perplexity
    };
    
    // Check if user has the required API key for preferred model
    if (!apiKeys[preferredAiModel]) {
      return res.status(400).json({
        success: false,
        message: `API key for ${preferredAiModel} is not configured`
      });
    }
    
    // Initialize AI manager
    const aiManager = new AIManager(apiKeys);
    
    // Research topic
    const research = await aiManager.researchTopic(
      topic,
      depth || 'comprehensive',
      preferredAiModel
    );
    
    res.status(200).json({
      success: true,
      data: research
    });
  } catch (err) {
    console.error('Error researching topic:', err);
    res.status(500).json({
      success: false,
      message: 'Error researching topic',
      error: err.message
    });
  }
};

// @desc    Improve content using AI
// @route   POST /api/ai/improve
// @access  Private
exports.improveContent = async (req, res, next) => {
  try {
    const { contentId, feedback, preferredAiModel } = req.body;
    
    // Validate required fields
    if (!contentId || !feedback || !preferredAiModel) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get the content
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
        message: 'Not authorized to improve this content'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      claude: user.apiKeys?.claude,
      perplexity: user.apiKeys?.perplexity
    };
    
    // Check if user has the required API key for preferred model
    if (!apiKeys[preferredAiModel]) {
      return res.status(400).json({
        success: false,
        message: `API key for ${preferredAiModel} is not configured`
      });
    }
    
    // Initialize AI manager
    const aiManager = new AIManager(apiKeys);
    
    // Improve content
    const improvedContent = await aiManager.improveContent(
      content.content,
      feedback,
      preferredAiModel
    );
    
    // Update content
    content.content = improvedContent;
    content.aiModel = preferredAiModel;
    await content.save();
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (err) {
    console.error('Error improving content:', err);
    res.status(500).json({
      success: false,
      message: 'Error improving content',
      error: err.message
    });
  }
};

// @desc    Generate image using AI
// @route   POST /api/ai/image
// @access  Private
exports.generateImage = async (req, res, next) => {
  try {
    const { 
      prompt, 
      type, 
      platform, 
      title, 
      style, 
      preferredImageService 
    } = req.body;
    
    // Validate required fields
    if (!prompt || !type || !preferredImageService) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Get user's API keys
    const user = await User.findById(req.user.id);
    const apiKeys = {
      openai: user.apiKeys?.openai,
      midjourney: user.apiKeys?.midjourney,
      stability: user.apiKeys?.stability
    };
    
    // Map service name to API key field
    const serviceToKeyMap = {
      imageOpenAI: 'openai',
      imageMidjourney: 'midjourney',
      imageStability: 'stability'
    };
    
    // Check if user has the required API key for preferred service
    const requiredKey = serviceToKeyMap[preferredImageService];
    if (!requiredKey || !apiKeys[requiredKey]) {
      return res.status(400).json({
        success: false,
        message: `API key for ${preferredImageService} is not configured`
      });
    }
    
    // Initialize AI manager
    const aiManager = new AIManager(apiKeys);
    
    let imageResult;
    
    // Generate image based on type
    if (type === 'social') {
      imageResult = await aiManager.generateSocialMediaImage(
        prompt,
        platform,
        style || 'modern',
        {},
        preferredImageService
      );
    } else if (type === 'blog') {
      imageResult = await aiManager.generateBlogHeaderImage(
        title || prompt,
        style || 'professional',
        {},
        preferredImageService
      );
    } else {
      // Generic image generation
      const service = aiManager.getImageService(preferredImageService);
      imageResult = await service.generateImage(prompt);
    }
    
    res.status(200).json({
      success: true,
      data: imageResult
    });
  } catch (err) {
    console.error('Error generating image:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating image',
      error: err.message
    });
  }
};
