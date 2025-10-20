# Logging System Architecture & Flow

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
│                    POST /api/tasks (Create Task)                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION MIDDLEWARE                     │
│  - Validates JWT token                                          │
│  - Sets req.user = { id: 5, name: "Ahmed", role: "admin" }     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TASKS CONTROLLER                           │
│  tasksController.js                                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ const createTask = async (req, res) => {                  │ │
│  │   const createdBy = req.user.id;  // Extract user ID      │ │
│  │   const task = req.body;                                  │ │
│  │   const taskId = await tasksService.createTask(           │ │
│  │     task,                                                 │ │
│  │     createdBy  // Pass to service ◄────────────────┐     │ │
│  │   );                                               │     │ │
│  │   res.json({ success: true, id: taskId });         │     │ │
│  │ }                                                  │     │ │
│  └────────────────────────────────────────────────────┼─────┘ │
└─────────────────────────────────────────────────────┬─┼────────┘
                                                      │ │
                                                      ▼ │
┌─────────────────────────────────────────────────────────────────┐
│                       TASKS SERVICE                             │
│  tasksService.js                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ const createTask = async (task, createdBy) => {           │ │
│  │   // 1. Create the task                                   │ │
│  │   const taskId = await tasksModel.createTask(task);       │ │
│  │                                                            │ │
│  │   // 2. Log the action ◄────────────────────────────┐    │ │
│  │   if (createdBy) {                                  │    │ │
│  │     await logAdd(                                   │    │ │
│  │       createdBy,    // employee_id = 5             │    │ │
│  │       'مهمة',       // entity type                 │    │ │
│  │       task.title,   // entity name                 │    │ │
│  │       taskId        // entity id                   │    │ │
│  │     );                                             │    │ │
│  │   }                                                │    │ │
│  │   return taskId;                                   │    │ │
│  │ }                                                  │    │ │
│  └────────────────────────────────────────────────────┼────┘ │
└─────────────────────────────────────────────────────┬─┼───────┘
                                                      │ │
                                     ┌────────────────┘ │
                                     │                  │
                        ┌────────────▼──────┐          │
                        │  TASKS MODEL      │          │
                        │  Insert into      │          │
                        │  tasks table      │          │
                        └───────────────────┘          │
                                                       │
                                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                        LOGS SERVICE                             │
│  logsService.js                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ const logAdd = async (                                    │ │
│  │   employeeId,    // 5                                     │ │
│  │   entityType,    // 'مهمة'                                │ │
│  │   entityName,    // 'Complete Report'                     │ │
│  │   entityId       // 123                                   │ │
│  │ ) => {                                                    │ │
│  │   const description =                                     │ │
│  │     `أضاف ${entityType}: ${entityName} (ID: ${entityId})`│ │
│  │   // "أضاف مهمة: Complete Report (ID: 123)"              │ │
│  │                                                           │ │
│  │   return await createLog(                                │ │
│  │     employeeId,     // 5                                 │ │
│  │     'add',          // action type                       │ │
│  │     description     // full description                  │ │
│  │   );                                                     │ │
│  │ }                                                        │ │
│  └──────────────────────────────────┬────────────────────────┘ │
└─────────────────────────────────────┼──────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ INSERT INTO logs (                                        │ │
│  │   employee_id,                                            │ │
│  │   action,                                                 │ │
│  │   description,                                            │ │
│  │   created_at                                              │ │
│  │ ) VALUES (                                                │ │
│  │   5,                  -- employee_id                      │ │
│  │   'add',              -- action                           │ │
│  │   'أضاف مهمة: Complete Report (ID: 123)',  -- description│ │
│  │   NOW()               -- created_at                       │ │
│  │ );                                                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ LOGS TABLE                                                │ │
│  ├────┬─────────────┬────────┬─────────────────┬────────────┤ │
│  │ id │ employee_id │ action │ description     │ created_at │ │
│  ├────┼─────────────┼────────┼─────────────────┼────────────┤ │
│  │ 1  │ 5           │ add    │ أضاف مهمة: ...  │ 2025-10-18 │ │
│  └────┴─────────────┴────────┴─────────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow for Different Operations

### CREATE Operation Flow
```
User Action → Controller → Service → Model → Database
                  ↓           ↓
                  └─────→ LogsService → Logs Database
```

### UPDATE Operation Flow
```
User Action → Controller → Service → Get Current Data → Model → Database
                  ↓           ↓                            
                  └─────→ LogsService → Logs Database
```

### DELETE Operation Flow
```
User Action → Controller → Service → Get Current Data → Model → Database
                  ↓           ↓                            
                  └─────→ LogsService → Logs Database
```

## 📋 Component Responsibilities

### 1. Controller Layer
**Responsibility:** Extract user identity and pass to service
```javascript
✅ Get employee ID from req.user
✅ Pass to service functions
❌ No direct logging
❌ No business logic
```

### 2. Service Layer
**Responsibility:** Business logic + Logging
```javascript
✅ Perform business operations
✅ Call logging functions
✅ Handle file uploads, notifications, etc.
❌ No direct database queries (use models)
```

