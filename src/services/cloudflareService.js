const { DeleteObjectCommand, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const s3Client = require('../config/s3Client');

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
 * Delete a single file from Cloudflare R2
 * @param {string} documentUrl - The document URL or key to delete
 * @returns {Promise<boolean>} - True if successful
 */
const deleteFileFromR2 = async (documentUrl) => {
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
    console.error('Error deleting file from Cloudflare R2:', error);
    return false;
  }
};

/**
 * Delete multiple files from Cloudflare R2
 * @param {string[]} documentUrls - Array of document URLs or keys to delete
 * @returns {Promise<{success: number, failed: number}>} - Count of successful and failed deletions
 */
const deleteFilesFromR2 = async (documentUrls) => {
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
      console.error(`✗ Failed to delete ${failedCount} file(s) from R2:`, result.Errors);
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('Error deleting files from Cloudflare R2:', error);
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
    await deleteFilesFromR2(urls);
  }
};

module.exports = {
  deleteFileFromR2,
  deleteFilesFromR2,
  deleteDocumentFiles,
  extractKeyFromUrl,
};
