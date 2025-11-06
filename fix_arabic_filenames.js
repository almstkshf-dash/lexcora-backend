/**
 * Migration Script: Fix Arabic Filenames in Database
 * 
 * This script fixes document_name fields that were corrupted during upload
 * due to improper character encoding handling.
 * 
 * Run with: node fix_arabic_filenames.js
 */

require('dotenv').config();
const db = require('./src/config/db');

// Tables that contain document_name fields
const TABLES = [
  'case_documents',
  'employee_documents', 
  'party_documents',
  'review_documents',
  'training_documents',
  'warning_documents',
  'meeting_documents',
  'session_documents',
  'task_documents',
  'petition_documents',
  'execution_documents',
  'judicial_order_documents',
  'client_deal_documents',
  'invoice_attachments',
  // Add any other tables with document_name field
];

/**
 * Check if a string is likely corrupted (contains garbled text)
 * This is a heuristic check - it looks for non-printable or suspicious character patterns
 */
const isLikelyCorrupted = (str) => {
  if (!str) return false;
  
  // Check for common corruption patterns in Arabic text
  // When Arabic text is incorrectly encoded, it often results in sequences like:
  // Ø§Ù„Ù…Ù„Ù (instead of الملف)
  const corruptionPatterns = [
    /[ÃÂÃ©Ã¨Ã§Ã«Ã¯]/g, // Common Latin-1 misinterpretation
    /Ø[§-»]/g, // Arabic letters incorrectly shown as Ø followed by Latin chars
    /Ù[€-�]/g, // Arabic letters incorrectly shown as Ù followed by Latin chars
  ];
  
  return corruptionPatterns.some(pattern => pattern.test(str));
};

/**
 * Attempt to fix a corrupted filename
 */
const fixFilename = (corruptedName) => {
  try {
    // Try to decode as if it was incorrectly stored as Latin-1
    const fixed = Buffer.from(corruptedName, 'latin1').toString('utf8');
    
    // Verify the fix by checking if it now contains valid Arabic characters
    const hasArabic = /[\u0600-\u06FF]/.test(fixed);
    
    if (hasArabic) {
      return fixed;
    }
    
    // If first attempt didn't work, return original
    return corruptedName;
  } catch (error) {
    console.error(`Failed to fix filename: ${corruptedName}`, error);
    return corruptedName;
  }
};

/**
 * Process a single table
 */
const processTable = async (tableName) => {
  try {
    console.log(`\n📋 Processing table: ${tableName}`);
    
    // Check if table exists
    const [tables] = await db.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [process.env.DB_NAME, tableName]
    );
    
    if (tables.length === 0) {
      console.log(`   ⚠️  Table ${tableName} does not exist, skipping...`);
      return { processed: 0, fixed: 0, skipped: 0 };
    }
    
    // Get all records with document_name
    const [rows] = await db.query(
      `SELECT id, document_name FROM ${tableName} WHERE document_name IS NOT NULL`
    );
    
    console.log(`   Found ${rows.length} documents`);
    
    let fixed = 0;
    let skipped = 0;
    
    for (const row of rows) {
      if (isLikelyCorrupted(row.document_name)) {
        const fixedName = fixFilename(row.document_name);
        
        if (fixedName !== row.document_name) {
          // Update the database
          await db.query(
            `UPDATE ${tableName} SET document_name = ? WHERE id = ?`,
            [fixedName, row.id]
          );
          
          console.log(`   ✅ Fixed: "${row.document_name}" → "${fixedName}"`);
          fixed++;
        } else {
          console.log(`   ⚠️  Could not fix: "${row.document_name}"`);
          skipped++;
        }
      }
    }
    
    return { processed: rows.length, fixed, skipped };
  } catch (error) {
    console.error(`❌ Error processing table ${tableName}:`, error.message);
    return { processed: 0, fixed: 0, skipped: 0, error: error.message };
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🚀 Starting Arabic Filename Fix Migration');
  console.log('=========================================\n');
  
  const results = {
    totalProcessed: 0,
    totalFixed: 0,
    totalSkipped: 0,
    errors: [],
  };
  
  for (const tableName of TABLES) {
    const result = await processTable(tableName);
    
    results.totalProcessed += result.processed;
    results.totalFixed += result.fixed;
    results.totalSkipped += result.skipped;
    
    if (result.error) {
      results.errors.push({ table: tableName, error: result.error });
    }
  }
  
  console.log('\n\n=========================================');
  console.log('📊 Migration Summary');
  console.log('=========================================');
  console.log(`Total documents processed: ${results.totalProcessed}`);
  console.log(`Total documents fixed: ${results.totalFixed}`);
  console.log(`Total documents skipped: ${results.totalSkipped}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach(({ table, error }) => {
      console.log(`   ${table}: ${error}`);
    });
  }
  
  console.log('\n✨ Migration completed!\n');
  
  // Close the database connection
  process.exit(0);
};

// Run the migration
main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
