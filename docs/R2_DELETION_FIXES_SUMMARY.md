# R2 Storage File Deletion - Fixes Applied

## Date: October 14, 2025

This document summarizes all the fixes applied to ensure files are deleted from Cloudflare R2 storage when documents or records are deleted from the database.

---

## ✅ Services Already Implementing R2 Deletion (Before Fixes)

These services were already correctly deleting files from R2:

1. **partiesService.js** - deleteParty
2. **partiesDocumentsService.js** - deletePartiesDocument
3. **sessionsService.js** - deleteSession, deleteSessionDocument
4. **tasksService.js** - deleteTask, deleteTaskDocument
5. **casePetitionsService.js** - deleteCasePetition, deleteCasePetitionDocument
6. **casesService.js** - deleteCase, deleteCasePartyDocument (partial)
7. **clientsDealsService.js** - deleteDeal, deleteDealDocument
8. **assetsController.js** - deleteAsset, deleteAssetDocument
9. **warningsController.js** - deleteWarning, deleteWarningDocument
10. **employeeDocumentsController.js** - deleteEmployeeDocument

---

## 🔧 Services Fixed (R2 Deletion Added)

### 1. **executionsService.js**
**Functions Updated:**
- ✅ `deleteExecution(id)` - Now deletes all execution documents from R2 before deleting execution
- ✅ `deleteExecutionDocument(id)` - Now deletes the specific document file from R2

**Model Updated:**
- Added `getExecutionDocumentById(id)` to executionsModel.js to retrieve document before deletion

**Changes Made:**
```javascript
// Added import
const { deleteDocumentFiles } = require('./cloudflareService');

// Updated deleteExecution to get and delete documents from R2
// Updated deleteExecutionDocument to get document details and delete from R2
```

---

### 2. **caseDocumentsService.js**
**Functions Updated:**
- ✅ `deleteCaseDocument(id)` - Now deletes the document file from R2

**Changes Made:**
```javascript
// Added import
const { deleteDocumentFiles } = require('./cloudflareService');

// Updated deleteCaseDocument to delete file from R2 after database deletion
```

---

### 3. **courtCaseDocumentsService.js**
**Functions Updated:**
- ✅ `deleteCourtCaseDocument(id)` - Now deletes the document file from R2

**Changes Made:**
```javascript
// Added import
const { deleteDocumentFiles } = require('./cloudflareService');

// Updated deleteCourtCaseDocument to delete file from R2 after database deletion
```

---

### 4. **judicialOrdersService.js**
**Functions Updated:**
- ✅ `deleteJudicialOrder(id)` - Now deletes all judicial order documents from R2
- ✅ `deleteJudicialOrderDocument(id)` - Now deletes the specific document file from R2

**Model Updated:**
- Added `getJudicialOrderDocumentById(id)` to judicialOrdersModel.js

**Changes Made:**
```javascript
// Added import
const { deleteDocumentFiles } = require('./cloudflareService');

// Updated deleteJudicialOrder to get and delete documents from R2
// Updated deleteJudicialOrderDocument to get document details and delete from R2
```

---

### 5. **casesService.js**
**Functions Updated:**
- ✅ `deleteCaseParty(caseId, partyId)` - Fixed and enabled (was returning null), now deletes party documents from R2
- ✅ `deleteEmployeeCaseDocument(caseId, documentId)` - Now deletes employee case document from R2
- ✅ `deleteCaseDocument(caseId, documentId)` - Now deletes case document from R2
- ✅ `deleteCaseCourtDocument(caseId, documentId)` - Now deletes court case document from R2

**Changes Made:**
```javascript
// Service already had deleteDocumentFiles import

// Fixed deleteCaseParty - removed "return null" and enabled R2 deletion
// Updated deleteEmployeeCaseDocument to fetch and delete document from R2
// Updated deleteCaseDocument to fetch and delete document from R2
// Updated deleteCaseCourtDocument to fetch and delete document from R2
```

---

### 6. **memosService.js**
**Functions Updated:**
- ✅ `deleteMemo(id)` - Now deletes all memo documents from R2

**Changes Made:**
```javascript
// Added import
const { deleteDocumentFiles } = require('./cloudflareService');

// Updated deleteMemo to get memo documents and delete from R2
```

---

## ℹ️ Services That Don't Have Documents (No Changes Needed)

The following services were checked and confirmed to NOT have document attachments:
- **clientRequestsService.js** - No documents table
- **clientsAgreementsService.js** - No documents table
- **meetingsService.js** - No documents table
- **petitionOrdersService.js** - No documents table
- **eventsService.js** - No documents table

---

## 📝 How R2 Deletion Works

All fixed services now follow this pattern:

### Pattern 1: Delete Parent Record with Documents
```javascript
const deleteParentRecord = async (id) => {
  try {
    // 1. Get documents BEFORE deleting
    const documents = await model.getDocuments(id);
    
    // 2. Delete from database (CASCADE will delete document records)
    const result = await model.deleteParentRecord(id);
    
    // 3. Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Pattern 2: Delete Single Document
```javascript
const deleteDocument = async (documentId) => {
  try {
    // 1. Get document details BEFORE deleting
    const documentToDelete = await model.getDocumentById(documentId);
    
    // 2. Delete from database
    const result = await model.deleteDocument(documentId);
    
    // 3. Delete file from Cloudflare R2
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

---

## 🔍 Document Field Mapping

Different tables use different field names for document URLs:

| Service | Field Name |
|---------|-----------|
| executionsService | `document_url` |
| judicialOrdersService | `document_url` |
| caseDocumentsService | `url` |
| courtCaseDocumentsService | `url` |
| casesService | `document_url` |
| memosService | `document_url` |
| tasksService | `document_url` |
| sessionsService | `document_url` |
| partiesService | `document_url` |

The `deleteDocumentFiles` function in cloudflareService.js handles both `document_url` and `url` fields automatically.

---

## ✅ Testing Recommendations

To verify these fixes work correctly:

1. **Test Execution Document Deletion**
   - Delete an execution → verify all its documents are removed from R2
   - Delete a single execution document → verify file is removed from R2

2. **Test Judicial Order Document Deletion**
   - Delete a judicial order → verify all its documents are removed from R2
   - Delete a single judicial order document → verify file is removed from R2

3. **Test Case Document Deletions**
   - Delete case documents → verify files removed from R2
   - Delete court case documents → verify files removed from R2
   - Delete employee case documents → verify files removed from R2

4. **Test Case Party Deletion**
   - Delete a case party → verify party documents removed from R2

5. **Test Memo Deletion**
   - Delete a memo → verify all memo documents removed from R2

---

## 🎯 Summary

**Total Services Fixed:** 6
**Total Functions Fixed:** 11

All document deletion operations in your application now properly clean up files from Cloudflare R2 storage, preventing orphaned files and saving storage costs.

**Files Modified:**
1. `src/services/executionsService.js`
2. `src/services/caseDocumentsService.js`
3. `src/services/courtCaseDocumentsService.js`
4. `src/services/judicialOrdersService.js`
5. `src/services/casesService.js`
6. `src/services/memosService.js`
7. `src/models/executionsModel.js`
8. `src/models/judicialOrdersModel.js`

---

## 🔗 Related Documentation

- See `CLOUDFLARE_R2_DELETE_GUIDE.md` for usage examples
- See `CLOUDFLARE_R2_DELETE_EXAMPLES.js` for code examples
- See `cloudflareService.js` for the R2 deletion implementation
