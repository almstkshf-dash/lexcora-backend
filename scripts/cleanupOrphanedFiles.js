/* eslint-disable no-console */
// Scheduled/adhoc job to remove orphaned files from S3 that are no longer referenced in DB.
// Usage: node scripts/cleanupOrphanedFiles.js

require('dotenv').config();
const db = require('../src/config/db');
const { cleanupOrphanedFiles, extractKeyFromUrl } = require('../src/services/awsS3Service');

const TABLES = [
  { table: 'case_documents', column: 'document_url' },
  { table: 'court_case_documents', column: 'url' },
  { table: 'parties_documents', column: 'document_url' },
  { table: 'employee_documents', column: 'document_url' },
  { table: 'task_documents', column: 'document_url' },
  { table: 'review_documents', column: 'document_url' },
  { table: 'memo_documents', column: 'document_url' },
  { table: 'asset_documents', column: 'document_url' },
  { table: 'case_employees_documents', column: 'document_url' },
];

const fetchKeys = async () => {
  const keys = [];

  for (const { table, column } of TABLES) {
    try {
      const [rows] = await db.query(`SELECT ${column} AS url FROM ${table} WHERE ${column} IS NOT NULL`);
      rows.forEach((row) => {
        const key = extractKeyFromUrl(row.url);
        if (key) keys.push(key);
      });
    } catch (err) {
      console.warn(`Skipping ${table}.${column}: ${err.message}`);
    }
  }

  return Array.from(new Set(keys));
};

const main = async () => {
  try {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      console.error('AWS_S3_BUCKET_NAME is not set. Aborting cleanup.');
      process.exit(1);
    }

    console.log('Gathering known keys from database tables...');
    const knownKeys = await fetchKeys();
    console.log(`Collected ${knownKeys.length} referenced keys`);

    console.log('Starting orphan cleanup...');
    const result = await cleanupOrphanedFiles({ knownKeys });
    console.log('Cleanup result:', result);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  } finally {
    // don't explicitly end pool to allow graceful exit
  }
};

main();
