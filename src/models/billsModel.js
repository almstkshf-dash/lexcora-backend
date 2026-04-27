const db = require("../config/db");
const accountingService = require("../services/accountingService");

const getAllBills = async (filters = {}) => {
  const { vendor_id, status, branch_id } = filters;
  let query = `
    SELECT b.*, p.name as vendor_name, br.name_ar as branch_name
    FROM bills b
    LEFT JOIN parties p ON b.vendor_id = p.id
    LEFT JOIN branches br ON b.branch_id = br.id
    WHERE 1=1
  `;
  const params = [];

  if (vendor_id) {
    query += " AND b.vendor_id = ?";
    params.push(vendor_id);
  }
  if (status) {
    query += " AND b.status = ?";
    params.push(status);
  }
  if (branch_id) {
    query += " AND b.branch_id = ?";
    params.push(branch_id);
  }

  query += " ORDER BY b.bill_date DESC, b.id DESC";

  try {
    const [rows] = await db.query(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching bills:", error);
    throw error;
  }
};

const getBillById = async (id) => {
  try {
    const [bills] = await db.query(`
      SELECT b.*, p.name as vendor_name, br.name_ar as branch_name
      FROM bills b
      LEFT JOIN parties p ON b.vendor_id = p.id
      LEFT JOIN branches br ON b.branch_id = br.id
      WHERE b.id = ?
    `, [id]);

    if (bills.length === 0) return { success: false, message: "Bill not found" };

    const [items] = await db.query("SELECT * FROM bill_items WHERE bill_id = ?", [id]);

    return { 
      success: true, 
      data: { ...bills[0], items } 
    };
  } catch (error) {
    console.error("Error fetching bill by id:", error);
    throw error;
  }
};

const createBill = async (billData, items) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { bill_date, bill_number, amount, vendor_id, branch_id, status, vat, currency, description, created_by } = billData;

    const [result] = await connection.query(
      `INSERT INTO bills (bill_date, bill_number, amount, vendor_id, branch_id, status, vat, currency, description, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bill_date, bill_number, amount, vendor_id, branch_id || null, status || 'pending', vat || 0, currency || 'AED', description || null, created_by]
    );

    const billId = result.insertId;

    if (items && items.length > 0) {
      const itemValues = items.map(item => [billId, item.description, item.amount]);
      await connection.query("INSERT INTO bill_items (bill_id, description, amount) VALUES ?", [itemValues]);
    }

    // Accounting Posting
    await accountingService.postAutomatedEntry('BILL_RECEIVED', {
      amount,
      currency,
      description: `Bill ${bill_number} from vendor`,
      reference: bill_number,
      party_id: vendor_id,
      branch_id,
      created_by
    }, connection);

    await connection.commit();
    return { success: true, data: { id: billId } };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating bill:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const updateBillStatus = async (id, status) => {
  try {
    const [result] = await db.query("UPDATE bills SET status = ? WHERE id = ?", [status, id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error updating bill status:", error);
    throw error;
  }
};

module.exports = {
  getAllBills,
  getBillById,
  createBill,
  updateBillStatus
};
