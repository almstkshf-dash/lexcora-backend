# Batch Service Logging Update Script

This document contains the update pattern for all remaining services. Apply these changes to each service file.

## Services Updated So Far (11/35)

✅ 1. tasksService.js
✅ 2. casesService.js  
✅ 3. authService.js
✅ 4. depositsService.js
✅ 5. employeeService.js
✅ 6. meetingsService.js
✅ 7. sessionsService.js
✅ 8. eventsService.js
✅ 9. caseDocumentsService.js
✅ 10. partiesService.js
✅ 11. courtsService.js
✅ 12. branchesService.js

## Remaining Services to Update (23)

### Template for Simple Services (Create, Update, Delete)

```javascript
// At top of file - ADD THIS LINE
const { logAdd, logUpdate, logDelete } = require('./logsService');

// In create function - ADD createdBy parameter and logging
const createEntity = async (data, createdBy = null) => {
  const entityId = await model.createEntity(data);
  
  if (createdBy) {
    await logAdd(createdBy, 'نوع الكيان', data.name || data.title || 'كيان جديد', entityId);
  }
  
  return entityId;
};

// In update function - ADD updatedBy parameter and logging
const updateEntity = async (id, data, updatedBy = null) => {
  const current = await model.getById(id);
  const result = await model.update(id, data);
  
  if (updatedBy && current) {
    await logUpdate(updatedBy, 'نوع الكيان', current.name || current.title || 'كيان', id);
  }
  
  return result;
};

// In delete function - ADD deletedBy parameter and logging
const deleteEntity = async (id, deletedBy = null) => {
  const entity = await model.getById(id);
  const result = await model.delete(id);
  
  if (deletedBy && entity) {
    await logDelete(deletedBy, 'نوع الكيان', entity.name || entity.title || 'كيان', id);
  }
  
  return result;
};
```

## Service-Specific Updates

### 13. departmentsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'قسم'
// Name Field: department.name
```

### 14. executionsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'تنفيذ'
// Name Field: execution.title or execution.execution_number
```

### 15. judicialOrdersService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'قرار قضائي'
// Name Field: order.title or order.order_number
```

### 16. policeStationsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'مركز شرطة'
// Name Field: station.name
```

### 17. publicProsecutionsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'نيابة عامة'
// Name Field: prosecution.name
```

### 18. clientRequestsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'طلب عميل'
// Name Field: request.title or request.description
```

### 19. clientsAgreementsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'اتفاقية عميل'
// Name Field: agreement.title or agreement.agreement_number
```

### 20. clientsDealsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'صفقة عميل'
// Name Field: deal.title or deal.deal_number
```

### 21. bankAccountsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'حساب بنكي'
// Name Field: account.account_name or account.account_number
```

### 22. caseClassificationsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'تصنيف قضية'
// Name Field: classification.name
```

### 23. caseDegreesService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'درجة قضية'
// Name Field: degree.name
```

### 24. caseTypesService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'نوع قضية'
// Name Field: type.name
```

### 25. litigationDegreesService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'درجة تقاضي'
// Name Field: degree.name
```

### 26. memosService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'مذكرة'
// Name Field: memo.title or memo.subject
```

### 27. externalLinksService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'رابط خارجي'
// Name Field: link.title or link.url
```

### 28. casePetitionsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'عريضة قضية'
// Name Field: petition.title or petition.petition_number
```

### 29. petitionOrdersService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'أمر عريضة'
// Name Field: order.title or order.order_number
```

### 30. partiesOrdersService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'أمر طرف'
// Name Field: order.title or order.order_number
```

### 31. partiesDocumentsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'مستند طرف'
// Name Field: document.document_name or document.name
```

### 32. courtCaseDocumentsService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'مستند محكمة'
// Name Field: document.document_name or document.name
```

### 33. caseEmployeesService.js
```javascript
// Import
const { logAdd, logDelete } = require('./logsService');

// For assignment
const assignEmployee = async (caseId, employeeId, assignedBy = null) => {
  const result = await model.assignEmployee(caseId, employeeId);
  
  if (assignedBy) {
    await logAdd(assignedBy, 'تعيين موظف لقضية', `قضية ${caseId} - موظف ${employeeId}`, null);
  }
  
  return result;
};

// For removal  
const removeEmployee = async (caseId, employeeId, removedBy = null) => {
  const result = await model.removeEmployee(caseId, employeeId);
  
  if (removedBy) {
    await logDelete(removedBy, 'تعيين موظف لقضية', `قضية ${caseId} - موظف ${employeeId}`, null);
  }
  
  return result;
};
```

