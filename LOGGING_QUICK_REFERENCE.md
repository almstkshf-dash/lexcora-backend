# Quick Reference: Adding Logging to a Service

## 1️⃣ Import the logging functions

At the top of your service file:

```javascript
const { logAdd, logUpdate, logDelete, logCustom } = require('./logsService');
```

## 2️⃣ Add employee ID parameter to service functions

```javascript
// BEFORE
const createTask = async (taskData) => { ... }

// AFTER
const createTask = async (taskData, createdBy) => { ... }
```

```javascript
// BEFORE
const updateTask = async (id, taskData) => { ... }

// AFTER
const updateTask = async (id, taskData, updatedBy) => { ... }
```

```javascript
// BEFORE
const deleteTask = async (id) => { ... }

// AFTER
const deleteTask = async (id, deletedBy) => { ... }
```

## 3️⃣ Add logging calls in service functions

### For CREATE operations:

```javascript
const createTask = async (taskData, createdBy) => {
  // Create the record
  const taskId = await tasksModel.createTask(taskData);
  
  // Log the action
  if (createdBy) {
    await logAdd(createdBy, 'مهمة', taskData.title || 'مهمة جديدة', taskId);
  }
  
  return taskId;
};
```

### For UPDATE operations:

```javascript
const updateTask = async (id, taskData, updatedBy) => {
  // Get current data (for the name in log)
  const currentTask = await tasksModel.getTaskById(id);
  
  // Update the record
  const result = await tasksModel.updateTask(id, taskData);
  
  // Log the action
  if (updatedBy && currentTask) {
    await logUpdate(updatedBy, 'مهمة', currentTask.title || 'مهمة', id);
  }
  
  return result;
};
```

### For DELETE operations:

```javascript
const deleteTask = async (id, deletedBy) => {
  // Get current data (for the name in log)
  const task = await tasksModel.getTaskById(id);
  
  // Delete the record
  const result = await tasksModel.deleteTask(id);
  
  // Log the action
  if (deletedBy && task) {
    await logDelete(deletedBy, 'مهمة', task.title || 'مهمة', id);
  }
  
  return result;
};
```

### For CUSTOM operations:

```javascript
const exportData = async (filters, employeeId) => {
  const data = await model.export(filters);
  
  if (employeeId) {
    await logCustom(employeeId, `صدّر البيانات (${data.length} سجل)`);
  }
  
  return data;
};
```

## 4️⃣ Update the controller

Get employee ID from `req.user` and pass it to the service:

```javascript
const createTask = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const taskId = await tasksService.createTask(req.body, createdBy);
    res.status(201).json({ success: true, id: taskId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const result = await tasksService.updateTask(req.params.id, req.body, updatedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const result = await tasksService.deleteTask(req.params.id, deletedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## 📝 Entity Type Names (Arabic)

Use these consistent names across your application:

| English | Arabic | Usage |
|---------|--------|-------|
| Task | مهمة | `logAdd(id, 'مهمة', taskName, taskId)` |
| Case | قضية | `logAdd(id, 'قضية', caseNumber, caseId)` |
| Employee | موظف | `logAdd(id, 'موظف', empName, empId)` |
| Client | عميل | `logAdd(id, 'عميل', clientName, clientId)` |
| Meeting | اجتماع | `logAdd(id, 'اجتماع', meetingTitle, meetingId)` |
| Event | حدث | `logAdd(id, 'حدث', eventTitle, eventId)` |
| Document | مستند | `logAdd(id, 'مستند', docName, docId)` |
| Session | جلسة | `logAdd(id, 'جلسة', sessionTitle, sessionId)` |
| Court | محكمة | `logAdd(id, 'محكمة', courtName, courtId)` |
| Branch | فرع | `logAdd(id, 'فرع', branchName, branchId)` |
| Department | قسم | `logAdd(id, 'قسم', deptName, deptId)` |
| Request | طلب | `logAdd(id, 'طلب', requestTitle, requestId)` |
| Report | تقرير | `logCustom(id, 'أنشأ تقرير: ' + reportType)` |
| Notification | إشعار | `logCustom(id, 'أرسل إشعار')` |
| Leave | إجازة | `logAdd(id, 'إجازة', leaveType, leaveId)` |
| Attendance | حضور | `logCustom(id, 'سجل الحضور')` |
| Training | تدريب | `logAdd(id, 'تدريب', trainingTitle, trainingId)` |
| Asset | أصل | `logAdd(id, 'أصل', assetName, assetId)` |
| Bank Account | حساب بنكي | `logAdd(id, 'حساب بنكي', accountName, accountId)` |

## ⚡ Function Signatures

```javascript
// Log functions
logAdd(employeeId, entityType, entityName, entityId)
logUpdate(employeeId, entityType, entityName, entityId)
logDelete(employeeId, entityType, entityName, entityId)
logLogin(employeeId, employeeName)
logCustom(employeeId, description)

