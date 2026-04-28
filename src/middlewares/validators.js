const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Use this after validation chains to check and respond to errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Validate ID parameter (must be positive integer)
 */
const idValidator = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Validate clientId parameter (must be positive integer)
 */
const clientIdValidator = [
  param('clientId').isInt({ min: 1 }).withMessage('Client ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Validate pagination parameters
 */
const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

/**
 * Validate search query
 */
const searchValidator = [
  query('search').optional().trim().isLength({ max: 100 }).withMessage('Search query too long'),
  handleValidationErrors
];

/**
 * Validate status field (common across many entities)
 */
const statusValidator = (allowedStatuses) => [
  body('status').isIn(allowedStatuses).withMessage(`Status must be one of: ${allowedStatuses.join(', ')}`),
  handleValidationErrors
];

/**
 * Validate date fields
 */
const dateValidator = (fieldName = 'date') => [
  body(fieldName).optional().isISO8601().withMessage(`${fieldName} must be a valid date`),
  handleValidationErrors
];

/**
 * Validate email
 */
const emailValidator = (fieldName = 'email') => [
  body(fieldName).isEmail().normalizeEmail().withMessage('Invalid email address'),
  handleValidationErrors
];

/**
 * Validate phone number (supports international formats)
 */
const phoneValidator = (fieldName = 'phone') => [
  body(fieldName).optional().matches(/^[\d\s\+\-\(\)]+$/).withMessage('Invalid phone number format'),
  handleValidationErrors
];

/**
 * Validate string fields with min/max length
 */
const stringValidator = (fieldName, options = {}) => {
  const { min = 1, max = 255, required = true } = options;
  
  const validators = [];
  
  if (required) {
    validators.push(
      body(fieldName).trim().notEmpty().withMessage(`${fieldName} is required`)
    );
  } else {
    validators.push(
      body(fieldName).optional().trim()
    );
  }
  
  validators.push(
    body(fieldName).isLength({ min, max }).withMessage(`${fieldName} must be between ${min} and ${max} characters`)
  );
  
  validators.push(handleValidationErrors);
  
  return validators;
};

/**
 * Validate numeric fields
 */
const numberValidator = (fieldName, options = {}) => {
  const { min, max, required = true } = options;
  
  const validators = [];
  
  if (required) {
    validators.push(
      body(fieldName).notEmpty().withMessage(`${fieldName} is required`)
    );
  } else {
    validators.push(
      body(fieldName).optional()
    );
  }
  
  const numericCheck = body(fieldName).isNumeric().withMessage(`${fieldName} must be a number`);
  
  if (min !== undefined && max !== undefined) {
    numericCheck.isFloat({ min, max }).withMessage(`${fieldName} must be between ${min} and ${max}`);
  } else if (min !== undefined) {
    numericCheck.isFloat({ min }).withMessage(`${fieldName} must be at least ${min}`);
  } else if (max !== undefined) {
    numericCheck.isFloat({ max }).withMessage(`${fieldName} must be at most ${max}`);
  }
  
  validators.push(numericCheck);
  validators.push(handleValidationErrors);
  
  return validators;
};

/**
 * Sanitize and validate text input (prevents XSS)
 */
const sanitizeText = (fieldName) => [
  body(fieldName).trim().escape(),
];

/**
 * Validate array of IDs
 */
const idsArrayValidator = (fieldName = 'ids') => [
  body(fieldName).isArray().withMessage(`${fieldName} must be an array`),
  body(`${fieldName}.*`).isInt({ min: 1 }).withMessage('Each ID must be a positive integer'),
  handleValidationErrors
];

/**
 * Common validators for party orders
 */
const partyOrderValidators = {
  create: [
    body('party_id').isInt({ min: 1 }).withMessage('Party ID must be a positive integer'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('case_number').optional().trim().isLength({ max: 100 }).withMessage('Case number too long'),
    body('details').optional().trim().isLength({ max: 1000 }).withMessage('Details too long'),
    handleValidationErrors
  ],
  update: [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('party_id').optional().isInt({ min: 1 }).withMessage('Party ID must be a positive integer'),
    body('type').optional().trim().notEmpty().withMessage('Type cannot be empty'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('case_number').optional().trim().isLength({ max: 100 }).withMessage('Case number too long'),
    body('details').optional().trim().isLength({ max: 1000 }).withMessage('Details too long'),
    handleValidationErrors
  ]
};

/**
 * Common validators for bank accounts
 */
const bankAccountValidators = {
  create: [
    body('account_name').trim().notEmpty().withMessage('Account name is required')
      .isLength({ max: 255 }).withMessage('Account name too long'),
    body('account_number').trim().notEmpty().withMessage('Account number is required')
      .isLength({ max: 100 }).withMessage('Account number too long'),
    body('bank_name').trim().notEmpty().withMessage('Bank name is required')
      .isLength({ max: 255 }).withMessage('Bank name too long'),
    body('initial_balance').isNumeric().withMessage('Initial balance must be a number'),
    body('account_type').optional().isIn(['checking', 'savings', 'business']).withMessage('Invalid account type'),
    handleValidationErrors
  ],
  updateBalance: [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
    body('amount').isNumeric().withMessage('Amount must be a number')
      .custom((value) => value > 0).withMessage('Amount must be greater than 0'),
    body('operation').isIn(['add', 'subtract']).withMessage('Operation must be "add" or "subtract"'),
    handleValidationErrors
  ]
};

/**
 * Validate sort parameters with whitelist
 */
const sortValidator = (allowedColumns) => [
  query('sortBy').optional().isIn(allowedColumns).withMessage(`Sort column must be one of: ${allowedColumns.join(', ')}`),
  query('sortOrder').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Sort order must be ASC or DESC'),
  handleValidationErrors
];

/**
 * Validate cash flow report query parameters
 */
const cashFlowQueryValidator = [
  query('date_from').optional().isISO8601().withMessage('date_from must be a valid date (YYYY-MM-DD)'),
  query('date_to').optional().isISO8601().withMessage('date_to must be a valid date (YYYY-MM-DD)'),
  query('branch_id').optional().isInt({ min: 1 }).withMessage('branch_id must be a positive integer'),
  query('date_to').optional().custom((dateTo, { req }) => {
    if (!req.query.date_from || !dateTo) return true;
    return new Date(dateTo) >= new Date(req.query.date_from);
  }).withMessage('date_to must be greater than or equal to date_from'),
  handleValidationErrors
];

/**
 * Validate daily cash flow query parameters
 */
const dailyCashFlowQueryValidator = [
  query('days').optional().isInt({ min: 1, max: 365 }).withMessage('days must be an integer between 1 and 365'),
  query('branch_id').optional().isInt({ min: 1 }).withMessage('branch_id must be a positive integer'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  idValidator,
  clientIdValidator,
  paginationValidator,
  searchValidator,
  statusValidator,
  dateValidator,
  emailValidator,
  phoneValidator,
  stringValidator,
  numberValidator,
  sanitizeText,
  idsArrayValidator,
  partyOrderValidators,
  bankAccountValidators,
  sortValidator,
  cashFlowQueryValidator,
  dailyCashFlowQueryValidator
};
