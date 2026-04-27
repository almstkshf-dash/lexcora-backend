const db = require("../config/db");

const getAllCurrencies = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM currencies ORDER BY code ASC");
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching currencies:", error);
    throw error;
  }
};

const getCurrencyByCode = async (code) => {
  try {
    const [rows] = await db.query("SELECT * FROM currencies WHERE code = ?", [code]);
    if (rows.length === 0) return { success: false, message: "Currency not found" };
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error("Error fetching currency by code:", error);
    throw error;
  }
};

const updateExchangeRate = async (code, rate) => {
  try {
    const [result] = await db.query("UPDATE currencies SET exchange_rate = ? WHERE code = ?", [rate, code]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error updating exchange rate:", error);
    throw error;
  }
};

module.exports = {
  getAllCurrencies,
  getCurrencyByCode,
  updateExchangeRate
};
