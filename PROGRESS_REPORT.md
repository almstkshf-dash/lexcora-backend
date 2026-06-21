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

### Finance Department and COA Improvements (May 2026)
- **Problem:** The Chart of Accounts lacked hierarchical visualization and rollup capabilities. The finance department needed more robust reporting for aging, budgeting, and fiscal period control.
- **Solution:** Significantly enhanced the core accounting engine and reporting suite.
- **Key Features:**
  - **Hierarchical COA (Tree View):** Implemented recursive tree retrieval for the Chart of Accounts, allowing the frontend to display accounts in a nested structure.
  - **Hierarchical Report Rollup:** Updated Profit & Loss and Balance Sheet reports to automatically roll up balances from child accounts to their parents, providing a true hierarchical financial view.
  - **Fiscal Period Control:** Added a new mechanism to open/close fiscal periods (months/years). The system now prevents manual journal entries in closed periods, ensuring data integrity for finalized months.
  - **Budgeting & Variance Analysis:** Implemented a budgeting module allowing firms to set monthly/annual budgets per account. Added a "Budget vs. Actual" report with variance and performance percentage tracking.
  - **Advanced Aging Reports:** Integrated direct Aged Receivables (AR) and Aged Payables (AP) reports into the accounting service, categorized by 0-30, 31-60, 61-90, and 90+ day buckets.
  - **Case-Specific Profitability:** Added a dedicated Case Financial Summary report that calculates income, expenses, and net profit per legal case based on linked ledger entries.
- **Technical Detail:** Added 2 new database tables (`fiscal_periods`, `account_budgets`) and updated `accountsModel`, `accountingService`, and `accountingController` with multiple new endpoints and logic layers.

### Automated Case Finance Integration (May 2026)
- **Problem:** Fees entered during case creation were stored as static data and not reflected in the firm's financial reports (Ledger, Revenue reports) until an invoice was manually generated.
- **Solution:** Integrated the case creation workflow with the automated accounting engine.
- **Key Features:**
  - **Real-time Revenue Recognition:** Creating a case with a "Fees & Expenses" value now triggers an automatic journal entry.
  - **Ledger Transparency:** The firm's "Expected Revenue" and "Accounts Receivable" are updated immediately upon case creation.
  - **Dynamic Event Mapping:** Added the `CASE_CREATED` event to `posting_settings`, allowing flexible account mapping without further code changes.
- **Technical Detail:** 
  - Updated `accountingService.postAutomatedEntry` to support database transactions.
  - Modified `casesService.createCaseWithRelations` to call the accounting engine within the case creation transaction.
  - Implemented primary client detection to link financial entries to the correct party ID.

### Automated Asset Depreciation (May 2026)
- **Objective:** Automate the monthly depreciation calculation for all firm assets.
- **Solution:** Configured a Vercel Cron Job to trigger the depreciation engine automatically.
- **Implementation:**
  - Added a `crons` configuration in `vercel.json` to call the `/api/accounting/assets/run-depreciation` endpoint.
  - **Schedule:** Runs on the 1st day of every month at 00:00 UTC (`0 0 1 * *`).
- **Technical Detail:** This ensures that asset values and corresponding depreciation journal entries are kept up-to-date without manual intervention, maintaining accurate Balance Sheet and P&L reporting.

### Case Details Enhancement & Unified Meeting Management (May 2026)
- **Problem:** Users could not view related cases or files directly from the Case Details page. Additionally, meeting management was fragmented with multiple non-standard modals across different modules (Potential Clients, Parties).
- **Solution:** Enhanced the Case Details view and unified the meeting/consultation workflow across the platform.
- **Key Features:**
  - **Related Records Integration:** Updated the backend and frontend to fetch and display "Related Cases" and "Related Files" in a responsive, bilingual table within the Case Details view.
  - **Unified Meeting Modal:** Replaced disparate meeting creation logic with a single, centralized `AddMeetingModal` component used globally across `Potential Clients`, `Parties`, and `Meetings` modules.
  - **Consultation Fee Integration:** Ensured that legal consultation fees are automatically calculated based on duration and correctly linked to the Chart of Accounts and Invoice generation.
  - **Bilingual Support:** Fully localized the new "Related Cases" sections and meeting management tools in both English and Arabic, including RTL layout support.
- **Technical Detail:** 
  - Updated `casesModel.js` to retrieve `related_cases` in the `getAllCaseDetails` service.
  - Refactored `PotentialClients.js` and `Parties.js` to utilize the shared meeting service.
  - Added missing translation keys for related files and case management in `en.json` and `ar.json`.

### Client Username and Password Management Stabilization (June 2026)
- **Problem:** Users were unable to specify custom usernames and passwords when creating clients, as the backend generated random ones and immediately hashed them, making them unreadable. Additionally, editing existing clients ruined their passwords due to double-hashing (when saving a bcrypt hash or the masked `********` value).
- **Solution:** Restabilized the client (parties) credentials module.
- **Key Features:**
  - **Custom Credentials:** Allowed manual entry of username and password during client creation, with auto-generation only as a fallback.
  - **Password Protection on Edit:** Updated the update action to ignore updating the password if the value sent is empty, masked (`********`), or is already a bcrypt hash. This completely prevents double-hashing and credential degradation.
  - **Conflict Prevention:** Added check and user-friendly error response (400) if the username is already registered to another client.
- **Technical Detail:** Modified `partiesModel.js` (`createParty`, `updateParty`) and `partiesController.js` to catch `USERNAME_ALREADY_EXISTS`. Added translation keys to `messages.js`.

## 7. Ongoing Tasks
- Completed endpoint validation pass for Express on serverless: confirmed app startup, route registration, and production-safe behavior for Vercel deployment.
- Disabled local `/uploads` static serving in production so file access is handled exclusively through Vercel Blob.
- Finalizing the Vercel Blob upload controllers.
- Adjusting CORS policies explicitly for portal.lexcora-mbh.com and user.lexcora-mbh.com to prevent pre-flight authorization errors.