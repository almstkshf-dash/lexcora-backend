
require('dotenv').config();
const db = require('../src/config/db');

async function applyMigration() {
  try {
    console.log('Applying migration to meetings table...');
    
    // Add columns to meetings table if they don't exist
    const [columns] = await db.query('DESCRIBE meetings');
    const existingColumns = columns.map(c => c.Field);

    if (!existingColumns.includes('case_id')) {
      console.log('Adding case_id to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN case_id INT NULL, ADD CONSTRAINT fk_meeting_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL');
    }

    if (!existingColumns.includes('is_consultation')) {
      console.log('Adding is_consultation to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN is_consultation BOOLEAN DEFAULT FALSE');
    }

    if (!existingColumns.includes('consultation_fee')) {
      console.log('Adding consultation_fee to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN consultation_fee DECIMAL(15, 2) DEFAULT 0.00');
    }

    if (!existingColumns.includes('invoice_id')) {
      console.log('Adding invoice_id to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN invoice_id INT NULL, ADD CONSTRAINT fk_meeting_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL');
    }

    if (!existingColumns.includes('duration_minutes')) {
      console.log('Adding duration_minutes to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN duration_minutes INT DEFAULT 0');
    }

    if (!existingColumns.includes('hourly_rate')) {
      console.log('Adding hourly_rate to meetings...');
      await db.query('ALTER TABLE meetings ADD COLUMN hourly_rate DECIMAL(15, 2) DEFAULT 0.00');
    }

    console.log('Applying migration to employees table...');
    const [empColumns] = await db.query('DESCRIBE employees');
    const existingEmpColumns = empColumns.map(c => c.Field);

    if (!existingEmpColumns.includes('hourly_rate')) {
      console.log('Adding hourly_rate to employees...');
      await db.query('ALTER TABLE employees ADD COLUMN hourly_rate DECIMAL(15, 2) DEFAULT 0.00');
    }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
