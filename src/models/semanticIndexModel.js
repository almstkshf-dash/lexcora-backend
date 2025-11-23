const db = require('../config/db');

const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS semantic_index (
      id INT AUTO_INCREMENT PRIMARY KEY,
      source_type VARCHAR(50) NOT NULL,
      source_id VARCHAR(255) NOT NULL,
      title TEXT NOT NULL,
      content LONGTEXT NOT NULL,
      url TEXT DEFAULT NULL,
      metadata JSON NULL,
      chunk_index INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_source_chunk (source_type, source_id, chunk_index),
      FULLTEXT KEY ft_title_content (title, content)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `).catch((err) => {
    // Fall back to non-FTS table creation for MySQL versions that don't support it
    console.warn('semantic_index: could not create fulltext index, falling back to basic table:', err?.message);
    return db.query(`
      CREATE TABLE IF NOT EXISTS semantic_index (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source_type VARCHAR(50) NOT NULL,
        source_id VARCHAR(255) NOT NULL,
        title TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        url TEXT DEFAULT NULL,
        metadata JSON NULL,
        chunk_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_source_chunk (source_type, source_id, chunk_index)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  });
};

ensureTable().catch((err) => console.error('Failed to ensure semantic_index table:', err));

const upsertChunk = async (chunk) => {
  const {
    sourceType,
    sourceId,
    title,
    content,
    url = null,
    metadata = null,
    chunkIndex = 0
  } = chunk;

  if (!sourceType || !sourceId || !title || !content) {
    return;
  }

  await db.query(
    `
    INSERT INTO semantic_index (source_type, source_id, title, content, url, metadata, chunk_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      content = VALUES(content),
      url = VALUES(url),
      metadata = VALUES(metadata),
      updated_at = CURRENT_TIMESTAMP
    `,
    [
      sourceType,
      sourceId,
      title,
      content,
      url,
      metadata ? JSON.stringify(metadata) : null,
      chunkIndex
    ]
  );
};

const bulkUpsert = async (chunks = []) => {
  for (const chunk of chunks) {
    try {
      await upsertChunk(chunk);
    } catch (err) {
      console.warn('semantic_index: failed to upsert chunk', chunk?.sourceId, err?.message);
    }
  }
};

const search = async (query, { limit = 10 } = {}) => {
  const term = `%${query}%`;
  try {
    const [rows] = await db.query(
      `
      SELECT *,
        (CASE WHEN title LIKE ? THEN 2 ELSE 0 END +
         CASE WHEN content LIKE ? THEN 1 ELSE 0 END) AS relevance
      FROM semantic_index
      WHERE title LIKE ? OR content LIKE ?
      ORDER BY relevance DESC, updated_at DESC
      LIMIT ?
      `,
      [term, term, term, term, limit]
    );
    return rows;
  } catch (err) {
    console.warn('semantic_index: basic LIKE search failed, attempting fallback:', err?.message);
    const [rows] = await db.query(
      `
      SELECT *,
        0 as relevance
      FROM semantic_index
      ORDER BY updated_at DESC
      LIMIT ?
      `,
      [limit]
    );
    return rows;
  }
};

module.exports = {
  upsertChunk,
  bulkUpsert,
  search
};
