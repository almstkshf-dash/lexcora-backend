# Bank Accounts & Deposits Backend Implementation

## Overview
This document describes the backend implementation for the Bank Accounts and Deposits management system.

## Database Schema

### Bank Accounts Table
```sql
CREATE TABLE `bank_accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bank_name` VARCHAR(255) NOT NULL,
  `account_name` VARCHAR(255) NOT NULL,
  `account_number` VARCHAR(100) NOT NULL,
  `iban` VARCHAR(50) DEFAULT NULL,
  `branch_id` INT(11) DEFAULT NULL,
  `current_balance` DECIMAL(15,2) DEFAULT 0.00,
  `status` ENUM('active', 'inactive', 'closed') DEFAULT 'active',
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### Deposits Table
```sql
CREATE TABLE `deposits` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `bank_account_id` INT(11) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `deposit_date` DATE NOT NULL,
  `reference_number` VARCHAR(100) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `depositor_name` VARCHAR(255) DEFAULT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

## API Endpoints

### Bank Accounts

#### GET /api/bank-accounts
Get all bank accounts with related data
- **Auth Required**: Yes
- **Response**: 
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bank_name": "البنك الأهلي",
      "account_name": "الحساب الرئيسي",
      "account_number": "1234567890",
      "iban": "SA0380000000608010167519",
      "branch_id": 1,
      "current_balance": 50000.00,
      "status": "active",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "branch_name_ar": "الفرع الرئيسي",
      "branch_name_en": "Main Branch",
      "created_by_name": "محمد أحمد"
    }
  ]
}
```

#### GET /api/bank-accounts/:id
Get a specific bank account by ID
- **Auth Required**: Yes
- **Response**: Single bank account object

#### POST /api/bank-accounts
Create a new bank account
- **Auth Required**: Yes
- **Body**:
```json
{
  "bank_name": "البنك الأهلي",
  "account_name": "الحساب الرئيسي",
  "account_number": "1234567890",
  "iban": "SA0380000000608010167519",
  "branch_id": 1,
  "current_balance": 0.00,
  "status": "active"
}
```
- **Response**: 
```json
{
  "success": true,
  "insertId": 1
}
```

#### PUT /api/bank-accounts/:id
Update an existing bank account
- **Auth Required**: Yes
- **Body**: Same as POST (all fields)
- **Response**: 
```json
{
  "success": true
}
```

#### DELETE /api/bank-accounts/:id
Delete a bank account
- **Auth Required**: Yes
- **Response**: 
```json
{
  "success": true
}
```

#### PATCH /api/bank-accounts/:id/balance
Update account balance manually
- **Auth Required**: Yes
- **Body**:
```json
{
  "amount": 1000.00,
  "operation": "add" // or "subtract"
}
```
- **Response**: 
```json
{
  "success": true
}
```

### Deposits

#### GET /api/deposits
Get all deposits with related data
- **Auth Required**: Yes
- **Response**: 
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "bank_account_id": 1,
      "amount": 5000.00,
      "deposit_date": "2024-01-01",
      "reference_number": "DEP-001",
      "description": "إيداع نقدي",
      "depositor_name": "أحمد محمد",
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "bank_name": "البنك الأهلي",
      "account_name": "الحساب الرئيسي",
      "account_number": "1234567890",
      "created_by_name": "محمد أحمد"
    }
  ]
}
```

#### GET /api/deposits/:id
Get a specific deposit by ID
- **Auth Required**: Yes
- **Response**: Single deposit object

#### POST /api/deposits
Create a new deposit (automatically updates bank account balance)
- **Auth Required**: Yes
- **Body**:
```json
{
  "bank_account_id": 1,
  "amount": 5000.00,
  "deposit_date": "2024-01-01",
  "reference_number": "DEP-001",
  "description": "إيداع نقدي",
  "depositor_name": "أحمد محمد"
}
```
- **Response**: 
```json
{
  "success": true,
  "insertId": 1
}
```

#### PUT /api/deposits/:id
Update an existing deposit (automatically adjusts bank account balance)
- **Auth Required**: Yes
- **Body**: Same as POST
- **Response**: 
```json
{
  "success": true
}
```

#### DELETE /api/deposits/:id
Delete a deposit (automatically reverses bank account balance)
- **Auth Required**: Yes
- **Response**: 
```json
{
  "success": true
}
```

## Features

### Transaction Management
- **Deposits**: All deposit operations (create, update, delete) automatically adjust the bank account balance using database transactions
- **Balance Updates**: Manual balance updates available through PATCH endpoint
- **Rollback**: Failed operations are rolled back to maintain data integrity

### Data Integrity
- Foreign key constraints ensure referential integrity
- Transactions ensure atomic operations
- Balance calculations are handled server-side

### Security
- All endpoints require authentication via authMiddleware
- created_by field automatically populated from authenticated user
- SQL injection prevention through parameterized queries

## File Structure

```
backend/src/
├── models/
│   ├── bankAccountsModel.js      # Database queries for bank accounts
│   └── depositsModel.js           # Database queries for deposits
├── services/
│   ├── bankAccountsService.js    # Business logic for bank accounts
│   └── depositsService.js         # Business logic for deposits
├── controllers/
│   ├── bankAccountsController.js # Request handlers for bank accounts
│   └── depositsController.js      # Request handlers for deposits
└── routes/
    ├── bankAccountsRoute.js      # Route definitions for bank accounts
    └── depositsRoute.js           # Route definitions for deposits
```

## Setup Instructions

1. **Create Database Tables**:
   ```bash
   mysql -u your_username -p your_database < database_schema_bank_accounts.sql
   ```

2. **Routes are automatically registered in app.js**:
   - `/api/bank-accounts`
   - `/api/deposits`

3. **Restart Backend Server**:
   ```bash
   cd backend
   npm start
   ```

## Testing

### Test Bank Account Creation
```bash
curl -X POST http://localhost:3000/api/bank-accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bank_name": "البنك الأهلي",
    "account_name": "الحساب الرئيسي",
    "account_number": "1234567890",
    "iban": "SA0380000000608010167519",
    "branch_id": 1,
    "status": "active"
  }'
```

### Test Deposit Creation
```bash
curl -X POST http://localhost:3000/api/deposits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bank_account_id": 1,
    "amount": 5000.00,
    "deposit_date": "2024-01-01",
    "reference_number": "DEP-001",
    "description": "إيداع نقدي",
    "depositor_name": "أحمد محمد"
  }'
```

## Notes

- The `created_by` field is automatically populated from the authenticated user's session
- Balance updates in deposits use database transactions to ensure consistency
- When a deposit is created, the bank account balance is automatically incremented
- When a deposit is updated, the old balance is reversed and new balance is applied
- When a deposit is deleted, the balance is automatically decremented
- Status field accepts: 'active', 'inactive', 'closed'
- All decimal values use DECIMAL(15,2) for precision

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Future Enhancements

- [ ] Add withdrawal management
- [ ] Add transaction history/audit trail
- [ ] Add bank statement generation
- [ ] Add reconciliation features
- [ ] Add multi-currency support
- [ ] Add automated balance calculations and reports
