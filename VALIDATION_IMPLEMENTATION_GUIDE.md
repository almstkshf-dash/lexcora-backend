# Implementation Example: Adding Validators to Routes

## Overview
This guide shows how to add the validation middleware to your existing routes to protect against SQL injection and invalid input.

## Step 1: Install express-validator

```bash
npm install express-validator
```

## Step 2: Update Routes with Validators

### Example 1: Parties Orders Routes

**File:** `src/routes/partiesOrdersRoutes.js`

**Before:**
```javascript
const express = require('express');
const router = express.Router();
const partiesOrdersController = require('../controllers/partiesOrdersController');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, partiesOrdersController.getAllPartiesOrders);
router.get('/:id', authenticate, partiesOrdersController.getPartyOrderById);
router.post('/', authenticate, partiesOrdersController.createPartyOrder);
router.put('/:id', authenticate, partiesOrdersController.updatePartyOrder);
router.delete('/:id', authenticate, partiesOrdersController.deletePartyOrder);

module.exports = router;
```

**After:**
```javascript
const express = require('express');
const router = express.Router();
const partiesOrdersController = require('../controllers/partiesOrdersController');
const { authenticate } = require('../middlewares/authMiddleware');
const { 
  idValidator, 
  paginationValidator, 
  partyOrderValidators 
} = require('../middlewares/validators');

// GET all with pagination and filters
router.get('/', 
  authenticate, 
  paginationValidator, 
  partiesOrdersController.getAllPartiesOrders
);

// GET by ID
router.get('/:id', 
  authenticate, 
  idValidator, 
  partiesOrdersController.getPartyOrderById
);

// CREATE new party order
router.post('/', 
  authenticate, 
  partyOrderValidators.create, 
  partiesOrdersController.createPartyOrder
);

// UPDATE party order
router.put('/:id', 
  authenticate, 
  partyOrderValidators.update, 
  partiesOrdersController.updatePartyOrder
);

// DELETE party order
router.delete('/:id', 
  authenticate, 
  idValidator, 
  partiesOrdersController.deletePartyOrder
);

module.exports = router;
```

### Example 2: Bank Accounts Routes

**File:** `src/routes/bankAccountsRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const bankAccountsController = require('../controllers/bankAccountsController');
const { authenticate } = require('../middlewares/authMiddleware');
const { 
  idValidator, 
  paginationValidator,
  bankAccountValidators 
} = require('../middlewares/validators');

// GET all bank accounts
router.get('/', 
  authenticate, 
  paginationValidator, 
  bankAccountsController.getAllBankAccounts
);

// GET bank account by ID
router.get('/:id', 
  authenticate, 
  idValidator, 
  bankAccountsController.getBankAccountById
);

// CREATE new bank account
router.post('/', 
  authenticate, 
  bankAccountValidators.create, 
  bankAccountsController.createBankAccount
);

// UPDATE bank account balance
router.patch('/:id/balance', 
  authenticate, 
  bankAccountValidators.updateBalance, 
  bankAccountsController.updateAccountBalance
);

// DELETE bank account
router.delete('/:id', 
  authenticate, 
  idValidator, 
  bankAccountsController.deleteBankAccount
);

module.exports = router;
```

### Example 3: Custom Validators for Specific Routes

If you need custom validation for a specific route:

```javascript
const { body, param, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validators');

// Custom validator for case documents
const caseDocumentValidators = [
  body('case_id').isInt({ min: 1 }).withMessage('Case ID must be a positive integer'),
  body('document_type').isIn(['contract', 'evidence', 'court_order', 'other'])
    .withMessage('Invalid document type'),
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title too long'),
  body('file_url').optional().trim().isURL().withMessage('Invalid URL'),
  handleValidationErrors
];

router.post('/', 
  authenticate, 
  caseDocumentValidators, 
  caseDocumentsController.createCaseDocument
);
```

## Step 3: Update Controllers (Optional)

Your controllers don't need major changes since validation happens in middleware. However, you can simplify error handling:

**Before:**
```javascript
const createPartyOrder = async (req, res) => {
  try {
    // Manual validation
    if (!req.body.party_id) {
      return res.status(400).json({ error: 'Party ID is required' });
    }
    if (!req.body.type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const result = await partiesOrdersService.createPartyOrder(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**After:**
```javascript
const createPartyOrder = async (req, res) => {
  try {
    // Validation already done by middleware
    const result = await partiesOrdersService.createPartyOrder(req.body, req.user.id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating party order:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An error occurred while creating the party order' 
    });
  }
};
```

## Step 4: Test Your Validators

### Testing with Invalid Data

```bash
# Test with invalid ID (should return 400)
curl -X GET http://localhost:3000/api/parties-orders/abc \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test with invalid party_id (should return 400)
curl -X POST http://localhost:3000/api/parties-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"party_id": "invalid", "type": "consultation"}'

# Test with missing required fields (should return 400)
curl -X POST http://localhost:3000/api/parties-orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "consultation"}'
```

### Expected Response for Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Party ID must be a positive integer",
      "param": "party_id",
      "location": "body"
    }
  ]
}
```

## Step 5: Common Validation Patterns

### Pagination
```javascript
router.get('/', authenticate, paginationValidator, controller.getAll);
```

### ID Parameter
```javascript
router.get('/:id', authenticate, idValidator, controller.getById);
router.put('/:id', authenticate, idValidator, [...], controller.update);
router.delete('/:id', authenticate, idValidator, controller.delete);
```

### Search
```javascript
const { searchValidator } = require('../middlewares/validators');
router.get('/search', authenticate, searchValidator, controller.search);
```

### Sorting
```javascript
const { sortValidator } = require('../middlewares/validators');
const allowedColumns = ['name', 'created_at', 'status'];
router.get('/', authenticate, sortValidator(allowedColumns), controller.getAll);
```

## Priority Routes to Update

1. **High Priority** (User Input Heavy):
   - `src/routes/partiesOrdersRoutes.js`
   - `src/routes/bankAccountsRoutes.js`
   - `src/routes/authRoutes.js`
   - `src/routes/casesRoutes.js`
   - `src/routes/clientRequestsRoutes.js`

2. **Medium Priority**:
   - `src/routes/employeeRoutes.js`
   - `src/routes/partiesRoutes.js`
   - `src/routes/caseDocumentsRoutes.js`
   - `src/routes/depositsRoutes.js`

3. **Lower Priority** (Less User Input):
   - Lookup/reference tables (branches, departments, case types, etc.)

## Benefits

✅ **Automatic SQL Injection Prevention** - Invalid input is rejected before reaching the database  
✅ **Type Safety** - Ensures data types match expectations  
✅ **Consistent Error Messages** - Standardized validation responses  
✅ **Reduced Code** - No need for manual validation in controllers  
✅ **Better Security** - Defense in depth approach  
✅ **Improved API Documentation** - Validators serve as documentation  

## Next Steps

1. Install express-validator: `npm install express-validator`
2. Start with high-priority routes
3. Test each route after adding validators
4. Gradually add validators to all routes
5. Remove manual validation from controllers

---

**Remember:** Validation middleware should come AFTER authentication but BEFORE the controller function.

```javascript
router.post('/', 
  authenticate,        // 1. Check if user is authenticated
  validators,          // 2. Validate input data
  controller.create    // 3. Process request
);
```
