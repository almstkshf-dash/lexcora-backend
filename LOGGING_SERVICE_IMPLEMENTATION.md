# Logging Service Implementation Guide

## Overview
This guide shows how to implement logging across all services in the application. The logging service tracks all user actions (add, update, delete, login, other) in the database.

## Database Schema
```sql
CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    action ENUM('add', 'update', 'delete', 'login', 'other') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

## Logging Service Functions

### Available Functions
Located in: `src/services/logsService.js`

1. **logAdd(employeeId, entityType, entityName, entityId)** - Log creation of new records
2. **logUpdate(employeeId, entityType, entityName, entityId)** - Log updates to records
3. **logDelete(employeeId, entityType, entityName, entityId)** - Log deletions
4. **logLogin(employeeId, employeeName)** - Log user login
5. **logCustom(employeeId, description)** - Log custom actions
6. **createLog(employeeId, action, description)** - Direct log creation

## Implementation Examples

### 1. Tasks Service (Already Implemented)
File: `src/services/tasksService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

// In createTask
const createTask = async (task, assignedBy) => {
  const taskId = await tasksModel.createTask(assignedBy, task);
  
  // Log the task creation
  if (assignedBy) {
    await logAdd(assignedBy, 'مهمة', task.title || 'مهمة جديدة', taskId);
  }
  
  return taskId;
};

// In updateTask
const updateTask = async (id, task, updatedBy) => {
  const currentTask = await tasksModel.getTaskById(id);
  const result = await tasksModel.updateTask(id, task);
  
  // Log the task update
  if (updatedBy && currentTask) {
    await logUpdate(updatedBy, 'مهمة', currentTask.title || 'مهمة', id);
  }
  
  return result;
};

// In deleteTask
const deleteTask = async (id, deletedBy = null) => {
  const task = await tasksModel.getTaskById(id);
  const result = await tasksModel.deleteTask(id);
  
  // Log the task deletion
  if (deletedBy && task) {
    await logDelete(deletedBy, 'مهمة', task.title || 'مهمة', id);
  }
  
  return result;
};
```

### 2. Cases Service Example
File: `src/services/casesService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

const createCase = async (caseData, createdBy) => {
  const caseId = await casesModel.createCase(caseData);
  
  // Log case creation
  if (createdBy) {
    await logAdd(
      createdBy, 
      'قضية', 
      caseData.case_number || 'قضية جديدة', 
      caseId
    );
  }
  
  return caseId;
};

const updateCase = async (id, caseData, updatedBy) => {
  const currentCase = await casesModel.getCaseById(id);
  const result = await casesModel.updateCase(id, caseData);
  
  // Log case update
  if (updatedBy && currentCase) {
    await logUpdate(
      updatedBy, 
      'قضية', 
      currentCase.case_number || 'قضية', 
      id
    );
  }
  
  return result;
};

const deleteCase = async (id, deletedBy) => {
  const currentCase = await casesModel.getCaseById(id);
  const result = await casesModel.deleteCase(id);
  
  // Log case deletion
  if (deletedBy && currentCase) {
    await logDelete(
      deletedBy, 
      'قضية', 
      currentCase.case_number || 'قضية', 
      id
    );
  }
  
  return result;
};
```

### 3. Employees Service Example
File: `src/services/employeeService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

const createEmployee = async (employeeData, createdBy) => {
  const employeeId = await employeeModel.createEmployee(employeeData);
  
  // Log employee creation
  if (createdBy) {
    await logAdd(
      createdBy, 
      'موظف', 
      employeeData.name || 'موظف جديد', 
      employeeId
    );
  }
  
  return employeeId;
};

const updateEmployee = async (id, employeeData, updatedBy) => {
  const currentEmployee = await employeeModel.getEmployeeById(id);
  const result = await employeeModel.updateEmployee(id, employeeData);
  
  // Log employee update
  if (updatedBy && currentEmployee) {
    await logUpdate(
      updatedBy, 
      'موظف', 
      currentEmployee.name || 'موظف', 
      id
    );
  }
  
  return result;
};

