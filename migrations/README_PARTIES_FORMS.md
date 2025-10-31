# Parties Forms Implementation

## Overview
This implementation adds a client forms management system with two types:
- **الرسائل الترحيبية** (Welcome Messages)
- **عروض الاسعار** (Price Quotes)

## Database Migration

### Step 1: Run the SQL Migration
Execute the migration file to create the `parties_forms` table:

```bash
# Connect to your MySQL database and run:
mysql -u your_username -p your_database < backend/migrations/create_parties_forms_table.sql
```

Or manually execute the SQL:
```sql
CREATE TABLE IF NOT EXISTS parties_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_url VARCHAR(500) NOT NULL,
  type ENUM('welcome_message', 'price_quote') NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_type (type),
  INDEX idx_created_by (created_by),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Backend Implementation

### Files Created:
1. **Model**: `backend/src/models/partiesFormsModel.js`
   - CRUD operations for parties forms
   - Type validation

2. **Controller**: `backend/src/controllers/partiesFormsController.js`
   - Request handling
   - Business logic
   - S3 file deletion on form removal

3. **Routes**: `backend/src/routes/partiesFormsRoute.js`
   - API endpoints: GET, POST, PUT, DELETE
   - Download endpoint

4. **App Integration**: `backend/src/app.js`
   - Route registered at `/api/parties-forms`

## Frontend Implementation

### Files Created:
1. **Page**: `frontend/src/app/client-forms/page.js`
   - Two tabs for form types
   - Grid display of forms
   - Delete confirmation dialog
   - Download functionality

2. **Modal**: `frontend/src/app/client-forms/AddFormModal.js`
   - Form title input
   - Type selection
   - File upload
   - Validation

3. **API Service**: `frontend/src/app/services/api/partiesForms.js`
   - API calls to backend
   - File upload integration

4. **Translations**: 
   - `frontend/messages/ar.json`
   - `frontend/messages/en.json`
   - Added clientForms section with all required translations

### Features:
- ✅ Two-tab interface (Welcome Messages / Price Quotes)
- ✅ Upload documents (PDF, DOC, DOCX)
- ✅ Delete forms with confirmation
- ✅ Download forms
- ✅ Display created by and created at
- ✅ Responsive grid layout
- ✅ Dark mode support
- ✅ RTL/LTR support

## API Endpoints

### GET /api/parties-forms
Get all parties forms (optional query param: `?type=welcome_message` or `?type=price_quote`)

### GET /api/parties-forms/:id
Get a specific form by ID

### POST /api/parties-forms
Create a new form
```json
{
  "title": "Form Title",
  "document_name": "filename.pdf",
  "document_url": "https://...",
  "type": "welcome_message"
}
```

### PUT /api/parties-forms/:id
Update a form

### DELETE /api/parties-forms/:id
Delete a form (also removes file from S3)

### GET /api/parties-forms/:id/download
Download a form (redirects to S3 URL)

### GET /api/parties-forms/types
Get available form types

## Testing

1. Start backend server:
```bash
cd backend
npm run dev
```

2. Start frontend server:
```bash
cd frontend
npm run dev
```

3. Navigate to `/client-forms` in the application
4. Test adding forms with different types
5. Test downloading and deleting forms

## Notes
- Files are stored in Cloudflare R2 (or AWS S3 compatible storage)
- Foreign key relationship with `employees` table for tracking who created the form
- Automatic file cleanup when form is deleted
- Form types are enforced at database level with ENUM
