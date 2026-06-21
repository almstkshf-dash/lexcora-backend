require('dotenv').config();
const db = require('../src/config/db');

(async () => {
  try {
    const query = process.argv[2] || 'SELECT * FROM roles';
    console.log('Running query:', query);
    const [rows] = await db.query(query);
    console.log('\n=== Results ===');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
