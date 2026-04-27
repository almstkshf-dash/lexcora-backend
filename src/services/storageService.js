const { deleteFromBlob, deleteMultipleFromBlob } = require('../utils/blobStorage');

/**
 * Extract key from document_url
 * For Vercel Blob, the URL itself is the unique identifier (key)
 */
const extractKeyFromUrl = (url) => {
  return url || null;
};

/**
 * Delete a single file from storage
 */
const deleteFile = async (documentUrl) => {
  try {
    if (!documentUrl) return false;
    await deleteFromBlob(documentUrl);
    return true;
  } catch (error) {
    console.error('Error deleting file from storage:', error);
    return false;
  }
};

/**
 * Delete multiple files from storage
 */
const deleteFiles = async (documentUrls) => {
  try {
    if (!documentUrls || !Array.isArray(documentUrls) || documentUrls.length === 0) {
      return { success: 0, failed: 0 };
    }
    await deleteMultipleFromBlob(documentUrls);
    return { success: documentUrls.length, failed: 0 };
  } catch (error) {
    console.error('Error deleting files from storage:', error);
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
  const urls = documents.map(doc => doc.document_url || doc.url).filter(url => url);
  if (urls.length > 0) {
    await deleteFiles(urls);
  }
};

/**
 * Get accessible URL for a file
 */
const getAccessibleUrl = async (url) => {
  return url || null;
};

module.exports = {
  deleteFile,
  deleteFiles,
  deleteDocumentFiles,
  extractKeyFromUrl,
  getAccessibleUrl,
  // Aliases for backward compatibility
  deleteFileFromS3: deleteFile,
  deleteFilesFromS3: deleteFiles,
  generatePresignedUrl: async (url) => url,
};
