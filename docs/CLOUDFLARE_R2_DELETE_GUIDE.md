# Cloudflare R2 File Deletion Guide

This guide shows how to automatically delete files from Cloudflare R2 when deleting records from the database.

## Overview

When you delete a record (like a session, party, case, etc.) that has associated documents, the database CASCADE will delete the document records from the database, but the actual files remain in Cloudflare R2. This solution automatically deletes files from R2 storage.

## Solution: Cloudflare Service

### File: `backend/src/services/cloudflareService.js`

This service provides reusable functions to delete files from Cloudflare R2.

### Available Functions:

1. **`deleteFileFromR2(documentUrl)`** - Delete a single file
2. **`deleteFilesFromR2(documentUrls)`** - Delete multiple files (batch)
3. **`deleteDocumentFiles(documents)`** - Delete files from an array of document objects

## How to Use in Your Controllers

### Step 1: Import the Service

Add this import to any service file where you delete records:

```javascript
const { deleteDocumentFiles } = require('./cloudflareService');
```

### Step 2: Update Delete Functions

#### Example 1: Delete Session (with all documents)

```javascript
const deleteSession = async (id) => {
  try {
    // 1. Get session documents BEFORE deleting
    const documents = await sessionsModel.getSessionDocuments(id);
    
    // 2. Delete from database (CASCADE will delete document records)
    const result = await sessionsModel.deleteSession(id);
    
    // 3. Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting session');
  }
};
```

#### Example 2: Delete Single Document

```javascript
const deleteSessionDocument = async (documentId, sessionId) => {
  try {
    // 1. Get the document details BEFORE deleting
    const documents = await sessionsModel.getSessionDocuments(sessionId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // 2. Delete from database
    const result = await sessionsModel.deleteSessionDocument(documentId, sessionId);
    
    // 3. Delete file from Cloudflare R2
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteSessionDocument:', error);
    throw new Error('Error deleting session document');
  }
};
```

#### Example 3: Delete Party (with all documents)

```javascript
const deleteParty = async (id) => {
  try {
    // 1. Get party documents BEFORE deleting
    const documents = await partiesModel.getPartyDocuments(id);
    
    // 2. Delete from database
    const result = await partiesModel.deleteParty(id);
    
    // 3. Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting party');
  }
};
```

#### Example 4: Delete Case (with all documents)

```javascript
const deleteCase = async (id) => {
  try {
    // 1. Get all case documents BEFORE deleting
    const caseDocuments = await casesModel.getCaseDocuments(id);
    const courtDocuments = await casesModel.getCourtCaseDocuments(id);
    const allDocuments = [...caseDocuments, ...courtDocuments];
    
    // 2. Delete from database
    const result = await casesModel.deleteCase(id);
    
    // 3. Delete all files from R2
    if (allDocuments.length > 0) {
      await deleteDocumentFiles(allDocuments);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting case');
  }
};
```

## Important Notes

### ⚠️ Always Get Documents BEFORE Deleting

You MUST fetch the document records **before** deleting from the database, because the CASCADE will remove them:

```javascript
// ✅ CORRECT - Get documents first
const documents = await model.getDocuments(id);
await model.delete(id);
await deleteDocumentFiles(documents);

// ❌ WRONG - Documents already deleted by CASCADE
await model.delete(id);
const documents = await model.getDocuments(id); // Returns empty!
await deleteDocumentFiles(documents);
```

### Document Object Format

The service expects documents in this format:

```javascript
[
  {
    id: 1,
    document_name: "contract.pdf",
    document_url: "https://pub-xxx.r2.dev/documents/1234-abc.pdf"
  }
]
```

### URL Handling

The service automatically handles:
- ✅ Full presigned URLs: `https://...r2.cloudflarestorage.com/bucket/folder/file.pdf?X-Amz-...`
- ✅ Public R2.dev URLs: `https://pub-xxx.r2.dev/folder/file.pdf`
- ✅ Custom domain URLs: `https://files.yourdomain.com/folder/file.pdf`
- ✅ Direct keys: `documents/1234-abc.pdf`

## Complete Implementation Checklist

For each entity that has documents (sessions, parties, cases, etc.):

- [ ] Import `deleteDocumentFiles` in the service file
- [ ] Update the delete function to:
  1. Get documents before deleting
  2. Delete from database
  3. Delete files from R2
- [ ] Test deletion to confirm files are removed from R2

## Services That Need Updates

Based on your project structure, update these service files:

1. ✅ `sessionsService.js` - Already updated (example)
2. `partiesService.js` - For party documents
3. `casesService.js` - For case documents
4. `partiesDocumentsService.js` - For individual party document deletion
5. `caseDocumentsService.js` - For individual case document deletion
6. `courtCaseDocumentsService.js` - For court case documents
7. `casePetitionsService.js` - For petition documents
8. Any other service that handles document deletion

## Testing

After implementing, test by:

1. Upload a document to a session/party/case
2. Check Cloudflare R2 bucket - file should be there
3. Delete the session/party/case from your app
4. Check Cloudflare R2 bucket - file should be deleted
5. Check console logs for: `✓ Deleted file from R2: folder/filename.ext`

## Troubleshooting

### Files not deleting?

Check:
1. Environment variables are set correctly
2. Console logs show "✓ Deleted file from R2: ..."
3. You're getting documents BEFORE the database delete
4. The document_url field exists in your database records

### Permission errors?

Ensure your R2 API token has delete permissions:
- Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
- Token should have "Object Read & Write" permissions

## Benefits

✅ Automatic cleanup - no orphaned files  
✅ Saves storage costs  
✅ Works with existing CASCADE constraints  
✅ No frontend changes needed  
✅ Centralized file management  

