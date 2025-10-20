const db = require("../config/db");

const getAllExecutions = async () => {
  const [rows] = await db.query(`SELECT * FROM executions`);
  return rows;
};

 const getExecutionsByCaseId = async (caseId) => {
   const [rows] = await db.query("SELECT * FROM executions WHERE case_id = ?", [caseId]);
   return rows;
 }
 

const createExecution = async (execution) => {
  const { case_id,date, type, status, amount, employee_id = null} = execution;
  const [result] = await db.query(`
    INSERT INTO executions (case_id, date, type, status, amount, employee_id) VALUES (?, ?, ?, ?, ?, ?)
  `, [case_id, date, type, status, amount, employee_id]);
  return result.insertId;
};
const addExecutionDocument = async (executionId, document_name, document_url) => {
  const [result] = await db.query(`
    INSERT INTO executions_documents (execution_id, document_name, document_url) VALUES (?, ?, ?)
  `, [executionId, document_name, document_url]);
  return result.insertId;
}

const updateExecution = async (id, execution) => {
  const { case_id, number, date, type, status, amount } = execution;
  const [result] = await db.query(` 
    UPDATE executions SET case_id = ?, number = ?, date = ?, type = ?, status = ?, amount = ? WHERE id = ?
  `, [case_id, number, date, type, status, amount, id]);
  return result.affectedRows > 0;
};  

const deleteExecution = async (id) => {
  const [result] = await db.query("DELETE FROM executions WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getExecutionById = async (id) => {
  const [executionRows] = await db.query("SELECT * FROM executions WHERE id = ?", [id]);
  
  if (!executionRows[0]) {
    return null;
  }
  
  const [documentsRows] = await db.query("SELECT * FROM executions_documents WHERE execution_id = ?", [id]);
  
  const execution = executionRows[0];
  execution.documents = documentsRows;
  
  return execution;
};

const getExecutionsByDate = async (date) => {
  const [rows] = await db.query("SELECT * FROM executions WHERE date = ?", [date]);
  return rows;
};

const getExecutionsByType = async (type) => {
  const [rows] = await db.query("SELECT * FROM executions WHERE type = ?", [type]);
  return rows;
};

const getExecutionsByStatus = async (status) => {
  const [rows] = await db.query("SELECT * FROM executions WHERE status = ?", [status]);
  return rows;
};

const getExecutionsByAmountRange = async (minAmount, maxAmount) => {
  const [rows] = await db.query("SELECT * FROM executions WHERE amount BETWEEN ? AND ?", [minAmount, maxAmount]);
  return rows;
};
const deleteExecutionDocument= async (id) => {
  const [result] = await db.query("DELETE FROM executions_documents WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getExecutionDocumentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM executions_documents WHERE id = ?", [id]);
  return rows[0];
};

module.exports = {
  getAllExecutions,
  createExecution,
  updateExecution,
  deleteExecution,
  getExecutionById,
  getExecutionsByDate,
  getExecutionsByType,
  getExecutionsByStatus,
  getExecutionsByAmountRange,
  addExecutionDocument,
  getExecutionsByCaseId,
  deleteExecutionDocument,
  getExecutionDocumentById
};