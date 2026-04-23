const { put, del, list } = require('@vercel/blob');

/**
 * Upload a file to Vercel Blob
 * @param {string} path - The path/filename in the storage
 * @param {Buffer} buffer - File content
 * @param {string} contentType - MIME type
 * @returns {Promise<Object>} - The blob object { url, downloadUrl, pathname, contentType, contentDisposition }
 */
const uploadToBlob = async (path, buffer, contentType) => {
  return await put(path, buffer, {
    access: 'public',
    contentType: contentType,
    addRandomSuffix: true,
  });
};

/**
 * Delete a file from Vercel Blob
 * @param {string} url - The full URL of the blob to delete
 */
const deleteFromBlob = async (url) => {
  if (!url) return;
  return await del(url);
};

/**
 * Batch delete files from Vercel Blob
 * @param {string[]} urls - Array of full URLs
 */
const deleteMultipleFromBlob = async (urls) => {
  if (!urls || urls.length === 0) return;
  return await del(urls);
};

module.exports = {
  uploadToBlob,
  deleteFromBlob,
  deleteMultipleFromBlob,
};
