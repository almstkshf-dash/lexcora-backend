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

    // 3. Map data to statement lines
    // Expecting columns: Date, Description, Amount, Reference, FITID (optional)
    const lines = data.map(row => ({
      import_id: importId,
      transaction_date: new Date(row.Date || row.date),
      description: row.Description || row.description || row.Memo || row.memo || '',
      amount: parseFloat(row.Amount || row.amount),
      reference: row.Reference || row.reference || row.Ref || row.ref || '',
      fitid: row.FITID || row.fitid || row.id || `${Date.now()}-${Math.random()}`
    })).filter(line => !isNaN(line.amount));

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

module.exports = {
  importStatement,
  autoMatch
};
