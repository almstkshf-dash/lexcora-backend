const db = require("../config/db");

class SettingsModel {
  static async getSettings() {
    const [rows] = await db.query("SELECT * FROM global_settings LIMIT 1");
    if (rows.length === 0) {
      // Return default empty settings if none exist
      return {
        company_name_ar: "ليكسورا للمحاماة",
        company_name_en: "Lexcora Law Firm",
        company_trn: "",
        company_address_ar: "",
        company_address_en: "",
        company_phone: "",
        company_email: "",
        company_logo_url: "",
        default_vat_rate: 5.00,
        terms_conditions_ar: "",
        terms_conditions_en: ""
      };
    }
    return rows[0];
  }

  static async updateSettings(data) {
    const {
      company_name_ar,
      company_name_en,
      company_trn,
      company_address_ar,
      company_address_en,
      company_phone,
      company_email,
      company_logo_url,
      default_vat_rate,
      terms_conditions_ar,
      terms_conditions_en
    } = data;

    // Check if settings row exists
    const [existing] = await db.query("SELECT id FROM global_settings LIMIT 1");

    if (existing.length === 0) {
      const [result] = await db.query(
        `INSERT INTO global_settings 
        (company_name_ar, company_name_en, company_trn, company_address_ar, company_address_en, company_phone, company_email, company_logo_url, default_vat_rate, terms_conditions_ar, terms_conditions_en) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [company_name_ar, company_name_en, company_trn, company_address_ar, company_address_en, company_phone, company_email, company_logo_url, default_vat_rate, terms_conditions_ar, terms_conditions_en]
      );
      return result.insertId;
    } else {
      const [result] = await db.query(
        `UPDATE global_settings SET 
        company_name_ar = ?, 
        company_name_en = ?, 
        company_trn = ?, 
        company_address_ar = ?, 
        company_address_en = ?, 
        company_phone = ?, 
        company_email = ?, 
        company_logo_url = ?, 
        default_vat_rate = ?,
        terms_conditions_ar = ?,
        terms_conditions_en = ?
        WHERE id = ?`,
        [company_name_ar, company_name_en, company_trn, company_address_ar, company_address_en, company_phone, company_email, company_logo_url, default_vat_rate, terms_conditions_ar, terms_conditions_en, existing[0].id]
      );
      return result;
    }
  }

  static async ensureTableExists() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS global_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name_ar VARCHAR(255),
        company_name_en VARCHAR(255),
        company_trn VARCHAR(50),
        company_address_ar TEXT,
        company_address_en TEXT,
        company_phone VARCHAR(50),
        company_email VARCHAR(255),
        company_logo_url TEXT,
        default_vat_rate DECIMAL(5,2) DEFAULT 5.00,
        terms_conditions_ar TEXT,
        terms_conditions_en TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Seed default if empty
    const [rows] = await db.query("SELECT id FROM global_settings LIMIT 1");
    if (rows.length === 0) {
      await db.query(`
        INSERT INTO global_settings 
        (company_name_ar, company_name_en, default_vat_rate) 
        VALUES ('ليكسورا للمحاماة', 'Lexcora Law Firm', 5.00)
      `);
    }
  }
}

module.exports = SettingsModel;