const deleteEmployee = async (id, deletedBy) => {
  const employee = await employeeModel.getEmployeeById(id);
  const result = await employeeModel.deleteEmployee(id);
  
  // Log employee deletion
  if (deletedBy && employee) {
    await logDelete(
      deletedBy, 
      'موظف', 
      employee.name || 'موظف', 
      id
    );
  }
  
  return result;
};
```

### 4. Clients Service Example
File: `src/services/clientsService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

const createClient = async (clientData, createdBy) => {
  const clientId = await clientsModel.createClient(clientData);
  
  // Log client creation
  if (createdBy) {
    await logAdd(
      createdBy, 
      'عميل', 
      clientData.name || 'عميل جديد', 
      clientId
    );
  }
  
  return clientId;
};

const updateClient = async (id, clientData, updatedBy) => {
  const currentClient = await clientsModel.getClientById(id);
  const result = await clientsModel.updateClient(id, clientData);
  
  // Log client update
  if (updatedBy && currentClient) {
    await logUpdate(
      updatedBy, 
      'عميل', 
      currentClient.name || 'عميل', 
      id
    );
  }
  
  return result;
};
```

### 5. Meetings Service Example
File: `src/services/meetingsService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

const createMeeting = async (meetingData, createdBy) => {
  const meetingId = await meetingsModel.createMeeting(meetingData);
  
  // Log meeting creation
  if (createdBy) {
    await logAdd(
      createdBy, 
      'اجتماع', 
      meetingData.title || 'اجتماع جديد', 
      meetingId
    );
  }
  
  return meetingId;
};

const updateMeeting = async (id, meetingData, updatedBy) => {
  const currentMeeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.updateMeeting(id, meetingData);
  
  // Log meeting update
  if (updatedBy && currentMeeting) {
    await logUpdate(
      updatedBy, 
      'اجتماع', 
      currentMeeting.title || 'اجتماع', 
      id
    );
  }
  
  return result;
};

const deleteMeeting = async (id, deletedBy) => {
  const meeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.deleteMeeting(id);
  
  // Log meeting deletion
  if (deletedBy && meeting) {
    await logDelete(
      deletedBy, 
      'اجتماع', 
      meeting.title || 'اجتماع', 
      id
    );
  }
  
  return result;
};
```

### 6. Documents Service Example
File: `src/services/caseDocumentsService.js`

```javascript
const { logAdd, logUpdate, logDelete } = require('./logsService');

const uploadDocument = async (documentData, uploadedBy) => {
  const documentId = await caseDocumentsModel.uploadDocument(documentData);
  
  // Log document upload
  if (uploadedBy) {
    await logAdd(
      uploadedBy, 
      'مستند قضية', 
      documentData.document_name || 'مستند جديد', 
      documentId
    );
  }
  
  return documentId;
};

const deleteDocument = async (id, deletedBy) => {
  const document = await caseDocumentsModel.getDocumentById(id);
  const result = await caseDocumentsModel.deleteDocument(id);
  
  // Log document deletion
  if (deletedBy && document) {
    await logDelete(
      deletedBy, 
      'مستند قضية', 
      document.document_name || 'مستند', 
      id
    );
  }
  
  return result;
};
```

### 7. Login Authentication Example
File: `src/services/authService.js`

```javascript
const { logLogin } = require('./logsService');

const login = async (username, password) => {
  const employee = await authModel.findByUsername(username);
  
  if (employee && await verifyPassword(password, employee.password)) {
    // Log successful login
    await logLogin(employee.id, employee.name);
    
    const token = generateToken(employee);
    return { employee, token };
  }
  
  throw new Error('Invalid credentials');
};
```

### 8. Custom Actions Example
For actions that don't fit add/update/delete:

```javascript
const { logCustom } = require('./logsService');

// Export data
const exportCases = async (filters, exportedBy) => {
  const data = await casesModel.exportCases(filters);
  
  if (exportedBy) {
    await logCustom(exportedBy, `صدّر قائمة القضايا (${data.length} قضية)`);
  }
  
  return data;
};

