const { registerWorker } = require('./jobQueue');

// Example worker: notification fan-out (stubbed)
registerWorker('notification-fanout', async (payload) => {
  // payload: { recipients: [], title: '', message: '' }
  // TODO: wire to real notification service
  const results = (payload.recipients || []).map((id) => ({ recipientId: id, status: 'queued' }));
  return { dispatched: results.length, results };
});

// Example worker: report generation (stubbed)
registerWorker('generate-report', async (payload) => {
  // payload: { reportType: '', params: {} }
  // Simulate work
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { reportType: payload.reportType || 'generic', status: 'generated' };
});

// Bank Sync Worker
const bankService = require('../services/bankService');
registerWorker('bank-sync', async (payload) => {
  const { bank_account_id, user_id } = payload;
  return await bankService.syncBankAccount(bank_account_id, user_id);
});

module.exports = {}; // side-effect registration
