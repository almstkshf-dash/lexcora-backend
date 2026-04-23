const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file to S3
 * @param {Object} file - The file object from multer (with buffer)
 * @param {String} folder - The folder name in S3
 * @returns {Object} - Object containing the URL and key of the uploaded file
 */
const uploadToS3 = async (file, folder = 'documents') => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Decode the original filename to properly handle Arabic and UTF-8 characters
    let originalFilename = file.originalname;
    try {
      if (/[^\x00-\x7F]/.test(originalFilename)) {
        originalFilename = Buffer.from(originalFilename, 'latin1').toString('utf8');
      }
    } catch (error) {
      console.warn('Failed to decode filename, using as-is:', originalFilename);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(originalFilename);
    const filename = `${timestamp}-${randomString}${fileExtension}`;
    const key = `${folder}/${filename}`;

    // Upload to S3
    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        'original-filename': encodeURIComponent(originalFilename),
      },
    });

    await s3Client.send(putCommand);

    // Check if using public URL or presigned URL
    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;

    let fileUrl;
    
    if (usePublicUrl && publicUrl) {
      fileUrl = `${publicUrl}/${key}`;
    } else {
      // Generate presigned URL valid for 7 days
      const { GetObjectCommand } = require('@aws-sdk/client-s3');
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days
    }

    return {
      url: fileUrl,
      key: key,
      originalName: originalFilename
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
};

module.exports = {
  uploadToS3,
  s3Client
};
