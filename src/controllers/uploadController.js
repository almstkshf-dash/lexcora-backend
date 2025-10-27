const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const path = require('path');

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Upload files to AWS S3
 */
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    const folder = req.body.folder || 'documents';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Use public URL if bucket is configured for public access
    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;

    const uploadPromises = req.files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${folder}/${filename}`;

      // Upload to S3
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(putCommand);

      let fileUrl;
      
      // If using public URL, use it directly; otherwise generate presigned URL
      if (usePublicUrl && publicUrl) {
        fileUrl = `${publicUrl}/${key}`;
      } else {
        // Generate presigned URL valid for 7 days
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days
      }

      // Return formatted result
      return {
        document_name: file.originalname,
        document_url: fileUrl,
        key: key, // Store the key for future presigned URL generation
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Error uploading files to AWS S3:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files',
    });
  }
};

/**
 * Generate presigned URL for an existing file
 */
const getPresignedUrl = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required',
      });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Check if using public URL
    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;
    
    let fileUrl;
    
    if (usePublicUrl && publicUrl) {
      fileUrl = `${publicUrl}/${key}`;
    } else {
      // Generate presigned URL valid for 7 days
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days
    }

    return res.status(200).json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate presigned URL',
    });
  }
};

/**
 * Delete a single file from AWS S3
 */
const deleteFile = async (req, res) => {
  try {
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key is required',
      });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(deleteCommand);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file from AWS S3:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete file',
    });
  }
};

/**
 * Delete multiple files from AWS S3
 */
const deleteFiles = async (req, res) => {
  try {
    const { keys } = req.body;
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'File keys array is required',
      });
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    
    // Delete multiple files in batch (more efficient)
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    const result = await s3Client.send(deleteCommand);

    return res.status(200).json({
      success: true,
      message: `${keys.length} file(s) deleted successfully`,
      deleted: result.Deleted || [],
      errors: result.Errors || [],
    });
  } catch (error) {
    console.error('Error deleting files from AWS S3:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete files',
    });
  }
};

/**
 * Extract key from document_url
 * Helper function to extract the file key from a full URL
 */
const extractKeyFromUrl = (url) => {
  try {
    // Handle presigned URLs or public URLs
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Remove leading slash
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    // If URL parsing fails, assume it's already a key
    return url;
  }
};

module.exports = {
  upload,
  uploadFiles,
  getPresignedUrl,
  deleteFile,
  deleteFiles,
  extractKeyFromUrl,
};
