const { uploadToBlob, deleteFromBlob, deleteMultipleFromBlob } = require('../utils/blobStorage');
const multer = require('multer');
const path = require('path');
const { validateFiles, DEFAULT_ALLOWED_MIME, DEFAULT_MAX_SIZE } = require('../utils/fileValidation');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

/**
 * Upload files to Vercel Blob
 */
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }

    // Validate files (MIME + size)
    const { valid, errors } = validateFiles(req.files, {
      maxSize: DEFAULT_MAX_SIZE,
      allowedMime: DEFAULT_ALLOWED_MIME
    });

    if (valid.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid files provided',
        details: errors
      });
    }

    const folder = req.body.folder || 'documents';

    const uploadPromises = valid.map(async (file) => {
      let originalFilename = file.originalname;
      try {
        if (/[^\x00-\x7F]/.test(originalFilename)) {
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

      const nowIso = new Date().toISOString();
      return {
        document_name: originalFilename,
        document_url: blob.url,
        key: blob.url, // Store full URL as key for easier deletion in Vercel Blob
        mimetype: file.mimetype,
        size: file.size,
        uploaded_by: req.user?.id || null,
        created_at: nowIso
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      files: uploadedFiles,
      errors,
    });
  } catch (error) {
    console.error('Error uploading files to Vercel Blob:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload files',
    });
  }
};

/**
 * Return blob URL directly (Vercel Blob is public by default)
 */
const getPresignedUrl = async (req, res) => {
  try {
    const { key } = req.body; // Key is the full URL in our Vercel implementation
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key (URL) is required',
      });
    }

    return res.status(200).json({
      success: true,
      url: key,
    });
  } catch (error) {
    console.error('Error returning URL:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to return URL',
    });
  }
};

/**
 * Delete a single file from Vercel Blob
 */
const deleteFile = async (req, res) => {
  try {
    const { key } = req.body; // Key is the full URL
    
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'File key (URL) is required',
      });
    }

    await deleteFromBlob(key);

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file from Vercel Blob:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete file',
    });
  }
};

/**
 * Delete multiple files from Vercel Blob
 */
const deleteFiles = async (req, res) => {
  try {
    const { keys } = req.body; // Keys are full URLs
    
    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'File keys (URLs) array is required',
      });
    }

    await deleteMultipleFromBlob(keys);

    return res.status(200).json({
      success: true,
      message: `${keys.length} file(s) deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting files from Vercel Blob:', error);
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
