
const db = require("../config/db");

const addStation = async (station) => {
  const { name_ar, name_en } = station;
  const [result] = await db.query(`
    INSERT INTO police_stations (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
};

const getAllStations = async () => {
  const [rows] = await db.query(`SELECT * FROM police_stations`);
  return rows;
};



const updateStation = async (id, updatedStation) => {
  const { name_ar, name_en } = updatedStation;
  const [result] = await db.query(`
    UPDATE police_stations SET name_ar = ?, name_en = ? WHERE id = ?
  `, [name_ar, name_en, id]);
  return result.affectedRows > 0;
};

const deleteStation = async (id) => {
  const [result] = await db.query("DELETE FROM police_stations WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  addStation,
  getAllStations,
  updateStation,
  deleteStation
};
