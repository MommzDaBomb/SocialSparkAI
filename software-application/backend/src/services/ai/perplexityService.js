const axios = require('axios');

class PerplexityService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.perplexity.ai';
  }

  async generateContent(prompt, options = {}) {
    try {
      const defaultOptions = {
        model: 'sonar-medium-online',
        max_tokens: 1000,
        temperature: 0.7
      };

      const requestOptions = { ...defaultOptions, ...options };

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: requestOptions.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: requestOptions.max_tokens,
          temperature: requestOptions.temperature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating content with Perplexity:', error.response?.data || error.message);
      throw new Error('Failed to generate content with Perplexity');
    }
  }

  async researchTopic(topic, depth = 'comprehensive') {
    let detailLevel = '';
    if (depth === 'brief') {
      detailLevel = 'Provide a brief overview with key points.';
    } else if (depth === 'comprehensive') {
      detailLevel = 'Provide a comprehensive analysis with detailed information.';
    } else if (depth === 'expert') {
      detailLevel = 'Provide an expert-level analysis with in-depth insights and nuanced perspectives.';
    }

    const prompt = `Research the topic "${topic}" and provide the following information:
1. Key facts and statistics
2. Current trends and developments
3. Historical context and background
4. Expert opinions and different perspectives
5. Practical applications or implications
6. Future outlook

${detailLevel}
Format the research with proper Markdown headings, bullet points, and citations where appropriate.`;
    
    return this.generateContent(prompt, {
      temperature: 0.3,
      max_tokens: 2000
    });
  }

  async analyzeCompetitors(topic, industry) {
    const prompt = `Analyze competitors in the ${industry} industry related to "${topic}". For each major competitor, provide:
1. Their content strategy
2. Social media presence and engagement metrics
3. Content types and formats they use
4. Their unique selling proposition
5. Strengths and weaknesses in their approach

Conclude with actionable insights that could be applied to create more effective content.`;
    
    return this.generateContent(prompt, {
      temperature: 0.4,
      max_tokens: 1500
    });
  }

  async generateKeywordAnalysis(topic) {
    const prompt = `Perform a keyword analysis for the topic "${topic}". Include:
1. Primary keywords with high search volume
2. Secondary and long-tail keywords
3. Trending keywords in this space
4. Keyword difficulty assessment
5. Content opportunities based on keyword gaps

Format the analysis with proper Markdown formatting and organize keywords by relevance and search intent.`;
    
    return this.generateContent(prompt, {
      temperature: 0.4,
      max_tokens: 1000
    });
  }

  async generateContentStrategy(topic, platforms, goals) {
    const platformsText = platforms.join(', ');
    const goalsText = goals.join(', ');
    
    const prompt = `Create a comprehensive content strategy for "${topic}" across these platforms: ${platformsText}. The primary goals are: ${goalsText}.

Include the following sections:
1. Target audience analysis
2. Content pillars and themes
3. Content mix recommendations (formats and types)
4. Posting frequency and schedule
5. Key performance indicators
6. Content distribution strategy
7. Engagement tactics

Provide specific recommendations for each platform mentioned.`;
    
    return this.generateContent(prompt, {
      temperature: 0.5,
      max_tokens: 2000
    });
  }

  async answerContentQuestions(topic, questions) {
    const questionsText = questions.join('\n');
    
    const prompt = `Answer the following questions about creating content for "${topic}":\n${questionsText}\n\nProvide detailed, well-researched answers with examples where appropriate.`;
    
    return this.generateContent(prompt, {
      temperature: 0.4,
      max_tokens: 1500
    });
  }
}

module.exports = PerplexityService;