### 3. Logs Service
**Responsibility:** Centralized logging logic
```javascript
✅ Format log descriptions
✅ Handle different action types
✅ Insert logs into database
✅ Fail silently (don't break main operations)
```

### 4. Model Layer
**Responsibility:** Database operations
```javascript
✅ Execute SQL queries
✅ Return data
❌ No logging
❌ No business logic
```

## 🎯 Request Examples

### Example 1: Create Task

**Request:**
```http
POST /api/tasks
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "Complete Project Report",
  "description": "Finish the Q4 report",
  "assigned_to": 10,
  "priority": "high"
}
```

**Decoded JWT Token:**
```json
{
  "id": 5,
  "username": "ahmed.ali",
  "name": "Ahmed Ali",
  "role": "manager"
}
```

**Result in Logs Table:**
```
| id | employee_id | action | description                                  | created_at          |
|----|-------------|--------|----------------------------------------------|---------------------|
| 45 | 5           | add    | أضاف مهمة: Complete Project Report (ID: 123) | 2025-10-18 10:30:00 |
```

### Example 2: Update Case

**Request:**
```http
PUT /api/cases/456
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "in_progress",
  "file_number": "2024/789"
}
```

**Decoded JWT Token:**
```json
{
  "id": 3,
  "username": "sara.mohamed",
  "name": "Sara Mohamed",
  "role": "lawyer"
}
```

**Result in Logs Table:**
```
| id | employee_id | action | description                    | created_at          |
|----|-------------|--------|--------------------------------|---------------------|
| 46 | 3           | update | حدّث قضية: 2024/789 (ID: 456) | 2025-10-18 11:45:00 |
```

### Example 3: Delete Meeting

**Request:**
```http
DELETE /api/meetings/789
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Decoded JWT Token:**
```json
{
  "id": 2,
  "username": "khaled.omar",
  "name": "Khaled Omar",
  "role": "admin"
}
```

**Result in Logs Table:**
```
| id | employee_id | action | description                                | created_at          |
|----|-------------|--------|--------------------------------------------|---------------------|
| 47 | 2           | delete | حذف اجتماع: Weekly Team Meeting (ID: 789) | 2025-10-18 14:20:00 |
```

### Example 4: User Login

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Result in Logs Table:**
```
| id | employee_id | action | description                | created_at          |
|----|-------------|--------|----------------------------|---------------------|
| 48 | 1           | login  | تسجيل دخول: Admin User     | 2025-10-18 09:00:00 |
```

## 🔍 Log Query Examples

### Get all logs for a specific employee
```sql
SELECT * FROM logs 
WHERE employee_id = 5 
ORDER BY created_at DESC;
```

### Get all add actions
```sql
SELECT * FROM logs 
WHERE action = 'add' 
ORDER BY created_at DESC;
```

### Get logs for today
```sql
SELECT * FROM logs 
WHERE DATE(created_at) = CURDATE() 
ORDER BY created_at DESC;
```

### Get logs for a specific date range
```sql
SELECT * FROM logs 
WHERE created_at BETWEEN '2025-10-01' AND '2025-10-31' 
ORDER BY created_at DESC;
```

### Get employee activity summary
```sql
SELECT 
  e.name,
  l.action,
  COUNT(*) as count
FROM logs l
JOIN employees e ON l.employee_id = e.id
GROUP BY e.name, l.action
ORDER BY count DESC;
```

## 🛡️ Error Handling

The logging system is designed to **fail silently** to ensure main operations always complete:

```javascript
const createLog = async (employeeId, action, description) => {
  try {
    // Insert log into database
    const [result] = await db.query(...);
    return result.insertId;
  } catch (error) {
    console.error('Error creating log:', error);
    // ⚠️ Don't throw - just log the error
    return null;
  }
};
```

**Why?**
- Creating a task should succeed even if logging fails
- Logging is for audit, not critical functionality
- Database issues shouldn't break the app
- Errors are logged to console for debugging

## 📊 Benefits Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LOGGING SYSTEM BENEFITS                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Audit Trail                                             │
│     Complete history of who did what and when               │
│                                                             │
│  👤 Accountability                                          │
│     Track individual employee actions                       │
│                                                             │
│  🐛 Debugging                                               │
│     Investigate issues by reviewing logs                    │
│                                                             │
│  📜 Compliance                                              │
│     Meet legal and regulatory requirements                  │
│                                                             │
│  🔒 Security                                                │
│     Detect unauthorized or suspicious activities            │
│                                                             │
│  📈 Analytics                                               │
│     Understand usage patterns and productivity              │
│                                                             │
│  📊 Reporting                                               │
│     Generate activity reports for management                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Implementation Status

```
Services with Logging Implemented:
✅ tasksService.js        - Create, Update, Delete
✅ casesService.js        - Create, Update, Delete
✅ authService.js         - Login

Services Pending:
⏳ employeeService.js
⏳ meetingsService.js
⏳ sessionsService.js
⏳ caseDocumentsService.js
⏳ [Other services...]
```

---

**Follow the patterns shown above to implement logging across all services! 🚀**
