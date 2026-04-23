const { S3Client, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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
 * Extract key from document_url
 * Handles both presigned URLs and public URLs
 * @param {string} url - The full URL or key
 * @returns {string} - The file key
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // If it's already a key (no protocol), return it
    if (!url.includes('://')) {
      return url;
    }
    
    // Parse URL and extract pathname
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;
    
    // Remove leading slash
    pathname = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    
    // Remove query parameters from presigned URLs
    return pathname;
  } catch (error) {
    console.warn('Failed to parse URL, using as-is:', url);
    return url;
  }
};

/**
 * Delete a single file from AWS S3
 * @param {string} documentUrl - The document URL or key to delete
 * @returns {Promise<boolean>} - True if successful
 */
const deleteFileFromS3 = async (documentUrl) => {
  try {
    if (!documentUrl) {
      console.warn('No document URL provided for deletion');
      return false;
    }

    const key = extractKeyFromUrl(documentUrl);
    
    if (!key) {
      console.warn('Could not extract key from URL:', documentUrl);
      return false;
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from AWS S3:', error);
    return false;
  }
};

/**
 * Delete multiple files from AWS S3
 * @param {string[]} documentUrls - Array of document URLs or keys to delete
 * @returns {Promise<{success: number, failed: number}>} - Count of successful and failed deletions
 */
const deleteFilesFromS3 = async (documentUrls) => {
  try {
    if (!documentUrls || !Array.isArray(documentUrls) || documentUrls.length === 0) {
      console.warn('No documents provided for deletion');
      return { success: 0, failed: 0 };
    }

    // Extract keys from URLs
    const keys = documentUrls
      .map(url => extractKeyFromUrl(url))
      .filter(key => key !== null);

    if (keys.length === 0) {
      console.warn('No valid keys found in provided URLs');
      return { success: 0, failed: 0 };
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    // Use batch delete for better performance
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map(key => ({ Key: key })),
        Quiet: false,
      },
    });

    const result = await s3Client.send(command);

    const successCount = result.Deleted?.length || 0;
    const failedCount = result.Errors?.length || 0;
    
    if (failedCount > 0) {
      console.error(`✗ Failed to delete ${failedCount} file(s) from AWS S3:`, result.Errors);
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error deleting files from AWS S3:', error);
    return { success: 0, failed: documentUrls.length };
  }
};

/**
 * Delete files associated with a database record
 * Use this in your controllers when deleting records
 * @param {Array<{document_url: string}>} documents - Array of document objects from database
 * @returns {Promise<void>}
 */
const deleteDocumentFiles = async (documents) => {
  if (!documents || documents.length === 0) {
    return;
  }

  const urls = documents.map(doc => doc.document_url).filter(url => url);
  
  if (urls.length > 0) {
    await deleteFilesFromS3(urls);
  }
};

/**
 * Generate a presigned URL for accessing a private S3 file
 * @param {string} keyOrUrl - The S3 key or full URL
 * @param {number} expiresIn - Expiration time in seconds (default: 7 days)
 * @returns {Promise<string>} - The presigned URL
 */
const generatePresignedUrl = async (keyOrUrl, expiresIn = 604800) => {
  try {
    if (!keyOrUrl) {
      throw new Error('No key or URL provided');
    }

    // If it's already a presigned URL or public URL, return as-is
    if (keyOrUrl.startsWith('http') && keyOrUrl.includes('X-Amz-Signature')) {
      return keyOrUrl;
    }

    // Extract key from URL if needed
    const key = extractKeyFromUrl(keyOrUrl);
    
    if (!key) {
      throw new Error('Could not extract key from URL');
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Get accessible URL for a file (public or presigned based on config)
 * @param {string} keyOrUrl - The S3 key or URL
 * @param {number} expiresIn - Expiration time for presigned URLs (default: 7 days)
 * @returns {Promise<string>} - The accessible URL
 */
const getAccessibleUrl = async (keyOrUrl, expiresIn = 604800) => {
  try {
    if (!keyOrUrl) {
      return null;
    }

    // If already a full HTTP URL, check if it's valid
    if (keyOrUrl.startsWith('http')) {
      return keyOrUrl;
    }

    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;

    if (usePublicUrl && publicUrl) {
      return `${publicUrl}/${keyOrUrl}`;
    } else {
      return await generatePresignedUrl(keyOrUrl, expiresIn);
    }
  } catch (error) {
    console.error('Error getting accessible URL:', error);
    return null;
  }
};

/**
 * List keys in the bucket (optionally filtered by prefix)
 */
const listBucketKeys = async (prefix = '') => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const keys = [];
  let continuationToken;
  try {
    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken
      });
      const resp = await s3Client.send(command);
      resp.Contents?.forEach(obj => keys.push(obj.Key));
      continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (continuationToken);
  } catch (err) {
    console.error('Error listing bucket keys:', err);
  }
  return keys;
};

/**
 * Cleanup orphaned files in S3 given a set of known keys.
 * Only keys not present in knownKeys will be deleted.
 */
const cleanupOrphanedFiles = async ({ knownKeys = [], prefix = '' }) => {
  try {
    const bucketKeys = await listBucketKeys(prefix);
    const known = new Set(knownKeys);
    const orphaned = bucketKeys.filter(k => !known.has(k));
    if (orphaned.length === 0) {
      return { deleted: 0, skipped: bucketKeys.length };
    }
    const result = await deleteFilesFromS3(orphaned);
    return { deleted: result.success, failed: result.failed };
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
    return { deleted: 0, failed: 0, error: error.message };
  }
};

module.exports = {
  deleteFileFromS3,
  deleteFilesFromS3,
  deleteDocumentFiles,
  extractKeyFromUrl,
  generatePresignedUrl,
  getAccessibleUrl,
  listBucketKeys,
  cleanupOrphanedFiles,
};
