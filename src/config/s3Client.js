const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Centralized S3 client configuration.
 * Supports both AWS S3 and S3-compatible storage like Cloudflare R2.
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT, // Required for Cloudflare R2
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  // Ensure we use path-style access if required by the provider, 
  // though R2 usually works fine with virtual-hosted style.
  forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true',
});

module.exports = s3Client;