### 34. rolesService.js
```javascript
// Import
const { logAdd, logUpdate, logDelete } = require('./logsService');

// Entity Type: 'دور'
// Name Field: role.name
```

### 35. permissionsService.js
```javascript
// Import
const { logAdd, logDelete } = require('./logsService');

// For granting permission
const grantPermission = async (employeeId, permissionId, grantedBy = null) => {
  const result = await model.grantPermission(employeeId, permissionId);
  
  if (grantedBy) {
    await logAdd(grantedBy, 'منح صلاحية', `موظف ${employeeId} - صلاحية ${permissionId}`, null);
  }
  
  return result;
};

// For revoking permission
const revokePermission = async (employeeId, permissionId, revokedBy = null) => {
  const result = await model.revokePermission(employeeId, permissionId);
  
  if (revokedBy) {
    await logDelete(revokedBy, 'إلغاء صلاحية', `موظف ${employeeId} - صلاحية ${permissionId}`, null);
  }
  
  return result;
};
```

## Quick Reference: Entity Types in Arabic

| Service | Arabic Entity Type |
|---------|-------------------|
| departments | قسم |
| executions | تنفيذ |
| judicialOrders | قرار قضائي |
| policeStations | مركز شرطة |
| publicProsecutions | نيابة عامة |
| clientRequests | طلب عميل |
| clientsAgreements | اتفاقية عميل |
| clientsDeals | صفقة عميل |
| bankAccounts | حساب بنكي |
| caseClassifications | تصنيف قضية |
| caseDegrees | درجة قضية |
| caseTypes | نوع قضية |
| litigationDegrees | درجة تقاضي |
| memos | مذكرة |
| externalLinks | رابط خارجي |
| casePetitions | عريضة قضية |
| petitionOrders | أمر عريضة |
| partiesOrders | أمر طرف |
| partiesDocuments | مستند طرف |
| courtCaseDocuments | مستند محكمة |
| caseEmployees | تعيين موظف لقضية |
| roles | دور |
| permissions | صلاحية |

## Controller Updates Required

After updating each service, update the corresponding controller to pass `req.user.id`:

```javascript
// In controller file
const createEntity = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const result = await service.createEntity(req.body, createdBy);
    res.status(201).json({ success: true, id: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateEntity = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const result = await service.updateEntity(req.params.id, req.body, updatedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteEntity = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const result = await service.deleteEntity(req.params.id, deletedBy);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

## Progress Checklist

Mark these as you complete them:

- [ ] 13. departmentsService.js + departmentsController.js
- [ ] 14. executionsService.js + executionsController.js
- [ ] 15. judicialOrdersService.js + judicialOrdersController.js
- [ ] 16. policeStationsService.js + policeStationsController.js
- [ ] 17. publicProsecutionsService.js + publicProsecutionsController.js
- [ ] 18. clientRequestsService.js + clientRequestsController.js
- [ ] 19. clientsAgreementsService.js + clientsAgreementsController.js
- [ ] 20. clientsDealsService.js + clientsDealsService.js
- [ ] 21. bankAccountsService.js + bankAccountsController.js
- [ ] 22. caseClassificationsService.js + caseClassificationsController.js
- [ ] 23. caseDegreesService.js + caseDegreesController.js
- [ ] 24. caseTypesService.js + caseTypesController.js
- [ ] 25. litigationDegreesService.js + litigationDegreesController.js
- [ ] 26. memosService.js + memosController.js
- [ ] 27. externalLinksService.js + externalLinksController.js
- [ ] 28. casePetitionsService.js + casePetitionsController.js
- [ ] 29. petitionOrdersService.js + petitionOrdersController.js
- [ ] 30. partiesOrdersService.js + partiesOrdersController.js
- [ ] 31. partiesDocumentsService.js + partiesDocumentsController.js
- [ ] 32. courtCaseDocumentsService.js + courtCaseDocumentsController.js
- [ ] 33. caseEmployeesService.js + caseEmployeesController.js
- [ ] 34. rolesService.js + rolesController.js
- [ ] 35. permissionsService.js + permissionsController.js

## Testing Each Service

After updating each service, test with:

1. Create operation - verify log entry with action='add'
2. Update operation - verify log entry with action='update'
3. Delete operation - verify log entry with action='delete'
4. Check that employee_id is correctly populated
5. Check that description is meaningful

```sql
-- Check recent logs
SELECT * FROM logs ORDER BY created_at DESC LIMIT 20;

-- Check logs for specific action
SELECT * FROM logs WHERE action = 'add' ORDER BY created_at DESC LIMIT 10;
```
