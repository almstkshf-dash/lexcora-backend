const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function importDump() {
  const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true, // Crucial for executing the whole dump
  };

  console.log(`Connecting to database ${connectionConfig.database} on ${connectionConfig.host}...`);

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected successfully.');

    const dumpPath = path.join(__dirname, '..', 'src', 'config', 'Database.sql');
    console.log(`Reading dump file from ${dumpPath}...`);
    
    const sql = fs.readFileSync(dumpPath, 'utf8');
    
    console.log('Importing data (this may take a few seconds)...');
    
    // Execute the SQL dump
    await connection.query(sql);
    
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Error during import:');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

importDump();
