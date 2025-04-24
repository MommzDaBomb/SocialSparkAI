const axios = require('axios');

class ImageGenerationService {
  constructor(apiKey, service = 'openai') {
    this.apiKey = apiKey;
    this.service = service;
    
    // Set base URL based on service
    if (service === 'openai') {
      this.baseURL = 'https://api.openai.com/v1';
    } else if (service === 'midjourney') {
      // Note: This is a placeholder as Midjourney doesn't have a direct API
      // In a real implementation, this would connect to a Midjourney API proxy
      this.baseURL = 'https://api.midjourney-proxy.example.com';
    } else if (service === 'stability') {
      this.baseURL = 'https://api.stability.ai/v1';
    }
  }

  async generateImage(prompt, options = {}) {
    try {
      if (this.service === 'openai') {
        return await this.generateOpenAIImage(prompt, options);
      } else if (this.service === 'midjourney') {
        return await this.generateMidjourneyImage(prompt, options);
      } else if (this.service === 'stability') {
        return await this.generateStabilityImage(prompt, options);
      } else {
        throw new Error(`Unsupported image generation service: ${this.service}`);
      }
    } catch (error) {
      console.error(`Error generating image with ${this.service}:`, error.response?.data || error.message);
      throw new Error(`Failed to generate image with ${this.service}`);
    }
  }

  async generateOpenAIImage(prompt, options = {}) {
    const defaultOptions = {
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      n: 1
    };

    const requestOptions = { ...defaultOptions, ...options };

    const response = await axios.post(
      `${this.baseURL}/images/generations`,
      {
        model: requestOptions.model,
        prompt,
        n: requestOptions.n,
        size: requestOptions.size,
        quality: requestOptions.quality
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return response.data.data.map(item => ({
      url: item.url,
      service: 'openai',
      model: requestOptions.model
    }));
  }

  async generateMidjourneyImage(prompt, options = {}) {
    // This is a placeholder implementation
    // In a real application, this would connect to a Midjourney API proxy
    const defaultOptions = {
      version: 'v5',
      quality: 'standard',
      style: 'raw'
    };

    const requestOptions = { ...defaultOptions, ...options };

    const response = await axios.post(
      `${this.baseURL}/generate`,
      {
        prompt,
        version: requestOptions.version,
        quality: requestOptions.quality,
        style: requestOptions.style
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return response.data.images.map(item => ({
      url: item.url,
      service: 'midjourney',
      model: requestOptions.version
    }));
  }

  async generateStabilityImage(prompt, options = {}) {
    const defaultOptions = {
      engine_id: 'stable-diffusion-xl-1024-v1-0',
      width: 1024,
      height: 1024,
      samples: 1
    };

    const requestOptions = { ...defaultOptions, ...options };

    const response = await axios.post(
      `${this.baseURL}/generation/${requestOptions.engine_id}/text-to-image`,
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: requestOptions.height,
        width: requestOptions.width,
        samples: requestOptions.samples,
        steps: 30
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return response.data.artifacts.map(item => ({
      url: `data:image/png;base64,${item.base64}`,
      service: 'stability',
      model: requestOptions.engine_id
    }));
  }

  async generateSocialMediaImage(topic, platform, style = 'modern', options = {}) {
    // Platform-specific dimensions and styles
    const platformSpecs = {
      linkedin: {
        description: 'professional, business-oriented',
        dimensions: '1200x627'
      },
      twitter: {
        description: 'engaging, attention-grabbing',
        dimensions: '1200x675'
      },
      facebook: {
        description: 'social, friendly',
        dimensions: '1200x630'
      },
      instagram: {
        description: 'visually striking, aesthetic',
        dimensions: '1080x1080'
      },
      pinterest: {
        description: 'inspirational, detailed',
        dimensions: '1000x1500'
      }
    };

    const specs = platformSpecs[platform.toLowerCase()] || { 
      description: 'social media appropriate', 
      dimensions: '1200x630' 
    };

    // Construct a detailed prompt
    const prompt = `Create a ${style} style image for a ${platform} post about "${topic}". The image should be ${specs.description} and optimized for ${platform}. ${options.additionalDetails || ''}`;

    // Set size based on platform if using OpenAI
    if (this.service === 'openai') {
      // DALL-E has limited size options, so we'll use the closest match
      options.size = '1024x1024'; // Default square
      if (platform.toLowerCase() === 'pinterest') {
        options.size = '1024x1792'; // Portrait
      }
    }

    return this.generateImage(prompt, options);
  }

  async generateBlogHeaderImage(title, style = 'professional', options = {}) {
    const prompt = `Create a ${style} header image for a blog post titled "${title}". The image should be eye-catching, relevant to the topic, and suitable as a featured image. ${options.additionalDetails || ''}`;
    
    // Set appropriate size for blog headers
    if (this.service === 'openai') {
      options.size = '1792x1024'; // Landscape
    }

    return this.generateImage(prompt, options);
  }

  async generateProductImage(productDescription, style = 'realistic', options = {}) {
    const prompt = `Create a ${style} product image of ${productDescription}. The product should be the main focus, well-lit, with a clean background. ${options.additionalDetails || ''}`;
    
    return this.generateImage(prompt, options);
  }
}

module.exports = ImageGenerationService;
