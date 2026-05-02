
const db = require('../src/config/db');
require('dotenv').config();

async function migrate() {
  try {
    console.log('Creating case_related_files table...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS case_related_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        case_id INT NOT NULL,
        document_name VARCHAR(255) NOT NULL,
        document_url VARCHAR(255) NOT NULL,
        uploaded_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Migration successful!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
