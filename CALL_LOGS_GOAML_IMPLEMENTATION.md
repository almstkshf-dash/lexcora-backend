# Call Logs and GoAML Backend Implementation

This document describes the backend implementation for Call Logs and GoAML features.

## Files Created

### Call Logs
1. **Controller**: `backend/src/controllers/callLogsController.js`
2. **Model**: `backend/src/models/callLogsModel.js`
3. **Routes**: `backend/src/routes/callLogsRoute.js`

### GoAML
1. **Controller**: `backend/src/controllers/goamlController.js`
2. **Model**: `backend/src/models/goamlModel.js`
3. **Routes**: `backend/src/routes/goamlRoute.js`

### Database
- **Migration File**: `backend/database_migrations/create_call_logs_and_goaml_tables.sql`

### Updated Files
- `backend/src/app.js` - Added route imports and registrations

## Database Setup

### Option 1: Using MySQL Command Line

```bash
# Connect to your MySQL database
mysql -u your_username -p your_database_name

# Run the migration file
source backend/database_migrations/create_call_logs_and_goaml_tables.sql
```

### Option 2: Using MySQL Workbench or phpMyAdmin

1. Open your database management tool
2. Select your database
3. Copy and execute the SQL from `backend/database_migrations/create_call_logs_and_goaml_tables.sql`

## Database Tables

### call_logs Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| caller_name | VARCHAR(255) | Name of the caller |
| phone_number | VARCHAR(50) | Phone number |
| call_type | ENUM | 'incoming', 'outgoing', 'missed' |
| call_date | DATE | Date of the call |
| call_time | TIME | Time of the call |
| duration | VARCHAR(50) | Call duration |
| notes | TEXT | Additional notes |
| status | ENUM | 'pending', 'completed', 'follow_up' |
| created_by | INT | Foreign key to employees |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### goaml Table

| Field | Type | Description |
|-------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(255) | Name of the person/entity |
| phone | VARCHAR(50) | Phone number |
| note | TEXT | Additional notes |
| date | DATE | Record date |
| status | ENUM | 'compliant', 'safe', 'under_review' |
| created_by | INT | Foreign key to employees |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

## API Endpoints

### Call Logs Endpoints

```
GET    /api/call-logs              - Get all call logs (with pagination & filters)
GET    /api/call-logs/:id          - Get specific call log by ID
POST   /api/call-logs              - Create new call log
PUT    /api/call-logs/:id          - Update call log
DELETE /api/call-logs/:id          - Delete call log
```

#### Query Parameters for GET /api/call-logs

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search in caller_name, phone_number, or notes
- `callType` - Filter by call type (incoming, outgoing, missed)

### GoAML Endpoints

```
GET    /api/goaml                  - Get all GoAML records
GET    /api/goaml/:id              - Get specific GoAML record by ID
POST   /api/goaml                  - Create new GoAML record
PUT    /api/goaml/:id              - Update GoAML record
DELETE /api/goaml/:id              - Delete GoAML record
```

## Testing the APIs

### Test Call Logs

#### Create a Call Log

```bash
curl -X POST http://localhost:5000/api/call-logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "caller_name": "أحمد محمد",
    "phone_number": "+966501234567",
    "call_type": "incoming",
    "call_date": "2025-10-18",
    "call_time": "10:30:00",
    "duration": "5:30",
    "notes": "استفسار عن قضية",
    "status": "completed"
  }'
```

#### Get All Call Logs

```bash
curl -X GET "http://localhost:5000/api/call-logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a Call Log

```bash
curl -X PUT http://localhost:5000/api/call-logs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "caller_name": "أحمد محمد",
    "phone_number": "+966501234567",
    "call_type": "incoming",
    "call_date": "2025-10-18",
    "call_time": "10:30:00",
    "duration": "5:30",
    "notes": "تم التواصل معه",
    "status": "completed"
  }'
```

#### Delete a Call Log

```bash
curl -X DELETE http://localhost:5000/api/call-logs/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test GoAML

#### Create a GoAML Record

```bash
curl -X POST http://localhost:5000/api/goaml \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "محمد علي",
    "phone": "+966501234567",
    "note": "سجل مطابقة",
    "date": "2025-10-18",
    "status": "compliant"
  }'
```

#### Get All GoAML Records

```bash
curl -X GET http://localhost:5000/api/goaml \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update a GoAML Record

```bash
curl -X PUT http://localhost:5000/api/goaml/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "محمد علي",
    "phone": "+966501234567",
    "note": "سجل آمن",
    "date": "2025-10-18",
    "status": "safe"
  }'
```

#### Delete a GoAML Record

```bash
curl -X DELETE http://localhost:5000/api/goaml/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Restart Backend Server

After creating the tables, restart your backend server:

```bash
cd backend
npm start
# or if using nodemon
npm run dev
```

## Features

### Call Logs Features
- ✅ Pagination support
- ✅ Search functionality (caller name, phone, notes)
- ✅ Filter by call type
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Authentication required
- ✅ Tracks creator (created_by)

### GoAML Features
- ✅ Full CRUD operations
- ✅ Status tracking (compliant, safe, under_review)
- ✅ Authentication required
- ✅ Tracks creator (created_by)

## Validation

### Call Logs
- `caller_name` - Required
- `phone_number` - Required
- `call_type` - Required (incoming, outgoing, missed)
- `call_date` - Required

### GoAML
- `name` - Required
- `phone` - Required

## Error Handling

All endpoints include proper error handling and return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Authentication

All endpoints require authentication using JWT tokens. The token should be included in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Notes

1. Both features track which employee created each record via `created_by` field
2. All timestamps are automatically managed by the database
3. The database tables use proper indexes for better performance
4. Foreign keys ensure data integrity with the employees table
