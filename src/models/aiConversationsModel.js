const db = require('../config/db');

// Helper function to add column if not exists
const addColumnIfNotExists = async (table, column, type) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ? AND TABLE_SCHEMA = DATABASE()`,
    [table, column]
  );
  if (rows[0].count === 0) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
};

// Ensure table exists (idempotent)
const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      case_id VARCHAR(255) NULL,
      message TEXT,
      answer LONGTEXT,
      sources JSON NULL,
      context JSON NULL,
      attachments JSON NULL,
      history JSON NULL,
      usage_tokens JSON NULL,
      table_data JSON NULL,
      raw_data JSON NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_case_id (case_id),
      INDEX idx_user_case (user_id, case_id)
    )
  `);

  // Add new columns if migrating an existing table
  await addColumnIfNotExists('ai_conversations', 'table_data', 'JSON NULL');
  await addColumnIfNotExists('ai_conversations', 'raw_data', 'JSON NULL');
};

ensureTable().catch((err) => console.error('Failed to ensure ai_conversations table:', err));

const saveConversation = async (record) => {
  const {
    userId,
    caseId,
    message,
    answer,
    sources = [],
    context = null,
    attachments = [],
    history = [],
    usage = null,
    table = null,
    rawData = null
  } = record;

  await db.query(
    `INSERT INTO ai_conversations 
     (user_id, case_id, message, answer, sources, context, attachments, history, usage_tokens, table_data, raw_data)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId || null,
      caseId || null,
      message || '',
      answer || '',
      JSON.stringify(sources || []),
      context ? JSON.stringify(context) : null,
      JSON.stringify(attachments || []),
      JSON.stringify(history || []),
      usage ? JSON.stringify(usage) : null,
      table ? JSON.stringify(table) : null,
      rawData ? JSON.stringify(rawData) : null
    ]
  );
};

const getConversationsByCase = async (caseId, limit = 50) => {
  const [rows] = await db.query(
    `SELECT id, user_id AS userId, case_id AS caseId, message, answer, sources, context, attachments, history, usage_tokens AS usage, table_data, raw_data, created_at
     FROM ai_conversations
     WHERE case_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [caseId, limit]
  );

  return rows.map((row) => ({
    ...row,
    sources: row.sources ? JSON.parse(row.sources) : [],
    context: row.context ? JSON.parse(row.context) : null,
    attachments: row.attachments ? JSON.parse(row.attachments) : [],
    history: row.history ? JSON.parse(row.history) : [],
    usage: row.usage ? JSON.parse(row.usage) : null,
    table: row.table_data ? JSON.parse(row.table_data) : null,
    rawData: row.raw_data ? JSON.parse(row.raw_data) : null
  }));
};

const getHistoryMessages = async (caseId, limit = 12) => {
  if (!caseId) return [];
  const [rows] = await db.query(
    `SELECT message, answer, created_at 
     FROM ai_conversations
     WHERE case_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [caseId, limit]
  );

  // Return as conversational turns: interleave user/assistant
  const history = [];
  rows.reverse().forEach((row) => {
    if (row.message) {
      history.push({ role: 'user', content: row.message, created_at: row.created_at });
    }
    if (row.answer) {
      history.push({ role: 'assistant', content: row.answer, created_at: row.created_at });
    }
  });
  return history;
};

module.exports = {
  saveConversation,
  getConversationsByCase,
  getHistoryMessages
};
