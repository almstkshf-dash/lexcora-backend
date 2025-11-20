const path = require('path');

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const validateFiles = (files = [], options = {}) => {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE;
  const allowedMime = options.allowedMime || DEFAULT_ALLOWED_MIME;

  const valid = [];
  const errors = [];

  files.forEach((file, idx) => {
    if (!file) {
      errors.push({ index: idx, reason: 'File is empty' });
      return;
    }

    if (!allowedMime.includes(file.mimetype)) {
      errors.push({ index: idx, name: file.originalname, reason: 'Unsupported MIME type' });
      return;
    }

    if (file.size > maxSize) {
      errors.push({ index: idx, name: file.originalname, reason: 'File too large' });
      return;
    }

    // basic extension check
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ext) {
      errors.push({ index: idx, name: file.originalname, reason: 'Missing file extension' });
      return;
    }

    valid.push(file);
  });

  return { valid, errors };
};

module.exports = {
  validateFiles,
  DEFAULT_ALLOWED_MIME,
  DEFAULT_MAX_SIZE
};
