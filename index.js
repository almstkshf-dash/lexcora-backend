require("dotenv").config();
const app = require("./src/app");

// Global exception handling for serverless/production stability
process.on('unhandledRejection', (reason, promise) => {
  console.error('[UNHANDLED_REJECTION]', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : 'N/A'
  });
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT_EXCEPTION]', {
    message: err.message,
    stack: err.stack
  });
  // In a standard server, we might exit, but in Vercel we just log it
  // and let the platform handle function recycling if needed.
});

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

