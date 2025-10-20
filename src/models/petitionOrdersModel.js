const db = require("../config/db");

const getAllPetitionOrders = async () => {
  const [rows] = await db.query(`SELECT * FROM petition_orders`);
  return rows;
};

const createPetitionOrder = async (petitionOrder) => {
  const { submission_date, order_type, judge_decision, last_appeal_date } = petitionOrder;
  const [result] = await db.query(`
    INSERT INTO petition_orders (submission_date, order_type, judge_decision, last_appeal_date) VALUES (?, ?, ?, ?)
  `, [submission_date, order_type, judge_decision, last_appeal_date]);
  return result.insertId;
};

const updatePetitionOrder = async (id, petitionOrder) => {
  const { submission_date, order_type, judge_decision, last_appeal_date } = petitionOrder;
  const [result] = await db.query(` 
    UPDATE petition_orders SET submission_date = ?, order_type = ?, judge_decision = ?, last_appeal_date = ? WHERE id = ?
  `, [submission_date, order_type, judge_decision, last_appeal_date, id]);
  return result.affectedRows > 0;
};  

const deletePetitionOrder = async (id) => {
  const [result] = await db.query("DELETE FROM petition_orders WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getPetitionOrderById = async (id) => {
  const [rows] = await db.query("SELECT * FROM petition_orders WHERE id = ?", [id]);
  return rows[0];
};

const getPetitionOrdersBySubmissionDate = async (submissionDate) => {
  const [rows] = await db.query("SELECT * FROM petition_orders WHERE submission_date = ?", [submissionDate]);
  return rows;
};

const getPetitionOrdersByOrderType = async (orderType) => {
  const [rows] = await db.query("SELECT * FROM petition_orders WHERE order_type = ?", [orderType]);
  return rows;
};

const getPetitionOrdersByJudgeDecision = async (judgeDecision) => {
  const [rows] = await db.query("SELECT * FROM petition_orders WHERE judge_decision = ?", [judgeDecision]);
  return rows;
};

const getPetitionOrdersByLastAppealDate = async (lastAppealDate) => {
  const [rows] = await db.query("SELECT * FROM petition_orders WHERE last_appeal_date = ?", [lastAppealDate]);
  return rows;
};

module.exports = {
  getAllPetitionOrders,
  createPetitionOrder,
  updatePetitionOrder,
  deletePetitionOrder,
  getPetitionOrderById,
  getPetitionOrdersBySubmissionDate,
  getPetitionOrdersByOrderType,
  getPetitionOrdersByJudgeDecision,
  getPetitionOrdersByLastAppealDate
};