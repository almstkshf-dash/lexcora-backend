const OpenAI = require('openai');
const { AppError } = require('../utils/errors');

const SYSTEM_PROMPT = `
You are a helpful legal assistant specializing in UAE legislation.

- Ground every response in the provided case context (case summary, sessions, memos, petitions, deadlines, history). If context is missing, be explicit about what is missing.
- Uploaded attachments (PDF/DOC/TXT) may accompany the message; prefer them when relevant and cite with page/chunk if provided.
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
- If you cannot find a valid legal reference, clearly say:
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
    "sources": [
      { "title": "law or context source", "id": "article or internal id", "url": "https://...", "page": "if available", "chunk": "if available", "snippet": "short quoted text if available" }
    ]
  }
- Include sources for UAE legal citations, case context items (sessions, memos, petitions, deadlines), and any uploaded attachments you reference (with page/chunk if provided).
- Keep your tone professional, accurate, and legally compliant.
`;

const MAX_HISTORY = 12;
const MAX_CONTEXT_ITEMS = 5;
const MAX_SOURCE_ITEMS = 10;
const MAX_ATTACHMENT_ITEMS = 5;

// Initialize OpenAI client
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

const normalizeHistory = (history, caseId) => {
  if (Array.isArray(history)) {
    return history;
  }

  if (history && typeof history === 'object') {
    if (caseId && Array.isArray(history[caseId])) {
      return history[caseId];
    }

    const keyedHistory = Object.values(history).find((value) => Array.isArray(value));
    if (keyedHistory) {
      return keyedHistory;
    }
  }

  return [];
};

const compactItemSummary = (item) => {
  if (!item) return '';
  if (typeof item === 'string') return item;

  if (typeof item === 'object') {
    const fields = ['id', 'title', 'name', 'number', 'type', 'status', 'date', 'deadline', 'url', 'summary', 'notes'];
    const parts = fields
      .map((field) => {
        if (item[field]) {
          return `${field}: ${item[field]}`;
        }
        return null;
      })
      .filter(Boolean);

    return parts.join(', ');
  }

  return '';
};

const formatList = (items, label) => {
  if (!Array.isArray(items) || items.length === 0) return '';
  const list = items.slice(0, MAX_CONTEXT_ITEMS).map((item) => `- ${compactItemSummary(item)}`).join('\n');
  return `${label}:\n${list}`;
};

const formatCaseSummary = (caseSummary) => {
  if (!caseSummary) return '';
  if (typeof caseSummary === 'string') return caseSummary;
  if (typeof caseSummary === 'object') {
    return Object.entries(caseSummary)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
  }
  return '';
};

const buildContextSummary = (context) => {
  if (!context || typeof context !== 'object') {
    return '';
  }

  const sections = [];

  if (context.caseId) {
    sections.push(`Case ID: ${context.caseId}`);
  }

  const summary = formatCaseSummary(context.caseSummary);
  if (summary) {
    sections.push(`Case summary: ${summary}`);
  }

  const sessions = formatList(context.sessions, 'Sessions');
  if (sessions) {
    sections.push(sessions);
  }

  const deadlines = formatList(context.deadlines, 'Deadlines');
  if (deadlines) {
    sections.push(deadlines);
  }

  const memos = formatList(context.memos, 'Memos');
  if (memos) {
    sections.push(memos);
  }

  const petitions = formatList(context.petitions, 'Petitions');
  if (petitions) {
    sections.push(petitions);
  }

  if (context.fetchedAt) {
    sections.push(`Context fetched at: ${context.fetchedAt}`);
  }

  if (sections.length === 0) {
    return '';
  }

  return `Use the following case context to ground your answer and citations:\n${sections.join('\n')}`;
};

const buildAttachmentsSummary = (attachments) => {
  if (!Array.isArray(attachments) || attachments.length === 0) {
    return '';
  }

  const limited = attachments.slice(0, MAX_ATTACHMENT_ITEMS);
  const list = limited
    .map((att, idx) => {
      const name = att.document_name || att.name || `Attachment ${idx + 1}`;
      const url = att.document_url || att.url || '';
      const page = att.page ? ` (page ${att.page})` : '';
      return `- ${name}${page}${url ? ` -> ${url}` : ''}`;
    })
    .join('\n');

  return `User uploaded attachments available for reference:\n${list}`;
};

