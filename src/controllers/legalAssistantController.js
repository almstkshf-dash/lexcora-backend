const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

const SYSTEM_PROMPT = `
You are a helpful legal assistant specializing in UAE legislation.

- All answers must be based strictly on:
  * The official UAE legislation portal: https://uaelegislation.gov.ae/
  * Or the official UAE Ministry of Justice website: https://www.moj.gov.ae/
  * Or on well-established and verifiable legal principles in the UAE.

- When answering, always cite:
  * The exact law name or number (e.g., Law No. 10 of 2023)
  * The exact article number (e.g., Article 5)
  * And reference that the source is from uaelegislation.gov.ae or moj.gov.ae

  Example citation format:
  "Article 5 of Law No. 10 of 2023 via uaelegislation.gov.ae"
  "Article 12 of Federal Decree-Law No. 34 of 2022 via moj.gov.ae"

- If you cannot find a valid legal reference, you must clearly say:
  "I do not have enough information to answer based on UAE legislation."
  Do not invent any law or article.

- Respond in the same language as the user's question (Arabic or English).

- Format your answer using clean markdown:
  * Titles
  * Bullet points
  * **Bold text**

- Your final response MUST be a JSON object with two keys:
  {
    "answer": "your explanation here",
    "sources": "your legal sources here"
  }

- Keep your tone professional, accurate, and legally compliant.
`;

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

/**
 * POST /api/legal-assistant
 * Chat with the legal assistant
 */
const chat = async (req, res) => {
  try {
    const { message, userName, userId, history } = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      throw new AppError(req.t('generic.validationError'), 400, 'VALIDATION_ERROR');
    }

    // Check if OpenAI is configured
    if (!openai) {
      throw new AppError(req.t('ai.genericError'), 503, 'SERVICE_UNAVAILABLE');
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // Add previous messages for context (limit to last 10 messages)
    if (history && Array.isArray(history)) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add the current user message
    messages.push({
      role: 'user',
      content: message,
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    // Try to parse JSON response
    let answer = responseContent;
    let sources = '';

    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*"answer"[\s\S]*"sources"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        answer = parsed.answer || responseContent;
        sources = parsed.sources || '';
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from OpenAI response, using raw content');
    }

    // Log the conversation (optional)

    return res.success({ answer, sources, usage: completion.usage }, req.t('ai.reply'));
  } catch (error) {
    console.error('Error in legal assistant controller:', error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.fail(req.t('ai.quotaExceeded'), 429, 'AI_QUOTA_EXCEEDED', {
        answer: req.t('ai.insufficientInfo'),
        sources: '',
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.fail(req.t('ai.invalidKey'), 401, 'AI_AUTH_ERROR', {
        answer: req.t('ai.insufficientInfo'),
        sources: '',
      });
    }

    // Generic error
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : req.t('ai.genericError');
    return res.fail(message, status, 'AI_GENERIC_ERROR', {
      answer: req.t('ai.insufficientInfo'),
      sources: '',
    });
  }
};

module.exports = {
  chat,
};