// Generate report
const generateReport = async (reportType, employeeId) => {
  const report = await reportsModel.generate(reportType);
  
  if (employeeId) {
    await logCustom(employeeId, `أنشأ تقرير: ${reportType}`);
  }
  
  return report;
};

// Send notification
const sendBulkNotification = async (recipients, message, sentBy) => {
  await notificationsModel.sendBulk(recipients, message);
  
  if (sentBy) {
    await logCustom(
      sentBy, 
      `أرسل إشعار جماعي إلى ${recipients.length} موظف`
    );
  }
};
```

## Controller Updates

Controllers need to pass the employee ID from the authenticated user:

```javascript
// Example controller update
const createTask = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null; // Get from auth middleware
    const task = req.body;
    const taskId = await tasksService.createTask(task, createdBy);
    res.status(201).json({ success: true, id: taskId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const success = await tasksService.updateTask(req.params.id, req.body, updatedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const success = await tasksService.deleteTask(req.params.id, deletedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Entity Type Names (Arabic)

Common entity types for consistent logging:

- قضية - Case
- موظف - Employee
- عميل - Client
- مهمة - Task
- اجتماع - Meeting
- حدث - Event
- مستند - Document
- قرار قضائي - Judicial Order
- جلسة - Session
- محكمة - Court
- فرع - Branch
- قسم - Department
- طلب - Request
- تقرير - Report
- إشعار - Notification
- إجازة سنوية - Annual Leave
- إجازة مرضية - Sick Leave
- حضور - Attendance
- تدريب - Training
- أصل - Asset
- حساب بنكي - Bank Account

## Best Practices

1. **Always wrap logging in try-catch** - Logging should never break main functionality
2. **Use descriptive entity names** - Include relevant identifiers (case number, employee name, etc.)
3. **Pass employee ID from authentication** - Use `req.user.id` from auth middleware
4. **Include entity ID when available** - Helps with tracing specific records
5. **Use Arabic for descriptions** - Maintains consistency with the application
6. **Log important actions only** - Don't log every GET request, focus on modifications
7. **Consider batch operations** - Use `createBulkLogs` for multiple operations

## Querying Logs

### Get all logs
```javascript
GET /api/logs?page=1&limit=50
```

### Get logs by employee
```javascript
GET /api/logs/employee/:employeeId
```

### Get logs by action type
```javascript
GET /api/logs/action/:action
// action can be: add, update, delete, login, other
```

### Get logs by date range
```javascript
GET /api/logs/date-range?startDate=2025-01-01&endDate=2025-12-31
```

## Implementation Checklist

For each service file:

1. ✅ Import logging functions at the top
2. ✅ Add logging to create/add functions
3. ✅ Add logging to update functions
4. ✅ Add logging to delete functions
5. ✅ Update controller to pass employee ID
6. ✅ Test that logs are being created
7. ✅ Verify log descriptions are meaningful

## Services to Update

- [ ] casesService.js
- [ ] employeeService.js
- [ ] clientsService.js (if exists)
- [ ] meetingsService.js
- [ ] eventsService.js
- [ ] caseDocumentsService.js
- [ ] courtCaseDocumentsService.js
- [ ] judicialOrdersService.js
- [ ] sessionsService.js
- [ ] courtsService.js
- [ ] branchesService.js
- [ ] departmentsService.js
- [ ] clientRequestsService.js
- [ ] clientsAgreementsService.js
- [ ] clientsDealsService.js
- [ ] executionsService.js
- [ ] partiesService.js
- [ ] memosService.js
- [ ] depositsService.js
- [ ] bankAccountsService.js
- [✅] tasksService.js (Already done as example)
- [ ] authService.js (for login logging)

## Error Handling

The logging service is designed to fail silently to not interrupt main operations:

```javascript
const createLog = async (employeeId, action, description) => {
  try {
    const [result] = await db.query(
      `INSERT INTO logs (employee_id, action, description, created_at)
       VALUES (?, ?, ?, NOW())`,
      [employeeId, action, description]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating log:', error);
    // Don't throw - logging should not break main functionality
    return null;
  }
};
```

This ensures that if logging fails, the main operation (creating a task, updating a case, etc.) still completes successfully.
