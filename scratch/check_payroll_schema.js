const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  let connection;
  try {
    const config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    };
    connection = await mysql.createConnection(process.env.DATABASE_URL || config);
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]).join(', '));

    const tablesToDescribe = ['employees', 'deductions', 'employee_incentives', 'employee_bonuses', 'employee_eos', 'salaries'];
    for (const table of tablesToDescribe) {
        try {
            const [columns] = await connection.query(`DESCRIBE ${table}`);
            console.log(`\nTable: ${table}`);
            columns.forEach(col => {
                console.log(` - ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})`);
            });
        } catch (e) {
            console.log(`\nTable ${table} does not exist.`);
        }
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    if (connection) await connection.end();
  }
}

checkSchema();
