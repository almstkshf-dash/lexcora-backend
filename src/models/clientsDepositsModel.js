const db = require("../config/db");

const getDepositsByPartyId = async (partyId) => {
  const query = `
    SELECT 
      cd.*,
      e.name as created_by_name
    FROM clients_deposits cd
    LEFT JOIN employees e ON cd.created_by = e.id
    WHERE cd.party_id = ?
    ORDER BY cd.created_at DESC
  `;
  
  const [rows] = await db.query(query, [partyId]);
  return rows;
};

const createDeposit = async (depositData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Insert deposit
    const insertQuery = `
      INSERT INTO clients_deposits (party_id, amount, description, created_by, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    const [result] = await connection.query(insertQuery, [
      depositData.party_id,
      depositData.amount,
      depositData.description,
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
      SET amount = ?, description = ?
      WHERE id = ?
    `;
    
    await connection.query(updateQuery, [
      depositData.amount,
      depositData.description,
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

module.exports = {
  getDepositsByPartyId,
  createDeposit,
  updateDeposit,
  deleteDeposit
};