// Direct log creation
createLog(employeeId, action, description)
// action: 'add', 'update', 'delete', 'login', 'other'
```

## ✅ Checklist for Each Service

- [ ] Import logging functions
- [ ] Add `createdBy` parameter to create function
- [ ] Add `updatedBy` parameter to update function  
- [ ] Add `deletedBy` parameter to delete function
- [ ] Call `logAdd()` in create function
- [ ] Call `logUpdate()` in update function
- [ ] Call `logDelete()` in delete function
- [ ] Update controller to pass `req.user.id`
- [ ] Test create/update/delete operations
- [ ] Verify logs are created in database

## 🎯 Common Patterns

### Pattern 1: Simple Create
```javascript
const id = await model.create(data);
if (createdBy) {
  await logAdd(createdBy, 'نوع', data.name, id);
}
return id;
```

### Pattern 2: Create with Files
```javascript
const id = await model.create(data);
await uploadFiles(id, files);
if (createdBy) {
  await logAdd(createdBy, 'نوع', data.name, id);
}
return id;
```

### Pattern 3: Update
```javascript
const current = await model.getById(id);
const result = await model.update(id, data);
if (updatedBy && current) {
  await logUpdate(updatedBy, 'نوع', current.name, id);
}
return result;
```

### Pattern 4: Delete with Cascade
```javascript
const item = await model.getById(id);
await deleteRelatedItems(id);
const result = await model.delete(id);
if (deletedBy && item) {
  await logDelete(deletedBy, 'نوع', item.name, id);
}
return result;
```

## 🔍 Example: Complete Service File

```javascript
// meetingsService.js
const meetingsModel = require('../models/meetingsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const createMeeting = async (meetingData, createdBy) => {
  const meetingId = await meetingsModel.createMeeting(meetingData);
  
  if (createdBy) {
    await logAdd(createdBy, 'اجتماع', meetingData.title || 'اجتماع جديد', meetingId);
  }
  
  return meetingId;
};

const updateMeeting = async (id, meetingData, updatedBy) => {
  const currentMeeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.updateMeeting(id, meetingData);
  
  if (updatedBy && currentMeeting) {
    await logUpdate(updatedBy, 'اجتماع', currentMeeting.title || 'اجتماع', id);
  }
  
  return result;
};

const deleteMeeting = async (id, deletedBy) => {
  const meeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.deleteMeeting(id);
  
  if (deletedBy && meeting) {
    await logDelete(deletedBy, 'اجتماع', meeting.title || 'اجتماع', id);
  }
  
  return result;
};

module.exports = {
  createMeeting,
  updateMeeting,
  deleteMeeting
};
```

## 🔍 Example: Complete Controller File

```javascript
// meetingsController.js
const meetingsService = require('../services/meetingsService');

const createMeeting = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const meetingId = await meetingsService.createMeeting(req.body, createdBy);
    res.status(201).json({ success: true, id: meetingId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const result = await meetingsService.updateMeeting(req.params.id, req.body, updatedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const result = await meetingsService.deleteMeeting(req.params.id, deletedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createMeeting,
  updateMeeting,
  deleteMeeting
};
```

---

**That's it! Just follow this pattern for every service. Copy-paste and adjust the entity type name. 🚀**
