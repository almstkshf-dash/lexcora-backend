# Quick Setup Guide - Bank Accounts & Deposits Backend

## What Was Created

### Backend Files Created:
1. **Models** (Database Layer):
   - `backend/src/models/bankAccountsModel.js` - Bank accounts database operations
   - `backend/src/models/depositsModel.js` - Deposits database operations

2. **Services** (Business Logic):
   - `backend/src/services/bankAccountsService.js` - Bank accounts business logic
   - `backend/src/services/depositsService.js` - Deposits business logic

3. **Controllers** (Request Handlers):
   - `backend/src/controllers/bankAccountsController.js` - Bank accounts API handlers
   - `backend/src/controllers/depositsController.js` - Deposits API handlers

4. **Routes** (API Endpoints):
   - `backend/src/routes/bankAccountsRoute.js` - Bank accounts routes
   - `backend/src/routes/depositsRoute.js` - Deposits routes

5. **Documentation**:
   - `backend/BANK_ACCOUNTS_IMPLEMENTATION.md` - Full documentation
   - `backend/database_schema_bank_accounts.sql` - Database schema

### Updated Files:
- `backend/src/app.js` - Added bank accounts and deposits routes

## Setup Steps

### 1. Create Database Tables

Run the SQL script to create the required tables:

```bash
# Navigate to backend folder
cd backend

# Run the SQL script (replace with your database credentials)
mysql -u root -p law_database < database_schema_bank_accounts.sql
```

Or manually execute in your MySQL client:
```sql
-- See database_schema_bank_accounts.sql for the complete schema
```

### 2. Restart Backend Server

```bash
# If server is running, stop it (Ctrl+C)
# Then restart
cd backend
npm start
```

### 3. Test the API

The following endpoints are now available:

#### Bank Accounts:
- `GET    /api/bank-accounts` - Get all accounts
- `GET    /api/bank-accounts/:id` - Get specific account
- `POST   /api/bank-accounts` - Create new account
- `PUT    /api/bank-accounts/:id` - Update account
- `DELETE /api/bank-accounts/:id` - Delete account
- `PATCH  /api/bank-accounts/:id/balance` - Update balance

#### Deposits:
- `GET    /api/deposits` - Get all deposits
- `GET    /api/deposits/:id` - Get specific deposit
- `POST   /api/deposits` - Create new deposit (auto-updates balance)
- `PUT    /api/deposits/:id` - Update deposit (auto-adjusts balance)
- `DELETE /api/deposits/:id` - Delete deposit (auto-reverses balance)

## Key Features

✅ **Automatic Balance Management**: Deposits automatically update bank account balances
✅ **Transaction Safety**: Database transactions ensure data consistency
✅ **Authentication**: All endpoints protected with authMiddleware
✅ **Audit Trail**: Tracks who created each record
✅ **Related Data**: Joins with branches and employees for complete information
✅ **Error Handling**: Comprehensive error handling and validation

## Frontend Integration

Your frontend is already set up to use these endpoints:
- `frontend/src/app/finance/bank-accounts/page.js` calls these APIs
- Make sure your frontend API calls match:
  - `/api/bank-accounts` (not `/api/bank-accounts/`)
  - `/api/deposits` (not `/api/deposits/`)

## Testing Checklist

- [ ] Database tables created successfully
- [ ] Backend server restarted
- [ ] Can create a bank account
- [ ] Can view all bank accounts
- [ ] Can create a deposit
- [ ] Balance updates automatically when creating deposit
- [ ] Can view all deposits
- [ ] Can edit and delete records

## Troubleshooting

### Issue: "TypeError: argument handler must be a function"
**Solution**: This was fixed - ensure authMiddleware is imported correctly with destructuring:
```javascript
const { authenticateToken } = require('../middliewares/authMiddleware');
```

### Issue: "Table doesn't exist"
**Solution**: Run the SQL schema file to create the tables

### Issue: "Foreign key constraint fails"
**Solution**: Ensure `branches` and `employees` tables exist

### Issue: "Cannot POST /api/bank-accounts"
**Solution**: Restart the backend server after adding the routes

### Issue: "Unauthorized"
**Solution**: Ensure you're sending the authentication token with requests

## Next Steps

1. Create the database tables
2. Restart backend server
3. Test with your frontend application
4. Check browser console for any API errors

For detailed API documentation, see `BANK_ACCOUNTS_IMPLEMENTATION.md`
