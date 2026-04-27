const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

// Import middlewares
const { documentUrlMiddleware } = require("./middlewares/documentUrlMiddleware");
const { responseMiddleware } = require("./middlewares/responseMiddleware");
const { errorHandler } = require("./middlewares/errorHandler");
const { i18nMiddleware } = require("./middlewares/i18nMiddleware");
const { requestLogger } = require("./middlewares/requestLogger");

// Import routes
const authRoute = require("./routes/authRoute");
const clientAuthRoute = require("./routes/clientAuthRoute");
const rolesRoutes = require("./routes/rolesRoute");
const employeeRoutes = require("./routes/employeeRoute");
const branchesRoutes = require("./routes/branchesRoute");
const partiesRoutes = require("./routes/partiesRoute");
const clientsDepositsRoute = require("./routes/clientsDepositsRoute");
const sessionsRoutes = require("./routes/sessionsRoute");
const caseClassificationsRoutes = require("./routes/caseClassificationsRoute");
const caseTypesRoutes = require("./routes/caseTypesRoute");
const casesRoute = require("./routes/casesRoute");
const policeStationsRoute = require("./routes/policeStationsRoute");
const publicProsecutionsRoute = require("./routes/publicProsecutionsRoute");
const tasksRoute = require("./routes/tasksRoute");
const litigationDegreesRoute = require("./routes/litigationDegreesRoute");
const judicialOrdersRoute = require("./routes/judicialOrdersRoute");
const executionsRoute = require("./routes/executionsRoute");
const petitionOrdersRoute = require("./routes/petitionOrdersRoute");
const departmentsRoute = require("./routes/departmentsRoute");
const clientRequestsRoute = require("./routes/clientRequestsRoute");
const caseDocumentsRoute = require("./routes/caseDocumentsRoute");
const caseEmployeesRoute = require("./routes/caseEmployeesRoute");
const casePetitionsRoute = require("./routes/casePetitionsRoute");
const partiesDocumentsRoute = require("./routes/partiesDocumentsRoute");
const courtCaseDocumentsRoute = require("./routes/courtCaseDocumentsRoute");
const courtsRoute = require("./routes/courtsRoute");
const caseDegreesRoute = require("./routes/caseDegreesRoute");
const permissionsRoute = require("./routes/permissionsRoute");
const logsRoute = require("./routes/logsRoute");
const memosRoute = require("./routes/memosRoute");
const clientsAgreementsRoute = require("./routes/clientsAgreementsRoute");
const meetingsRoute = require("./routes/meetingsRoute");
const clientsDealsRoute = require("./routes/clientsDealsRoute");
const partiesOrdersRoute = require("./routes/partiesOrdersRoute");
const uploadRoute = require("./routes/uploadRoute");
const employeeDocumentsRoute = require("./routes/employeeDocumentsRoutes");
const employeeAttendanceRoute = require("./routes/employeeAttendanceRoute");
const deductionsRoute = require("./routes/deductionsRoute");
const annualLeavesRoute = require("./routes/annualLeavesRoute");
const sickLeavesRoute = require("./routes/sickLeavesRoute");
const otherLeavesRoute = require("./routes/otherLeavesRoute");
const reviewsRoute = require("./routes/reviewsRoute");
const trainingsRoute = require("./routes/trainingsRoute");
const warningsRoute = require("./routes/warningsRoute");
const employeeRequestsRoute = require("./routes/employeeRequestsRoute");
const assetsRoute = require("./routes/assetsRoute");
const eventsRoute = require("./routes/eventsRoute");
const hrNotificationsRoute = require("./routes/hrNotificationsRoute");
const appNotificationsRoute = require("./routes/appNotificationsRoute");
const jobsRoute = require("./routes/jobsRoute");
const { checkDb, checkBlob, getVersionInfo } = require("./utils/healthChecks");
const formsRoute = require("./routes/formsRoute");
const partiesFormsRoute = require("./routes/partiesFormsRoute");
const workHoursRoute = require("./routes/workHoursRoute");
const externalLinksRoute = require("./routes/externalLinksRoute");
const callLogsRoute = require("./routes/callLogsRoute");
const goamlRoute = require("./routes/goamlRoute");
const bankAccountsRoute = require("./routes/bankAccountsRoute");
const invoicesRoute = require("./routes/invoicesRoute");
const performanceRoute = require("./routes/performanceRoute");
const legalPeriodsRoute = require("./routes/legalPeriodsRoutes");
const employeeCashTransactionsRoute = require("./routes/employeeCashTransactionsRoute");
const legalAssistantRoute = require("./routes/legalAssistantRoute");
const searchRoute = require("./routes/searchRoute");
const accountingRoute = require("./routes/accountingRoutes");
const billsRoute = require("./routes/billsRoute");
const paymentsRoute = require("./routes/paymentsRoute");
const bankingRoute = require("./routes/bankingRoutes");
const pettyCashRoute = require("./routes/pettyCashRoutes");

const app = express();

// Middleware
// Dynamic CORS: allow explicit web origins (with credentials) and null origins for RN/bearer calls
const rawOrigins = process.env.CORS_ORIGINS || '';
const allowedOrigins = rawOrigins
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// Backwards compatibility: include FRONTEND_URL if provided
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.trim());
}

