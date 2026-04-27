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

- **Vercel Blob Storage:** Files (such as PDFs, invoices, and case documents) are routed from the backend directly to Vercel Blob, a highly efficient serverless-native file storage system. This is our primary and only file storage provider.
- **Multer Integration:** File uploads stream through memory storage via `multer` before being shipped to Blob storage to guarantee secure handling.

---

## 4. Third-Party Integrations

- **OpenAI API:** Securely integrated for document processing and summarization tasks.
- **Document Processing:** Uses `pdf-parse`, `mammoth`, and `xlsx` modules to programmatically interpret uploaded legal cases and data.

---

---

## 6. Recent Fixes & Improvements

### Case Management Statistics (April 2026)
- **Problem:** Case statistics (Active, Pending, Important) on the frontend were only reflecting counts from the currently loaded page of data, leading to incorrect totals for large datasets.
- **Solution:** Modified `casesModel.getAllCases` to calculate full dataset statistics (respecting active filters but ignoring pagination) in a single database call. Updated the API response to include these global counts, ensuring the dashboard cards always reflect accurate, real-time data.
- **Technical Detail:** Implemented conditional aggregation (`COUNT(DISTINCT CASE WHEN...)`) within the count query to minimize database roundtrips.
 
### Banking and Cash Management Implementation (April 2026)
- **Problem:** Operational requirements for bank reconciliation, cash flow tracking, and petty cash control were missing from the financial module.
- **Solution:** Implemented a comprehensive Banking and Cash Management system.
- **Key Features:**
  - **Bank Reconciliation:** New models and services for importing bank statements (CSV/Excel) and matching them with internal bank logs.
  - **Auto-Matching Engine:** Logic to automatically reconcile transactions based on amount, date proximity, and transaction type.
  - **Petty Cash Control:** Dedicated fund management with replenishment tracking and disbursement logging.
  - **Cash Flow Tracking:** Real-time inflows and outflows reporting across all financial channels (Bank, Petty Cash, Employee Cash).
  - **API Integration:** New endpoints registered under `/api/banking` and `/api/petty-cash`.
- **Technical Detail:** Created 5 new database tables and extended `bank_account_logs` to support fund-based accounting. All financial logic is wrapped in database transactions to ensure data integrity.

### Accounting and Financial Refinement (April 2026)
- **Problem:** The accounting system needed stronger data validation, better multi-currency handling for international transactions, and a more flexible way to manage automated postings.
- **Solution:** Refined the core accounting engine to support multi-branch consolidation and robust data integrity.
- **Key Features:**
  - **Multi-currency & Consolidation:** Extended ledger entries to store "Base Currency" amounts alongside original transaction amounts. This enables real-time consolidation of financial reports (P&L, Balance Sheet) across multiple branches regardless of local currencies.
  - **Dynamic Automated Posting:** Replaced hardcoded posting logic with a database-driven `posting_settings` table. This allows firm administrators to map business events (e.g., Invoice Created, Payment Received) to specific GL accounts without code changes.
  - **Data Validation Layer:** Implemented a strict validation service for journal entries. Every entry is checked for balance (Debit == Credit), non-zero values, and minimum entry requirements before being persisted.
  - **Enhanced COA:** Added metadata flags to the Chart of Accounts (`is_reconcilable`, `allow_manual_posting`) to prevent erroneous manual entries into controlled accounts (like Accounts Receivable).
  - **Reporting Engine Updates:** Updated Trial Balance and Financial Statements logic to support consolidated views using system-wide base currency (AED).

## 7. Ongoing Tasks
- Full validation of all Express API endpoints within the Vercel serverless context.
- Finalizing the Vercel Blob upload controllers.
- Adjusting CORS policies explicitly for portal.lexcora-mbh.com and user.lexcora-mbh.com to prevent pre-flight authorization errors.