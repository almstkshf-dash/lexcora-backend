require('dotenv').config();
const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/passwordUtils');

(async () => {
  try {
    const username = 'admin';
    const newPasswordRaw = 'almstkshf111'; // Correct spelling of "almstkshf"
    
    console.log(`Hashing password "${newPasswordRaw}"...`);
    const hashedPassword = await hashPassword(newPasswordRaw);
    console.log(`Hash generated: ${hashedPassword}`);

    console.log(`Updating user "${username}" in the database...`);
    const [result] = await db.query(`
      UPDATE employees 
      SET password = ?, role_id = 1, status = 'active'
      WHERE username = ?
    `, [hashedPassword, username]);

    if (result.affectedRows > 0) {
      console.log('✅ Admin user updated successfully:');
      console.log(`- Username: ${username}`);
      console.log(`- Password (raw): ${newPasswordRaw}`);
      console.log(`- Password (hash): ${hashedPassword}`);
      console.log(`- Role ID: 1 (admin)`);
      console.log(`- Status: active`);
    } else {
      console.error('❌ Failed to update admin user. No rows matched username "admin".');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
