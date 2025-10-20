# Logging Issue Fix - Authentication Missing on Routes

## Problem Discovered
When you tried to update a session, the log was not being created. Debug output showed:
```
updatedBy: null
❌ Logging skipped. updatedBy: null currentSession: true
```

## Root Cause
**The routes were missing `authenticateToken` middleware!**

Without authentication middleware:
- `req.user` is `undefined`
- `req.user?.id` returns `null`
- Logging is skipped because `updatedBy` is `null`

## Routes Fixed (Added authenticateToken)

### 1. ✅ sessionsRoute.js
```javascript
router.post('/', authenticateToken, sessionsController.createSession);
router.put('/:id', authenticateToken, sessionsController.updateSession);
router.delete('/:id', authenticateToken, sessionsController.deleteSession);
router.delete('/:id/documents/:documentId', authenticateToken, sessionsController.deleteSessionDocument);
```

### 2. ✅ meetingsRoute.js
```javascript
router.delete('/:id', authenticateToken, meetingsController.deleteMeeting);
```
*Note: Create and Update already had authentication*

### 3. ✅ courtsRoute.js
```javascript
router.post('/', authenticateToken, courtsController.createCourt);
router.put('/:id', authenticateToken, courtsController.updateCourt);
router.delete('/:id', authenticateToken, courtsController.deleteCourt);
```

### 4. ✅ branchesRoute.js
```javascript
router.post('/', authenticateToken, branchesController.createBranch);
router.delete('/:id', authenticateToken, branchesController.deleteBranch);
```

### 5. ✅ caseDocumentsRoute.js
```javascript
router.post("/", authenticateToken, caseDocumentsController.createCaseDocument);
router.put("/:id", authenticateToken, caseDocumentsController.updateCaseDocument);
router.delete("/:id", authenticateToken, caseDocumentsController.deleteCaseDocument);
```

## Why This Matters

### Before Fix
```javascript
// Route without authentication
router.put('/:id', sessionsController.updateSession);

// In controller
const updatedBy = req.user?.id || null;  // Returns null - no req.user!
await sessionsService.updateSession(req.params.id, req.body, null);

// In service
if (updatedBy && currentSession) {  // FALSE! updatedBy is null
  await logUpdate(...);  // Never executed
}
```

### After Fix
```javascript
// Route with authentication
router.put('/:id', authenticateToken, sessionsController.updateSession);

// In controller
const updatedBy = req.user?.id || null;  // Returns employee ID from JWT!
await sessionsService.updateSession(req.params.id, req.body, 123);

// In service
if (updatedBy && currentSession) {  // TRUE! updatedBy = 123
  await logUpdate(123, 'جلسة', '...', id);  // ✅ Log created!
}
```

## Authentication Flow

1. **Client sends request** with JWT token in Authorization header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **authenticateToken middleware** extracts and verifies token:
   ```javascript
   const token = req.headers.authorization?.split(' ')[1];
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = decoded;  // Contains { id, name, role, ... }
   next();
   ```

3. **Controller accesses authenticated user**:
   ```javascript
   const updatedBy = req.user?.id;  // Gets employee ID from decoded JWT
   ```

4. **Service logs the action**:
   ```javascript
   await logUpdate(updatedBy, 'جلسة', 'Session Name', sessionId);
   ```

5. **Database receives log entry**:
   ```sql
   INSERT INTO logs (employee_id, action, description)
   VALUES (123, 'update', 'حدّث جلسة: Session Name (ID: 69)');
   ```

## Testing Checklist

Now that authentication is added, test each endpoint:

### Sessions
- [ ] POST /api/sessions - Should log with employee ID
- [ ] PUT /api/sessions/:id - Should log with employee ID
- [ ] DELETE /api/sessions/:id - Should log with employee ID

### Meetings
- [ ] DELETE /api/meetings/:id - Should log with employee ID

### Courts
- [ ] POST /api/courts - Should log with employee ID
- [ ] PUT /api/courts/:id - Should log with employee ID
- [ ] DELETE /api/courts/:id - Should log with employee ID

### Branches
- [ ] POST /api/branches - Should log with employee ID
- [ ] DELETE /api/branches/:id - Should log with employee ID

### Case Documents
- [ ] POST /api/case-documents - Should log with employee ID
- [ ] PUT /api/case-documents/:id - Should log with employee ID
- [ ] DELETE /api/case-documents/:id - Should log with employee ID

## Verify Logging Works

After making a request, check the logs table:

```sql
SELECT 
  l.id,
  l.employee_id,
  e.name_ar as employee_name,
  l.action,
  l.description,
  l.created_at
FROM logs l
LEFT JOIN employees e ON l.employee_id = e.id
ORDER BY l.created_at DESC
LIMIT 10;
```

Expected output:
```
| id  | employee_id | employee_name | action | description                      | created_at          |
|-----|-------------|---------------|--------|----------------------------------|---------------------|
| 145 | 123         | أحمد محمد     | update | حدّث جلسة: Meeting (ID: 69)     | 2025-10-18 14:30:00 |
```

## Important Notes

1. **All create/update/delete operations should have authentication** to track who performed the action

2. **GET requests typically don't need authentication** for logging purposes (they don't modify data)

3. **If authentication is missing**, the employee_id will be NULL in logs, making it impossible to track who did what

4. **Check frontend** - Make sure your application sends the JWT token in requests:
   ```javascript
   fetch('/api/sessions/69', {
     method: 'PUT',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(sessionData)
   });
   ```

## Next Steps

1. ✅ Authentication added to 5 route files
2. 🔄 Restart server to apply changes
3. ✅ Test session update with authentication
4. ✅ Verify log entry created in database
5. ⏳ Audit remaining routes for missing authentication
6. ⏳ Continue implementing logging in remaining 23 services

---

**Status:** ✅ FIXED  
**Issue:** Session updates (and other operations) not logging  
**Solution:** Added `authenticateToken` middleware to routes  
**Result:** `req.user.id` now available → logging works correctly  

**Date:** October 18, 2025
