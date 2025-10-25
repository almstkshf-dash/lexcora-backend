# Law Firm Management System - Backend API

## Overview

This is a comprehensive backend API system designed for law firm management. It provides complete functionality for managing cases, clients, employees, documents, court sessions, and all administrative tasks required by a modern law firm.

## System Architecture

The system is built using **Node.js** and **Express.js** framework with a **MySQL** database. It follows a modular MVC (Model-View-Controller) architecture pattern for maintainability and scalability.

### Technology Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js v5.1.0
- **Database:** MySQL 2
- **File Storage:** Cloudflare R2 (AWS S3 Compatible)
- **Authentication:** JWT (JSON Web Tokens)
- **API Documentation:** RESTful API standards

## Core Features

### 1. Case Management
- Complete case lifecycle management
- Case documents and file attachments
- Related cases linking
- Case classifications and types
- Court case documents
- Employee case assignments
- Party documents management

### 2. Client Management
- Client authentication system
- Client requests and deals
- Client agreements
- Client-case associations

### 3. Employee & HR Management
- Employee profiles and documents
- Attendance tracking
- Leave management (Annual, Sick, Other)
- Employee requests
- Performance reviews
- Training records
- Deductions and warnings
- Asset assignments

### 4. Court & Legal Operations
- Court sessions management
- Judicial orders
- Executions tracking
- Petition orders
- Litigation degrees
- Police stations registry
- Public prosecutions

### 5. Document Management
- Cloudflare R2 integration for secure file storage
- Multiple document categories
- Automated document cleanup on deletion
- Presigned URLs for secure access

### 6. Administrative Features
- Role-based access control (RBAC)
- Permissions management
- Activity logging system
- Branch management
- Department organization
- Notifications system
- Meeting scheduling
- Tasks management
- Memos and internal communications

### 7. Financial Management
- Bank accounts management
- Wallets system
- Deposits tracking
- Expense management
- Invoice generation with VAT support
- GoAML compliance reporting

### 8. Additional Features
- Call logs tracking
- Events calendar
- External links management
- Forms management
- Work hours tracking

## Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express application setup
│   ├── config/
│   │   └── db.js                 # Database connection configuration
│   ├── controllers/              # Request handlers (50+ controllers)
│   ├── models/                   # Database models and queries
│   ├── routes/                   # API route definitions
│   ├── services/                 # Business logic layer
│   ├── middlewares/              # Authentication, validation, etc.
│   └── utils/                    # Helper functions
├── docs/                         # Documentation and SQL scripts
├── index.js                      # Application entry point
├── package.json                  # Dependencies and scripts
├── Dockerfile                    # Docker container configuration
└── .env                          # Environment variables (not in repo)
```

## Installation & Setup

### Prerequisites

1. **Node.js** (v18 or higher)
2. **MySQL** database server (v5.7 or higher)
3. **npm** or **yarn** package manager
4. **Cloudflare R2** account (for file storage)

### Step 1: Clone and Install

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install
```

### Step 2: Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT Authentication
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-r2-public-url.com

# Cookie Security
COOKIE_SECRET=law-backend-cookie-secret-for-session-security-2024
```

### Step 3: Database Setup

1. Create a MySQL database
2. Import the database schema (contact developer for SQL dump)
3. Run any migration scripts in the `docs/` folder if needed:
   - `ADD_CASE_ID_TO_WALLET_DEPOSITS.sql`
   - `ADD_INDEXES_TO_WALLETS.sql`
   - `ADD_LOCATION_TO_BRANCHES.sql`
   - `ADD_MEETING_ID_TO_MEETINGS_DOCUMENTS.sql`
   - `ADD_VAT_TO_INVOICES.sql`
   - And other SQL files as required

### Step 4: Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:8080` (or the PORT specified in .env)

## API Endpoints

The API provides comprehensive RESTful endpoints organized by resource:

### Authentication
- `POST /api/auth/login` - Employee login
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/logout` - Logout
- `POST /api/client-auth/*` - Client authentication endpoints

### Cases
- `GET /api/cases` - Get all cases with filters
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case details
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case and all related data

### Documents
- `GET /api/case-documents/:caseId` - Get case documents
- `DELETE /api/case-documents/:caseId/:documentId` - Delete document
- `POST /api/upload` - Upload files to Cloudflare R2

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Financial
- `GET /api/invoices` - Get invoices
- `POST /api/invoices` - Create invoice with VAT
- `GET /api/wallets` - Get wallets
- `POST /api/wallet-deposits` - Add deposit
- `POST /api/wallet-expenses` - Add expense

### ... and 40+ more endpoint groups

Full API documentation available upon request.


## Cloud Deployment

### Deployment Platforms Supported
- **Google Cloud Run** (Recommended - Dockerfile included)
- **AWS ECS/Elastic Beanstalk**
- **Azure App Service**
- **Vercel** (vercel.json included)
- **DigitalOcean App Platform**
- **Heroku**


### Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

## Security Features

1. **JWT Authentication:** Secure token-based authentication
3. **CORS Protection:** Configurable cross-origin resource sharing
4. **Signed Cookies:** Secure session management
5. **Input Validation:** Express-validator for request validation
6. **Role-Based Access Control:** Permissions system
7. **Activity Logging:** Comprehensive audit trail
8. **Secure File Storage:** Cloudflare R2 with presigned URLs

## Database Features

- **Connection Pooling:** Optimized MySQL connections
- **Automatic Reconnection:** Handles connection failures
- **CASCADE Deletes:** Automatic cleanup of related records
- **Indexes:** Optimized for performance
- **Transactions:** Data integrity for complex operations

## File Storage (Cloudflare R2)

The system uses Cloudflare R2 for document storage, which provides:
- **S3-Compatible API:** Easy migration and integration
- **No egress fees:** Cost-effective storage
- **Global distribution:** Fast access worldwide
- **Presigned URLs:** Secure temporary access to files
- **Automatic cleanup:** Documents deleted when records are removed



Simple verification endpoint for deployment checks.





## Troubleshooting

### Database Connection Issues
- Verify MySQL server is running
- Check database credentials in `.env`
- Ensure database user has proper permissions
- Check firewall rules for database port 3306

### File Upload Issues
- Verify Cloudflare R2 credentials
- Check bucket permissions
- Ensure CORS is configured on R2 bucket

### Authentication Issues
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Ensure cookies are enabled in client

## Support & Contact

For technical support, database schema, or additional configuration assistance, please contact the development team.

## License

Lexora - All rights reserved

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Node.js Version Required:** 18+  
**Database:** MySQL 5.7+
