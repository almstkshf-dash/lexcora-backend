const db = require("../config/db");

const getWorkHours = async () => {
  const [rows] = await db.query(
    `SELECT id, 
     TIME_FORMAT(start_time, '%H:%i') as start_time,
     TIME_FORMAT(end_time, '%H:%i') as end_time
     FROM work_hours LIMIT 1`
  );
  return rows[0] || null;
};

const createWorkHours = async (workHoursData) => {
  const { start_time, end_time } = workHoursData;
  try {
    const [result] = await db.query(
      `INSERT INTO work_hours (start_time, end_time) VALUES (?, ?)`,
      [start_time, end_time]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error inserting work hours:", error);
    throw error;
  }
};

const updateWorkHours = async (id, workHoursData) => {
  const { start_time, end_time } = workHoursData;
  try {
    const [result] = await db.query(
      `UPDATE work_hours SET start_time = ?, end_time = ? WHERE id = ?`,
      [start_time, end_time, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating work hours:", error);
    throw error;
  }
};

module.exports = {
  getWorkHours,
  createWorkHours,
  updateWorkHours,
};
