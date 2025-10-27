/**
 * Middleware to convert S3 keys to accessible URLs in API responses
 * This handles both public URLs and presigned URLs based on environment configuration
 */

const { getAccessibleUrl } = require('../services/awsS3Service');

/**
 * Process document URLs in the response data
 * Converts S3 keys to full accessible URLs (public or presigned)
 * @param {*} data - The data to process (can be object, array, or primitive)
 * @param {string[]} urlFields - Field names that contain URLs (e.g., ['document_url', 'file_path', 'url'])
 * @returns {Promise<*>} - Processed data with accessible URLs
 */
const processDocumentUrls = async (data, urlFields = ['document_url', 'file_path', 'url']) => {
  if (!data) return data;

  // Handle arrays
  if (Array.isArray(data)) {
    return await Promise.all(data.map(item => processDocumentUrls(item, urlFields)));
  }

  // Handle objects
  if (typeof data === 'object') {
    const processedData = { ...data };

    // Process each URL field
    for (const field of urlFields) {
      if (processedData[field] && typeof processedData[field] === 'string') {
        try {
          const accessibleUrl = await getAccessibleUrl(processedData[field]);
          if (accessibleUrl) {
            // Store original path and add accessible URL
            processedData[`${field}_original`] = processedData[field];
            processedData[field] = accessibleUrl;
          }
        } catch (error) {
          console.error(`Error processing URL for field ${field}:`, error);
          // Keep original value if processing fails
        }
      }
    }

    // Recursively process nested objects and arrays
    for (const key in processedData) {
      if (processedData[key] && typeof processedData[key] === 'object') {
        processedData[key] = await processDocumentUrls(processedData[key], urlFields);
      }
    }

    return processedData;
  }

  // Return primitives as-is
  return data;
};

/**
 * Express middleware to automatically process document URLs in responses
 * Usage: app.use(documentUrlMiddleware(['document_url', 'file_path', 'url']));
 */
const documentUrlMiddleware = (urlFields = ['document_url', 'file_path', 'url']) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method
    res.json = async function (body) {
      try {
        // Process URLs in the response data
        if (body && body.data) {
          body.data = await processDocumentUrls(body.data, urlFields);
        } else if (body && !body.success && !body.error) {
          // If response doesn't follow {success, data} pattern, process the whole body
          body = await processDocumentUrls(body, urlFields);
        }
      } catch (error) {
        console.error('Error in documentUrlMiddleware:', error);
        // Continue with original response if processing fails
      }

      // Call original json method
      return originalJson(body);
    };

    next();
  };
};

module.exports = {
  processDocumentUrls,
  documentUrlMiddleware,
};
