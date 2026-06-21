require('dotenv').config();
const db = require('../src/config/db');
const { hashPassword } = require('../src/utils/passwordUtils');

(async () => {
  try {
    const username = 'admin';
    const newPasswordRaw = 'almstlshf111'; // Spelling with "l" as requested by user
    
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
      console.log('✅ Admin user password updated successfully to spelling with "l"!');
      console.log(`- Username: ${username}`);
      console.log(`- Password (raw): ${newPasswordRaw}`);
      console.log(`- Password (hash): ${hashedPassword}`);
    } else {
      console.error('❌ Failed to update admin user.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
