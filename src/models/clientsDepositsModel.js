const db = require("../config/db");
const accountingService = require("../services/accountingService");

const getDepositsByPartyId = async (partyId, { page, limit, sortBy, sortOrder }) => {
  const query = `
    SELECT 
      cd.*,
      e.name as created_by_name
    FROM clients_deposits cd
    LEFT JOIN employees e ON cd.created_by = e.id
    WHERE cd.party_id = ?
    ORDER BY ${sortBy === 'amount' ? 'cd.amount' : 'cd.created_at'} ${sortOrder === 'ASC' ? 'ASC' : 'DESC'}
    LIMIT ? OFFSET ?
  `;
  
  const [rows] = await db.query(query, [partyId, limit, (page - 1) * limit]);

  const [countResult] = await db.query(
    'SELECT COUNT(*) as total FROM clients_deposits WHERE party_id = ?',
    [partyId]
  );
  return { rows, total: countResult[0]?.total || 0 };
};

const createDeposit = async (depositData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert deposit
    const insertQuery = `
      INSERT INTO clients_deposits (
        party_id, 
        amount, 
        description, 
        type, 
        check_number, 
        bank_name, 
        check_date, 
        created_by, 
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.query(insertQuery, [
      depositData.party_id,
      depositData.amount,
      depositData.description,
      depositData.type || 'cash',
      depositData.check_number || null,
      depositData.bank_name || null,
      depositData.check_date || null,
      depositData.created_by
    ]);

    // Update party balance
    const updateBalanceQuery = `
      UPDATE parties 
      SET balance = balance + ?
      WHERE id = ?
    `;
    
    await connection.query(updateBalanceQuery, [
      depositData.amount,
      depositData.party_id
    ]);

    // Automated Accounting Posting
    await accountingService.postAutomatedEntry('CLIENT_DEPOSIT', {
      amount: depositData.amount,
      description: depositData.description,
      reference: `DEP-${result.insertId}`,
      party_id: depositData.party_id,
      created_by: depositData.created_by
    }, connection);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateDeposit = async (depositId, depositData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get old deposit amount
    const [oldDeposit] = await connection.query(
      'SELECT amount, party_id FROM clients_deposits WHERE id = ?',
      [depositId]
    );

    if (oldDeposit.length === 0) {
      throw new Error('Deposit not found');
    }

    const oldAmount = oldDeposit[0].amount;
    const partyId = oldDeposit[0].party_id;
    const amountDifference = depositData.amount - oldAmount;

    // Update deposit
    const updateQuery = `
      UPDATE clients_deposits 
      SET 
        amount = ?, 
        description = ?, 
        type = ?, 
        check_number = ?, 
        bank_name = ?, 
        check_date = ?
      WHERE id = ?
    `;
    
    await connection.query(updateQuery, [
      depositData.amount,
      depositData.description,
      depositData.type || 'cash',
      depositData.check_number || null,
      depositData.bank_name || null,
      depositData.check_date || null,
      depositId
    ]);

    // Update party balance
    const updateBalanceQuery = `
      UPDATE parties 
      SET balance = balance + ?
      WHERE id = ?
    `;
    
    await connection.query(updateBalanceQuery, [
      amountDifference,
      partyId
    ]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteDeposit = async (depositId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get deposit info
    const [deposit] = await connection.query(
      'SELECT amount, party_id FROM clients_deposits WHERE id = ?',
      [depositId]
    );

    if (deposit.length === 0) {
      throw new Error('Deposit not found');
    }

    const amount = deposit[0].amount;
    const partyId = deposit[0].party_id;

    // Delete deposit
    await connection.query('DELETE FROM clients_deposits WHERE id = ?', [depositId]);

    // Update party balance
    const updateBalanceQuery = `
      UPDATE parties 
      SET balance = balance - ?
      WHERE id = ?
    `;
    
    await connection.query(updateBalanceQuery, [amount, partyId]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getAccountStatement = async (partyId, dateFrom, dateTo) => {
  // Build WHERE clause for date filtering with proper table aliases
  let dateConditionDeposits = '';
  let dateConditionTransactions = '';
  let queryParams = [partyId];
  
  if (dateFrom && dateTo) {
    dateConditionDeposits = 'AND DATE(cd.created_at) BETWEEN ? AND ?';
    dateConditionTransactions = 'AND DATE(ect.created_at) BETWEEN ? AND ?';
    queryParams.push(dateFrom, dateTo);
  } else if (dateFrom) {
    dateConditionDeposits = 'AND DATE(cd.created_at) >= ?';
    dateConditionTransactions = 'AND DATE(ect.created_at) >= ?';
    queryParams.push(dateFrom);
  } else if (dateTo) {
    dateConditionDeposits = 'AND DATE(cd.created_at) <= ?';
    dateConditionTransactions = 'AND DATE(ect.created_at) <= ?';
    queryParams.push(dateTo);
  }

  const query = `
    SELECT 
      'deposit' as source,
      cd.id,
      cd.created_at as date,
      'credit' as type,
      cd.amount,
      cd.description,
      e.name as created_by_name
    FROM clients_deposits cd
    LEFT JOIN employees e ON cd.created_by = e.id
    WHERE cd.party_id = ? ${dateConditionDeposits}
    
    UNION ALL
    
    SELECT 
      'transaction' as source,
      ect.id,
      ect.created_at as date,
      'debit' as type,
      ect.amount,
      ect.description,
      e.name as created_by_name
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.created_by = e.id
    WHERE ect.client_id = ? ${dateConditionTransactions}
    
    ORDER BY date DESC
  `;
  
  // Duplicate partyId for the second part of UNION
  queryParams = [...queryParams.slice(0, 1), ...queryParams.slice(1), partyId, ...queryParams.slice(1)];
  
  const [rows] = await db.query(query, queryParams);
  return rows;
};

module.exports = {
  getDepositsByPartyId,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  getAccountStatement
};
