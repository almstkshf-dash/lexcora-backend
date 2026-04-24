# Backend System Documentation & Progress Report

**Project:** Lexcora (REST API)
**Date:** April 2026
**Status:** Infrastructure Migration and Core API Stabilization

This document tracks the progress, architectural changes, and security updates specifically for the `lexcora-backend` repository.

---

## 1. Backend Architecture & Migration

The backend serves as the core logic handler and data source for the entire Lexcora platform (Frontend Admin Dashboard and Client Portal).
- **Runtime:** Node.js >= 18.18.0 running Express 5.
- **Migration:** Successfully migrated from an AWS Elastic Beanstalk monolith to Vercel Serverless Functions.
- **Database:** Migrated from AWS RDS to Railway MySQL. A massive database dump of 79 complex relational tables has been successfully restored.

### Vercel Serverless Optimizations
- The entire API runs efficiently via `vercel.json` routing configuration routing all requests (`/(.*)`) through a single entry point (`index.js`).
- State is entirely stateless between requests, conforming strictly to serverless best practices (e.g., no local disk caching).

---

## 2. Authentication & Security

Security enforces stringent access controls across all law firm data.
- **Custom Auth:** Implemented entirely in-house using JSON Web Tokens (JWT).
- **Token Strategy:**
  - Short-lived Access Tokens (24h lifespan).
  - Secure Refresh Tokens (7d lifespan).
- **Environment Management:** Hardcoded secrets are prohibited. All database endpoints (`DB_HOST`, `DB_USER`), JWT secrets, and storage configurations are securely injected via Vercel Environment Variables.

---

## 3. Data Management and File Storage

Due to the Vercel migration, local disk writing (e.g., via `fs` or traditional `multer` disk storage) is prohibited.

- **Vercel Blob Storage:** Files (such as PDFs, invoices, and case documents) are routed from the backend directly to Vercel Blob, a highly efficient serverless-native file storage system. 
- **Multer Integration:** File uploads stream through memory storage via `multer` before being shipped to Blob storage to guarantee secure handling.

---

## 4. Third-Party Integrations

- **OpenAI API:** Securely integrated for document processing and summarization tasks.
- **Document Processing:** Uses `pdf-parse`, `mammoth`, and `xlsx` modules to programmatically interpret uploaded legal cases and data.

---

## 5. Ongoing Tasks

- Full validation of all Express API endpoints within the Vercel serverless context.
- Finalizing the Vercel Blob upload controllers.
- Adjusting CORS policies explicitly for `portal.lexcora-mbh.com` and `user.lexcora-mbh.com` to prevent pre-flight authorization errors.
