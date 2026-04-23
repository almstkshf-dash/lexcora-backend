const { deleteFromBlob, deleteMultipleFromBlob } = require('../utils/blobStorage');

/**
 * Extract key from document_url
 * Handles both presigned URLs and public URLs
 */
const extractKeyFromUrl = (url) => {
  if (!url) return null;
  // For Vercel Blob, the URL itself is the unique identifier (key)
  return url;
};

/**
 * Delete a single file from storage (Maintained for compatibility)
 */
const deleteFileFromS3 = async (documentUrl) => {
  try {
    if (!documentUrl) return false;
    await deleteFromBlob(documentUrl);
    return true;
  } catch (error) {
    console.error('Error deleting file from Blob:', error);
    return false;
  }
};

/**
 * Delete multiple files from storage (Maintained for compatibility)
 */
const deleteFilesFromS3 = async (documentUrls) => {
  try {
    if (!documentUrls || !Array.isArray(documentUrls) || documentUrls.length === 0) {
      return { success: 0, failed: 0 };
    }
    await deleteMultipleFromBlob(documentUrls);
    return { success: documentUrls.length, failed: 0 };
  } catch (error) {
    console.error('Error deleting files from Blob:', error);
    return { success: 0, failed: documentUrls.length };
  }
};

/**
 * Delete files associated with a database record
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
 * Get accessible URL for a file (Returns as-is for Vercel Blob)
 */
const getAccessibleUrl = async (keyOrUrl) => {
  // Vercel Blob URLs are already full and public
  return keyOrUrl || null;
};

/**
 * Generate a presigned URL (Returns as-is for Vercel Blob)
 */
const generatePresignedUrl = async (keyOrUrl) => {
  return keyOrUrl;
};

module.exports = {
  deleteFileFromS3,
  deleteFilesFromS3,
  deleteDocumentFiles,
  extractKeyFromUrl,
  generatePresignedUrl,
  getAccessibleUrl,
  // Stubs for functions that might be called elsewhere
  listBucketKeys: async () => [],
  cleanupOrphanedFiles: async () => ({ deleted: 0, failed: 0 }),
};