// Common local defaults (useful if CORS_ORIGINS is empty in dev)
const defaultLocalOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://10.0.2.2:3000', // Android emulator to host
];

// Production custom domains
const productionCustomDomains = [
  'https://portal.lexcora-mbh.com',
  'https://user.lexcora-mbh.com',
  'https://api.lexcora-mbh.com',
];

[...defaultLocalOrigins, ...productionCustomDomains].forEach(origin => {
  if (!allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
  }
});

const corsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (React Native, curl) for bearer-token flows
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // Keep cookies for web origins; bearer tokens work without cookies
};

app.use(cors(corsOptions));
app.use(cookieParser('law-backend-cookie-secret-for-session-security-2024')); // COOKIE_SECRET
app.use(express.json({ limit: '50mb' })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Increase limit for file uploads
app.use(requestLogger({ slowThresholdMs: parseInt(process.env.SLOW_REQUEST_MS || '1000', 10) }));
app.use(i18nMiddleware);
app.use(responseMiddleware);

// Apply document URL middleware globally to convert S3 keys to accessible URLs
app.use(documentUrlMiddleware(['document_url', 'file_path', 'url', 'file_url']));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/client-auth", clientAuthRoute);
app.use("/api/roles", rolesRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/branches", branchesRoutes);
app.use("/api/parties", partiesRoutes);
app.use("/api/clients-deposits", clientsDepositsRoute);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/case-classifications", caseClassificationsRoutes);
app.use("/api/case-types", caseTypesRoutes);
app.use("/api/cases", casesRoute);
app.use("/api/police-stations", policeStationsRoute);
app.use("/api/public-prosecutions", publicProsecutionsRoute);
app.use("/api/tasks", tasksRoute);
app.use("/api/litigation-degrees", litigationDegreesRoute);
app.use("/api/judicial-orders", judicialOrdersRoute);
app.use("/api/executions", executionsRoute);
app.use("/api/petition-orders", petitionOrdersRoute);
app.use("/api/departments", departmentsRoute);
app.use("/api/client-requests", clientRequestsRoute);
app.use("/api/case-documents", caseDocumentsRoute);
app.use("/api/case-employees", caseEmployeesRoute);
app.use("/api/case-petitions", casePetitionsRoute);
app.use("/api/parties-documents", partiesDocumentsRoute);
app.use("/api/court-case-documents", courtCaseDocumentsRoute);
app.use("/api/courts", courtsRoute);
app.use("/api/case-degrees", caseDegreesRoute);
app.use("/api/permissions", permissionsRoute);
app.use("/api/logs", logsRoute);
app.use("/api/memos", memosRoute);
app.use("/api/clients-agreements", clientsAgreementsRoute);
app.use("/api/meetings", meetingsRoute);
app.use("/api/clients-deals", clientsDealsRoute);
app.use("/api/parties-orders", partiesOrdersRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/employee-documents", employeeDocumentsRoute);
app.use("/api/employee-attendance", employeeAttendanceRoute);
app.use("/api/deductions", deductionsRoute);
app.use("/api/annual-leaves", annualLeavesRoute);
app.use("/api/sick-leaves", sickLeavesRoute);
app.use("/api/other-leaves", otherLeavesRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/trainings", trainingsRoute);
app.use("/api/warnings", warningsRoute);
app.use("/api/employee-requests", employeeRequestsRoute);
app.use("/api/assets", assetsRoute);
app.use("/api/events", eventsRoute);
app.use("/api/hr-notifications", hrNotificationsRoute);
app.use("/api/app-notifications", appNotificationsRoute);
app.use("/api/jobs", jobsRoute);
app.use("/api/forms", formsRoute);
app.use("/api/parties-forms", partiesFormsRoute);
app.use("/api/work-hours", workHoursRoute);
app.use("/api/external-links", externalLinksRoute);
app.use("/api/call-logs", callLogsRoute);
app.use("/api/goaml", goamlRoute);
app.use("/api/bank-accounts", bankAccountsRoute);
app.use("/api/invoices", invoicesRoute);
app.use("/api/performance", performanceRoute);
app.use("/api/legal-periods", legalPeriodsRoute);
app.use("/api/employee-cash-transactions", employeeCashTransactionsRoute);
app.use("/api/legal-assistant", legalAssistantRoute);
app.use("/api/search", searchRoute);
app.use("/api/accounting", accountingRoute);
app.use("/api/bills", billsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/banking", bankingRoute);
app.use("/api/petty-cash", pettyCashRoute);

app.get("/health", async (req, res) => {
  try {
    const [dbOk, blobOk] = await Promise.all([checkDb(), checkBlob()]);
    res.success(
      {
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: getVersionInfo(),
        services: {
          api: "Running",
          database: dbOk ? "Reachable" : "Unavailable",
          fileStorage: blobOk ? "Reachable" : "Unavailable"
        }
      },
      "Law Backend API is running"
    );
  } catch (error) {
    res.fail("Health check failed", 500, "HEALTHCHECK_FAILED", { error: error.message });
  }
});

// Simple ping endpoint for deployment verification
app.get("/ping", (req, res) => {
  res.success({ timestamp: new Date().toISOString() }, "pong");
});

// 404 handler - must be last before error handler
app.use((req, res) => {
  res.fail("Route not found", 404, "NOT_FOUND");
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;

