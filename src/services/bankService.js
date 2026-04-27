const bankReconciliationModel = require("../models/bankReconciliationModel");
const bankAccountsModel = require("../models/bankAccountsModel");
const XLSX = require("xlsx");

/**
 * Parses a bank statement file (CSV or Excel) and saves lines to database.
 */
const importStatement = async (importData, fileBuffer) => {
  const { bank_account_id, filename, created_by } = importData;
  
  // 1. Create import record
  const importId = await bankReconciliationModel.createImport({
    bank_account_id,
    filename,
    file_url: importData.file_url,
    created_by
  });

  try {
    // 2. Parse file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    const mapping = importData.mapping || {};

    // 3. Map data to statement lines
    // Support custom mapping or fallback to defaults
    const lines = data.map(row => {
      const dateKey = mapping.date || 'Date';
      const descKey = mapping.description || 'Description';
      const amountKey = mapping.amount || 'Amount';
      const refKey = mapping.reference || 'Reference';
      const fitidKey = mapping.fitid || 'FITID';

      return {
        import_id: importId,
        transaction_date: new Date(row[dateKey] || row.date || row.Date),
        description: row[descKey] || row.description || row.Description || row.Memo || row.memo || '',
        amount: parseFloat(row[amountKey] || row.amount || row.Amount),
        reference: row[refKey] || row.reference || row.Reference || row.Ref || row.ref || '',
        fitid: row[fitidKey] || row.fitid || row.FITID || row.id || `${Date.now()}-${Math.random()}`
      };
    }).filter(line => !isNaN(line.amount));

    // 4. Save lines
    if (lines.length > 0) {
      await bankReconciliationModel.createStatementLines(lines);
    }

    // 5. Update status
    await bankReconciliationModel.updateImportStatus(importId, 'processed');

    return { success: true, importId, linesCount: lines.length };
  } catch (error) {
    console.error("Error processing bank statement:", error);
    await bankReconciliationModel.updateImportStatus(importId, 'error');
    throw error;
  }
};

/**
 * Automatically match statement lines with internal logs.
 */
const autoMatch = async (bankAccountId, reconciledBy) => {
  const unreconciledLines = await bankReconciliationModel.getUnreconciledLines(bankAccountId);
  const internalLogs = await bankAccountsModel.getBankAccountLogs(bankAccountId);
  
  // Filter for unreconciled internal logs (those not in bank_reconciliations)
  // This would require a way to check if a log is already reconciled.
  // I'll add a check or assume the UI handles selection.
  // For "automatic sync", we look for exact matches in amount and date.
  
  const matches = [];
  const processedLogIds = new Set();

  for (const line of unreconciledLines) {
    // Find internal log with same amount and close date (within 3 days)
    const match = internalLogs.data.find(log => {
      if (processedLogIds.has(log.id)) return false;
      
      const sameAmount = Math.abs(parseFloat(log.amount)) === Math.abs(parseFloat(line.amount));
      const logTypeMatches = (line.amount > 0 && log.type === 'deposit') || (line.amount < 0 && log.type === 'withdrawal');
      
      const lineDate = new Date(line.transaction_date);
      const logDate = new Date(log.created_at);
      const diffTime = Math.abs(lineDate - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return sameAmount && logTypeMatches && diffDays <= 3;
    });

    if (match) {
      matches.push({
        bank_account_id: bankAccountId,
        bank_statement_line_id: line.id,
        bank_account_log_id: match.id,
        reconciled_by: reconciledBy
      });
      processedLogIds.add(match.id);
    }
  }

  // Perform reconciliation for matches
  for (const match of matches) {
    await bankReconciliationModel.reconcileTransaction(match);
  }

  return { matchesCount: matches.length };
};

/**
 * Simulates syncing with a bank API.
 */
const syncBankAccount = async (bankAccountId, userId) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
 
  // Generate mock statement data
  const mockBuffer = Buffer.from("Date,Description,Amount,Reference\n" + 
    `${new Date().toISOString().split('T')[0]},Mock Bank Deposit,500.00,SYNC-${Date.now()}\n` +
    `${new Date().toISOString().split('T')[0]},Mock Bank Fee,-15.00,FEE-${Date.now()}`);
 
  const importData = {
    bank_account_id: bankAccountId,
    filename: `Auto-Sync-${new Date().toISOString().split('T')[0]}.csv`,
    file_url: 'internal://auto-sync',
    created_by: userId
  };
 
  return await importStatement(importData, mockBuffer);
};
 
module.exports = {
  importStatement,
  autoMatch,
  syncBankAccount
};