const deriveContextSources = (context, attachments) => {
  const sources = [];

  const addItems = (items, typeLabel) => {
    if (!Array.isArray(items)) return;
    items.slice(0, MAX_CONTEXT_ITEMS).forEach((item) => {
      const title = compactItemSummary(item) || typeLabel;
      const id = (item && (item.id || item._id || item.number || item.title || item.name || item.deadline)) || typeLabel;
      const url = (item && (item.url || item.document_url)) || '';
      const page = item && item.page ? item.page : undefined;
      const chunk = item && item.chunk ? item.chunk : undefined;
      const snippet = item && item.snippet ? item.snippet : undefined;
      sources.push({ title, id, url, page, chunk, snippet, type: typeLabel.toLowerCase() });
    });
  };

  if (context && typeof context === 'object') {
    if (context.caseId) {
      sources.push({ title: 'Case context', id: context.caseId, url: '', type: 'case' });
    }

    addItems(context.sessions, 'Session');
    addItems(context.deadlines, 'Deadline');
    addItems(context.memos, 'Memo');
    addItems(context.petitions, 'Petition');
  }

  addItems(attachments, 'Attachment');

  return sources.slice(0, MAX_SOURCE_ITEMS);
};

/**
 * POST /api/legal-assistant
 * Chat with the legal assistant
 */
const chat = async (req, res) => {
  try {
    const { message, userName, userId, history, context, attachments } = req.body;
    const caseId = context?.caseId || req.body.caseId;

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

    const contextSummary = buildContextSummary(context);
    if (contextSummary) {
      messages.push({
        role: 'system',
        content: contextSummary,
      });
    }

    const attachmentsSummary = buildAttachmentsSummary(attachments);
    if (attachmentsSummary) {
      messages.push({
        role: 'system',
        content: attachmentsSummary,
      });
    }

    // Normalize history (per-case or global) and keep recent entries
    const allowedRoles = new Set(['user', 'assistant', 'system']);
    const normalizedHistory = normalizeHistory(history, caseId)
      .filter((msg) => msg && allowedRoles.has(msg.role) && msg.content)
      .slice(-MAX_HISTORY);

    normalizedHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: String(msg.content),
      });
    });

    const lastHistoryContent = normalizedHistory.length
      ? String(normalizedHistory[normalizedHistory.length - 1].content)
      : '';
    const shouldAppendMessage = typeof message === 'string' && message !== lastHistoryContent;

    if (shouldAppendMessage) {
      messages.push({
        role: 'user',
        content: message,
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: messages,
      temperature: 0.25,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content || '';

    // Try to parse JSON response
    let answer = responseContent;
    let sources = [];

    try {
      const parsed = JSON.parse(responseContent);
      answer = parsed.answer || responseContent;
      if (Array.isArray(parsed.sources)) {
        sources = parsed.sources;
      } else if (parsed.sources) {
        sources = [
          {
            title: typeof parsed.sources === 'string' ? parsed.sources : 'source',
            id: '',
            url: '',
          },
        ];
      }
    } catch (parseError) {
      console.warn('Could not parse JSON from OpenAI response, using raw content');
    }

    const contextSources = deriveContextSources(context, attachments);
    if (contextSources.length) {
      const combinedSources = [...sources, ...contextSources];
      sources = combinedSources.slice(0, MAX_SOURCE_ITEMS);
    }

    // Minimal format validation
    if (typeof answer !== 'string' || !Array.isArray(sources)) {
      return res.fail('Invalid AI response format', 502, 'AI_BAD_FORMAT');
    }

    // Ensure strings and surface top-level fields for frontend compatibility
    answer = answer || '';
    sources = sources || [];

    // Log the conversation (optional) - prefer context caseId when auditing
    const transcriptMeta = {
      caseId: caseId || 'unspecified',
      userName,
      userId,
    };

    return res.status(200).json({
      success: true,
      message: req.t('ai.reply'),
      answer,
      sources,
      usage: completion.usage,
      data: { answer, sources, usage: completion.usage, caseId: transcriptMeta.caseId }
    });
  } catch (error) {
    console.error('Error in legal assistant controller:', error);

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return res.fail(req.t('ai.quotaExceeded'), 429, 'AI_QUOTA_EXCEEDED', {
        answer: req.t('ai.insufficientInfo'),
        sources: [],
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.fail(req.t('ai.invalidKey'), 401, 'AI_AUTH_ERROR', {
        answer: req.t('ai.insufficientInfo'),
        sources: [],
      });
    }

    // Generic error
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof AppError ? error.message : req.t('ai.genericError');
    return res.fail(message, status, 'AI_GENERIC_ERROR', {
      answer: req.t('ai.insufficientInfo'),
      sources: [],
    });
  }
};

module.exports = {
  chat,
};

