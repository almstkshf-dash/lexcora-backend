const db = require("../config/db");

const getAllJudicialOrders = async () => {
  const [rows] = await db.query(`SELECT * FROM judicial_orders`);
  return rows;
};
const getJudicialOrdersByCaseId = async (caseId) => {
  const [rows] = await db.query("SELECT * FROM judicial_orders WHERE case_id = ?", [caseId]);
  return rows;
};

const createJudicialOrder = async (judicialOrder) => {
  const { case_id, date, notification_period_days, case_filed, service_completed } = judicialOrder;
  const [result] = await db.query(`
    INSERT INTO judicial_orders (case_id, date, notification_period_days, case_filed, service_completed) VALUES (?, ?, ?, ?, ?)
  `, [case_id, date, notification_period_days, case_filed, service_completed]);
  return result.insertId;
};
const addJudicialOrderDocument = async (judicialOrderId, document_name, document_url) => {
  const [result] = await db.query(`
    INSERT INTO judicial_orders_documents (judicial_order_id, document_name, document_url) VALUES (?, ?, ?)
  `, [judicialOrderId, document_name, document_url]);
  return result.insertId;
};

const updateJudicialOrder = async (id, judicialOrder) => {
  const { date, notification_period_days, case_filed, service_completed, status } = judicialOrder;
  const [result] = await db.query(` 
    UPDATE judicial_orders SET date = ?, notification_period_days = ?, case_filed = ?, service_completed = ?, status = ? WHERE id = ?
  `, [date, notification_period_days, case_filed, service_completed, status, id]);
  return result.affectedRows > 0;
};  

const deleteJudicialOrder = async (id) => {
  const [result] = await db.query("DELETE FROM judicial_orders WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const deleteJudicialOrderDocument = async (id) => {
  const [result] = await db.query("DELETE FROM judicial_orders_documents WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getJudicialOrderDocumentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM judicial_orders_documents WHERE id = ?", [id]);
  return rows[0];
};
const getJudicialOrderById = async (id) => {
  const [judicialOrderRows] = await db.query("SELECT * FROM judicial_orders WHERE id = ?", [id]);
  
  if (!judicialOrderRows[0]) {
    return null;
  }

  const [documentsRows] = await db.query("SELECT id,document_name, document_url FROM judicial_orders_documents WHERE judicial_order_id = ?", [id]);

  const judicialOrder = judicialOrderRows[0];
  judicialOrder.documents = documentsRows;
  
  return judicialOrder;
};

const getJudicialOrdersByAuthenticationDate = async (authenticationDate) => {
  const [rows] = await db.query("SELECT * FROM judicial_orders WHERE authentication_date = ?", [authenticationDate]);
  return rows;
};

const getJudicialOrdersByNotificationPeriod = async (notificationPeriodDays) => {
  const [rows] = await db.query("SELECT * FROM judicial_orders WHERE notification_period_days = ?", [notificationPeriodDays]);
  return rows;
};

module.exports = {
  getAllJudicialOrders,
  createJudicialOrder,
  updateJudicialOrder,
  deleteJudicialOrder,
  getJudicialOrderById,
  getJudicialOrdersByAuthenticationDate,
  getJudicialOrdersByNotificationPeriod,
  addJudicialOrderDocument,
  getJudicialOrdersByCaseId,
  deleteJudicialOrderDocument,
  getJudicialOrderDocumentById
};
