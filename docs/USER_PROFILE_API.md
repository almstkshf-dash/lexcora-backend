# User Profile API Documentation

## `/me` Route Response Structure

After user login, the `/me` route now returns a comprehensive, well-structured user profile. Below is the detailed structure of the response:

### Response Format

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "integer",
      "username": "string",
      "status": "string",
      "email": "string",
      "phone": "string",
      "national_id": "string",
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    "employee": {
      "id": "integer",
      "name": "string",
      "position": "string",
      "branch_id": "integer",
      "department_id": "integer",
      "direct_manager_id": "integer"
    },
    "role": {
      "id": "integer",
      "name_ar": "string",
      "name_en": "string"
    },
    "department": {
      "name_ar": "string",
      "name_en": "string"
    },
    "manager": {
      "name": "string"
    },
    "permissions": {
      "canAccessDashboard": "boolean",
      "canViewProfile": "boolean",
      "canChangePassword": "boolean",
      "canViewCases": "boolean",
      "canCreateCases": "boolean",
      "canEditCases": "boolean",
      "canDeleteCases": "boolean",
      "canAssignCases": "boolean",
      "canViewDocuments": "boolean",
      "canUploadDocuments": "boolean",
      "canDeleteDocuments": "boolean",
      "canViewEmployees": "boolean",
      "canCreateEmployees": "boolean",
      "canEditEmployees": "boolean",
      "canDeleteEmployees": "boolean",
      "canViewClients": "boolean",
      "canCreateClients": "boolean",
      "canEditClients": "boolean",
      "canDeleteClients": "boolean",
      "canViewCourts": "boolean",
      "canManageCourts": "boolean",
      "canViewReports": "boolean",
      "canGenerateReports": "boolean",
      "canManageSystem": "boolean",
      "canManageRoles": "boolean",
      "canManageDepartments": "boolean",
      "canViewLogs": "boolean",
      "canViewTasks": "boolean",
      "canCreateTasks": "boolean",
      "canAssignTasks": "boolean",
      "canDeleteTasks": "boolean"
    },
    "session": {
      "loginTime": "ISO datetime string",
      "lastActivity": "ISO datetime string"
    }
  }
}
```

### Example Response

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "ahmed.lawyer",
      "status": "active",
      "email": "ahmed@lawfirm.com",
      "phone": "+966501234567",
      "national_id": "1234567890",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-03-10T14:20:00Z"
    },
    "employee": {
      "id": 1,
      "name": "أحمد محمد الفقيه",
      "position": "محامي أول",
      "branch_id": 1,
      "department_id": 2,
      "direct_manager_id": 5
    },
    "role": {
      "id": 2,
      "name_ar": "محامي",
      "name_en": "Lawyer"
    },
    "department": {
      "name_ar": "القسم القانوني",
      "name_en": "Legal Department"
    },
    "manager": {
      "name": "محمد عبدالله الرئيس"
    },
    "permissions": {
      "canAccessDashboard": true,
      "canViewProfile": true,
      "canChangePassword": true,
      "canViewCases": true,
      "canCreateCases": true,
      "canEditCases": true,
      "canDeleteCases": false,
      "canAssignCases": false,
      "canViewDocuments": true,
      "canUploadDocuments": true,
      "canDeleteDocuments": false,
      "canViewEmployees": false,
      "canCreateEmployees": false,
      "canEditEmployees": false,
      "canDeleteEmployees": false,
      "canViewClients": true,
      "canCreateClients": true,
      "canEditClients": true,
      "canDeleteClients": false,
      "canViewCourts": true,
      "canManageCourts": false,
      "canViewReports": false,
      "canGenerateReports": false,
      "canManageSystem": false,
      "canManageRoles": false,
      "canManageDepartments": false,
      "canViewLogs": false,
      "canViewTasks": true,
      "canCreateTasks": true,
      "canAssignTasks": false,
      "canDeleteTasks": false
    },
    "session": {
      "loginTime": "2024-03-20T09:15:30.123Z",
      "lastActivity": "2024-03-20T09:15:30.123Z"
    }
  }
}
```

## Permission System

The permissions are dynamically calculated based on the user's role:

### Role-Based Permissions

- **Admin**: Full access to all features
- **Manager**: Management features + all lawyer features
- **Lawyer**: Case and client management, document handling
- **HR**: Employee management features
- **Regular Employee**: Basic access to assigned tasks and profile

### Key Features

1. **Structured Data**: All user information is organized into logical sections
2. **Comprehensive Permissions**: Detailed permission system for frontend UI control
3. **Multilingual Support**: Arabic and English names for roles and departments
4. **Session Information**: Login time and activity tracking
5. **Hierarchical Data**: Manager and department relationships

## Usage in Frontend

Frontend applications can use this structured data to:

1. Display user information in profile sections
2. Control UI element visibility based on permissions
3. Show department and role information
4. Implement role-based navigation
5. Display session information

## Authentication Flow

1. User logs in via `/login` endpoint
2. JWT token is set in httpOnly cookie
3. Subsequent requests include the token automatically
4. `/me` endpoint returns structured user profile
5. Frontend uses the profile data to configure the application

## Security Notes

- JWT tokens are stored in httpOnly cookies for XSS protection
- Permissions are calculated server-side for security
- All sensitive operations verify permissions on the backend
- Session information helps track user activity

## Error Handling

If there's an error fetching the user profile:

```json
{
  "success": false,
  "message": "Error fetching user profile"
}
```

Common error scenarios:
- Invalid or expired token (401)
- User not found (401)
- Database connection issues (500)