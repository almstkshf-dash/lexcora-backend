const { uploadToBlob } = require('./blobStorage');
const path = require('path');

/**
 * Upload a file to Vercel Blob (Maintained for backward compatibility with name uploadToS3)
 * @param {Object} file - The file object from multer (with buffer)
 * @param {String} folder - The folder name in the blob storage
 * @returns {Object} - Object containing the URL and key of the uploaded file
 */
const uploadToStorage = async (file, folder = 'documents') => {
  try {
    // Decode the original filename to properly handle Arabic and UTF-8 characters
    let originalFilename = file.originalname;
    try {
      if (/[^\u0000-\u007F]/.test(originalFilename)) { // eslint-disable-line no-control-regex
        originalFilename = Buffer.from(originalFilename, 'latin1').toString('utf8');
      }
    } catch (error) {
      console.warn('Failed to decode filename, using as-is:', originalFilename);
    }
    
    const fileExtension = path.extname(originalFilename);
    const cleanName = originalFilename.replace(fileExtension, '').replace(/[^a-zA-Z0-9]/g, '_');
    const blobPath = `${folder}/${cleanName}-${Date.now()}${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await uploadToBlob(blobPath, file.buffer, file.mimetype);

    return {
      url: blob.url,
      key: blob.url,
      originalName: originalFilename
    };
  } catch (error) {
    console.error('Error uploading file to Vercel Blob:', error);
    throw new Error('Failed to upload file to storage');
  }
};

module.exports = {
  uploadToStorage,
  uploadToS3: uploadToStorage, // Alias for backward compatibility
};
