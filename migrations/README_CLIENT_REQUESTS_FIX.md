# Client Requests "Created By" Column Fix

## Issue
When viewing client requests in the frontend app, the "تم الإنشاء بواسطة" (Created By) column shows:
- ✅ Employee name when an employee creates a request on behalf of a client
- ❌ Nothing (empty) when a client creates their own request

## Root Cause
The `client_requests` table was missing several important columns:
1. `created_by` - to track who created the request (employee ID or NULL if self-created)
2. `type` - for request type
3. `details` - for request details
4. `status` - for approval status (pending/approved/rejected/completed)
5. `created_at` - timestamp when the request was created

## Solution

### Step 1: Run the Migration
Execute the migration SQL file to add the missing columns:

```bash
cd backend
node run-migration.js migrations/add_client_requests_created_by.sql
```

Or manually run the SQL commands in `add_client_requests_created_by.sql`

### Step 2: Updated Files
The following files have been updated:

1. **backend/src/models/clientRequestsModel.js**
   - Added `created_by`, `type`, `details`, and `status` fields to insert operation
   - Updated all SELECT queries to join with `employees` table
   - Now fetches `employee_name` and `employee_id` along with client requests

2. **backend/src/services/clientRequestsService.js**
   - Updated to pass `createdBy` parameter to the model

3. **backend/src/controllers/clientRequestsController.js**
   - Already extracts `createdBy` from `req.user.id` (no changes needed)

### Step 3: Frontend Display Logic
The frontend should now display the "Created By" column based on:
- If `created_by` is NOT NULL → Show `employee_name` (employee created it on behalf of client)
- If `created_by` is NULL → Show `client_name` (client created it themselves)

Example frontend logic:
```javascript
// In the requests table
<TableCell>
  {request.created_by ? request.employee_name : request.client_name}
</TableCell>
```

Or with a label:
```javascript
<TableCell>
  {request.created_by 
    ? `${request.employee_name} (موظف)` 
    : `${request.client_name} (العميل نفسه)`}
</TableCell>
```

## Database Schema Changes
```sql
-- New columns added to client_requests table
ALTER TABLE `client_requests` ADD COLUMN `created_by` INT NULL;
ALTER TABLE `client_requests` ADD COLUMN `type` VARCHAR(100) NULL;
ALTER TABLE `client_requests` ADD COLUMN `details` TEXT NULL;
ALTER TABLE `client_requests` ADD COLUMN `status` ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending';
ALTER TABLE `client_requests` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

## Query Changes
Before:
```sql
SELECT cr.*, c.name as client_name
FROM client_requests cr
LEFT JOIN parties c ON cr.client_id = c.id
```

After:
```sql
SELECT cr.*, 
       c.name as client_name,
       e.name as employee_name,
       e.id as employee_id
FROM client_requests cr
LEFT JOIN parties c ON cr.client_id = c.id
LEFT JOIN employees e ON cr.created_by = e.id
```

## Benefits
1. ✅ Track who created each request (employee vs self-service)
2. ✅ Display proper creator information in "تم الإنشاء بواسطة" column
3. ✅ Distinguish between employee-created and client-created requests
4. ✅ Better audit trail and accountability
5. ✅ Support for request types, details, and status tracking

## Testing
After running the migration:
1. Test creating a request as an employee (should show employee name in "Created By")
2. Test creating a request as a client (should show client name in "Created By")
3. Verify existing requests still display correctly
4. Check that the status field works for approval workflows
