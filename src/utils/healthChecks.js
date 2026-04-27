const db = require('../config/db');
const pkg = require('../../package.json');

const checkDb = async () => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok LIMIT 1');
    return rows && rows[0] && rows[0].ok === 1;
  } catch (err) {
    console.error('DB health check failed:', err.message);
    return false;
  }
};

const checkBlob = async () => {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
    // We just check if the token exists as a basic health check
    return true;
  } catch (err) {
    console.error('Blob health check failed:', err.message);
    return false;
  }
};

const getVersionInfo = () => ({
  name: pkg.name,
  version: pkg.version,
  build: process.env.BUILD_ID || null,
  commit: process.env.GIT_COMMIT || null
});

module.exports = {
  checkDb,
  checkBlob,
  getVersionInfo
};
