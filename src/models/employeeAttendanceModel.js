const db = require("../config/db");

const getEmployeeAttendance = async (employeeId) => {
  const [rows] = await db.query(
    `SELECT 
      ea.id,
      ea.employee_id,
      ea.checkin,
      ea.checkout,
      ea.created_by,
      ea.created_at,
      e.name
    FROM employee_attendance ea
    LEFT JOIN employees e ON ea.employee_id = e.id
    WHERE ea.employee_id = ?
    ORDER BY ea.checkin DESC`,
    [employeeId]
  );
  return rows;
};

const getWorkHours = async () => {
  const [rows] = await db.query(
    `SELECT id, start_time, end_time FROM work_hours LIMIT 1`
  );
  return rows[0] || null;
};

const createAttendance = async (attendanceData) => {
  const { employee_id, checkin, checkout, created_by } = attendanceData;
  try {
    const [result] = await db.query(
      `INSERT INTO employee_attendance (employee_id, checkin, checkout, created_by, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [employee_id, checkin, checkout, created_by]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error inserting attendance:", error);
    throw error;
  }
};

const updateAttendance = async (id, attendanceData) => {
  const { checkin, checkout } = attendanceData;
  try {
    const [result] = await db.query(
      `UPDATE employee_attendance 
       SET checkin = ?, checkout = ? 
       WHERE id = ?`,
      [checkin, checkout, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};

const deleteAttendance = async (id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM employee_attendance WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting attendance:", error);
    throw error;
  }
};

module.exports = {
  getEmployeeAttendance,
  getWorkHours,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
