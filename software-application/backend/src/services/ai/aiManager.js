const OpenAIService = require('./openaiService');
const ClaudeService = require('./claudeService');
const PerplexityService = require('./perplexityService');
const ImageGenerationService = require('./imageGenerationService');

class AIManager {
  constructor(apiKeys = {}) {
    this.apiKeys = apiKeys;
    this.services = {};
    
    // Initialize available services based on API keys
    if (apiKeys.openai) {
      this.services.openai = new OpenAIService(apiKeys.openai);
    }
    
    if (apiKeys.claude) {
      this.services.claude = new ClaudeService(apiKeys.claude);
    }
    
    if (apiKeys.perplexity) {
      this.services.perplexity = new PerplexityService(apiKeys.perplexity);
    }
    
    if (apiKeys.openai) {
      this.services.imageOpenAI = new ImageGenerationService(apiKeys.openai, 'openai');
    }
    
    if (apiKeys.midjourney) {
      this.services.imageMidjourney = new ImageGenerationService(apiKeys.midjourney, 'midjourney');
    }
    
    if (apiKeys.stability) {
      this.services.imageStability = new ImageGenerationService(apiKeys.stability, 'stability');
    }
  }

  // Get the appropriate service based on user preference
  getTextService(preference = 'openai') {
    if (this.services[preference]) {
      return this.services[preference];
    }
    
    // Fallback to any available text service
    const availableServices = ['openai', 'claude', 'perplexity'];
    for (const service of availableServices) {
      if (this.services[service]) {
        return this.services[service];
      }
    }
    
    throw new Error('No text generation service available');
  }

  // Get the appropriate image service based on user preference
  getImageService(preference = 'imageOpenAI') {
    if (this.services[preference]) {
      return this.services[preference];
    }
    
    // Fallback to any available image service
    const availableServices = ['imageOpenAI', 'imageMidjourney', 'imageStability'];
    for (const service of availableServices) {
      if (this.services[service]) {
        return this.services[service];
      }
    }
    
    throw new Error('No image generation service available');
  }

  // Generate content ideas
  async generateContentIdeas(topic, contentType, tone, count = 5, preference = 'openai') {
    try {
      const service = this.getTextService(preference);
      return await service.generateContentIdeas(topic, contentType, tone, count);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      throw error;
    }
  }

  // Generate social media post
  async generateSocialMediaPost(topic, platform, tone, keywords = [], preference = 'openai') {
    try {
      const service = this.getTextService(preference);
      return await service.generateSocialMediaPost(topic, platform, tone, keywords);
    } catch (error) {
      console.error('Error generating social media post:', error);
      throw error;
    }
  }

  // Generate blog post
  async generateBlogPost(topic, tone, keywords = [], wordCount = 800, preference = 'openai') {
    try {
      const service = this.getTextService(preference);
      return await service.generateBlogPost(topic, tone, keywords, wordCount);
    } catch (error) {
      console.error('Error generating blog post:', error);
      throw error;
    }
  }

  // Generate video script
  async generateVideoScript(topic, tone, duration = 'short', keywords = [], preference = 'openai') {
    try {
      const service = this.getTextService(preference);
      return await service.generateVideoScript(topic, tone, duration, keywords);
    } catch (error) {
      console.error('Error generating video script:', error);
      throw error;
    }
  }

  // Research topic
  async researchTopic(topic, depth = 'comprehensive', preference = 'perplexity') {
    try {
      // Prefer Perplexity for research if available
      const preferredService = preference === 'default' ? 'perplexity' : preference;
      const service = this.getTextService(preferredService);
      
      if (service instanceof PerplexityService) {
        return await service.researchTopic(topic, depth);
      } else {
        return await service.researchTopic(topic);
      }
    } catch (error) {
      console.error('Error researching topic:', error);
      throw error;
    }
  }

  // Generate hashtags
  async generateHashtags(topic, platform, count = 10, preference = 'openai') {
    try {
      const service = this.getTextService(preference);
      if ('generateHashtags' in service) {
        return await service.generateHashtags(topic, platform, count);
      } else {
        // Fallback implementation if the service doesn't have this method
        const prompt = `Generate ${count} relevant and effective hashtags for a ${platform} post about "${topic}". Include a mix of popular and niche hashtags. Format as a simple list of hashtags.`;
        return await service.generateContent(prompt, {
          temperature: 0.6,
          max_tokens: 200
        });
      }
    } catch (error) {
      console.error('Error generating hashtags:', error);
      throw error;
    }
  }

  // Improve content based on feedback
  async improveContent(content, feedback, preference = 'claude') {
    try {
      // Prefer Claude for content improvement if available
      const preferredService = preference === 'default' ? 'claude' : preference;
      const service = this.getTextService(preferredService);
      return await service.improveContent(content, feedback);
    } catch (error) {
      console.error('Error improving content:', error);
      throw error;
    }
  }

  // Generate social media image
  async generateSocialMediaImage(topic, platform, style = 'modern', options = {}, preference = 'imageOpenAI') {
    try {
      const service = this.getImageService(preference);
      return await service.generateSocialMediaImage(topic, platform, style, options);
    } catch (error) {
      console.error('Error generating social media image:', error);
      throw error;
    }
  }

  // Generate blog header image
  async generateBlogHeaderImage(title, style = 'professional', options = {}, preference = 'imageOpenAI') {
    try {
      const service = this.getImageService(preference);
      return await service.generateBlogHeaderImage(title, style, options);
    } catch (error) {
      console.error('Error generating blog header image:', error);
      throw error;
    }
  }

  // Generate complete content package
  async generateContentPackage(data) {
    try {
      const {
        topic,
        platforms,
        contentTypes,
        tone,
        keywords,
        preferredAiModel,
        generateImages
      } = data;
      
      const results = {
        topic,
        generatedContent: {},
        images: {}
      };
      
      // Generate content for each platform and content type
      for (const platform of platforms) {
        results.generatedContent[platform] = {};
        
        for (const contentType of contentTypes) {
          let content;
          
          switch (contentType) {
            case 'social_post':
              content = await this.generateSocialMediaPost(topic, platform, tone, keywords, preferredAiModel);
              break;
            case 'blog':
              content = await this.generateBlogPost(topic, tone, keywords, 800, preferredAiModel);
              break;
            case 'article':
              content = await this.generateBlogPost(topic, tone, keywords, 1500, preferredAiModel);
              break;
            case 'video_script':
              content = await this.generateVideoScript(topic, tone, 'medium', keywords, preferredAiModel);
              break;
            case 'audiogram':
              content = await this.generateVideoScript(topic, tone, 'short', keywords, preferredAiModel);
              break;
            default:
              content = await this.generateSocialMediaPost(topic, platform, tone, keywords, preferredAiModel);
          }
          
          results.generatedContent[platform][contentType] = content;
          
          // Generate images if requested
          if (generateImages) {
            if (contentType === 'blog' || contentType === 'article') {
              const imageResult = await this.generateBlogHeaderImage(topic, 'professional');
              results.images[`${platform}_${contentType}`] = imageResult;
            } else {
              const imageResult = await this.generateSocialMediaImage(topic, platform);
              results.images[`${platform}_${contentType}`] = imageResult;
            }
          }
        }
        
        // Generate hashtags for the platform
        results.generatedContent[platform].hashtags = await this.generateHashtags(topic, platform);
      }
      
      // Add research if needed
      if (data.includeResearch) {
        results.research = await this.researchTopic(topic);
      }
      
      return results;
    } catch (error) {
      console.error('Error generating content package:', error);
      throw error;
    }
  }
}

module.exports = AIManager;
