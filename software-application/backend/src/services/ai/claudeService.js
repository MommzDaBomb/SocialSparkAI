const axios = require('axios');

class ClaudeService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async generateContent(prompt, options = {}) {
    try {
      const defaultOptions = {
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1
      };

      const requestOptions = { ...defaultOptions, ...options };

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: requestOptions.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: requestOptions.max_tokens,
          temperature: requestOptions.temperature,
          top_p: requestOptions.top_p
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Error generating content with Claude:', error.response?.data || error.message);
      throw new Error('Failed to generate content with Claude');
    }
  }

  async generateContentIdeas(topic, contentType, tone, count = 5) {
    const prompt = `Generate ${count} creative content ideas for ${contentType} about "${topic}" in a ${tone} tone. For each idea, provide a compelling title and a brief description.`;
    
    return this.generateContent(prompt, {
      temperature: 0.8,
      max_tokens: 500
    });
  }

  async generateSocialMediaPost(topic, platform, tone, keywords = []) {
    const keywordsText = keywords.length > 0 ? `Include these keywords if possible: ${keywords.join(', ')}.` : '';
    
    const platformGuidelines = {
      linkedin: 'Professional tone, up to 3000 characters, can include hashtags (3-5 recommended).',
      twitter: 'Concise (max 280 characters), engaging, can include hashtags (1-2 recommended).',
      facebook: 'Conversational, can be longer form, can include hashtags (2-3 recommended).',
      instagram: 'Visual-focused caption, can include hashtags (up to 30, but 5-10 recommended).',
      tiktok: 'Very casual, trendy, short and catchy.'
    };

    const prompt = `Create a ${platform} post about "${topic}" in a ${tone} tone. ${platformGuidelines[platform.toLowerCase()] || ''} ${keywordsText}`;
    
    return this.generateContent(prompt, {
      temperature: 0.7,
      max_tokens: 500
    });
  }

  async generateBlogPost(topic, tone, keywords = [], wordCount = 800) {
    const keywordsText = keywords.length > 0 ? `Include these keywords naturally throughout the text: ${keywords.join(', ')}.` : '';
    
    const prompt = `Write a comprehensive blog post about "${topic}" in a ${tone} tone. The blog post should be approximately ${wordCount} words. Include a catchy title, an engaging introduction, 3-5 main sections with subheadings, and a conclusion. ${keywordsText} Format the blog post with proper Markdown formatting.`;
    
    return this.generateContent(prompt, {
      temperature: 0.7,
      max_tokens: 2000
    });
  }

  async generateVideoScript(topic, tone, duration = 'short', keywords = []) {
    const keywordsText = keywords.length > 0 ? `Include these keywords naturally throughout the script: ${keywords.join(', ')}.` : '';
    
    let durationText = 'a 1-2 minute';
    if (duration === 'medium') durationText = 'a 3-5 minute';
    if (duration === 'long') durationText = 'a 7-10 minute';
    
    const prompt = `Create a script for ${durationText} video about "${topic}" in a ${tone} tone. The script should include an attention-grabbing hook, main content sections, and a strong call to action. ${keywordsText} Format the script with [VISUAL DIRECTION] cues in brackets where appropriate.`;
    
    return this.generateContent(prompt, {
      temperature: 0.7,
      max_tokens: 1500
    });
  }

  async researchTopic(topic) {
    const prompt = `Research the topic "${topic}" and provide a comprehensive overview including:
1. Key facts and statistics
2. Current trends
3. Common questions people have about this topic
4. Potential content angles or perspectives
5. Recommended subtopics to explore

Format the research with proper Markdown headings and bullet points.`;
    
    return this.generateContent(prompt, {
      temperature: 0.5,
      max_tokens: 1500
    });
  }

  async improveContent(content, feedback) {
    const prompt = `Improve the following content based on this feedback: "${feedback}"\n\nOriginal content:\n${content}`;
    
    return this.generateContent(prompt, {
      temperature: 0.7,
      max_tokens: 1500
    });
  }
}

module.exports = ClaudeService;
