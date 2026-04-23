const db = require('../config/db');
const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
const pkg = require('../../package.json');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    : undefined
});

const checkDb = async () => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok LIMIT 1');
    return rows && rows[0] && rows[0].ok === 1;
  } catch (err) {
    console.error('DB health check failed:', err.message);
    return false;
  }
};

const checkS3 = async () => {
  try {
    if (!process.env.AWS_S3_BUCKET_NAME) return false;
    await s3Client.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME }));
    return true;
  } catch (err) {
    console.error('S3 health check failed:', err.message);
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
  checkS3,
  getVersionInfo
};
