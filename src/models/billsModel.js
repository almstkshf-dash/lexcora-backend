const db = require("../config/db");
const accountingService = require("../services/accountingService");
const allocationService = require("../services/allocationService");

const getAllBills = async (filters = {}) => {
  const { vendor_id, status, branch_id } = filters;
  let query = `
    SELECT b.*, p.name as vendor_name, br.name_ar as branch_name, 
           c.topic as case_name, proj.name as project_name, d.name_ar as department_name
    FROM bills b
    LEFT JOIN parties p ON b.vendor_id = p.id
    LEFT JOIN branches br ON b.branch_id = br.id
    LEFT JOIN cases c ON b.case_id = c.id
    LEFT JOIN projects proj ON b.project_id = proj.id
    LEFT JOIN departments d ON b.department_id = d.id
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
      SELECT b.*, p.name as vendor_name, br.name_ar as branch_name,
             c.topic as case_name, proj.name as project_name, d.name_ar as department_name
      FROM bills b
      LEFT JOIN parties p ON b.vendor_id = p.id
      LEFT JOIN branches br ON b.branch_id = br.id
      LEFT JOIN cases c ON b.case_id = c.id
      LEFT JOIN projects proj ON b.project_id = proj.id
      LEFT JOIN departments d ON b.department_id = d.id
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

    const { 
      bill_date, bill_number, amount, vendor_id, branch_id, status, vat, currency, 
      description, created_by, case_id, project_id, department_id, allocation_rule_id 
    } = billData;

    const [result] = await connection.query(
      `INSERT INTO bills (
        bill_date, bill_number, amount, vendor_id, branch_id, status, vat, 
        vat_category, taxable_amount, vat_amount, currency, 
        description, created_by, case_id, project_id, department_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bill_date, bill_number, amount, vendor_id, branch_id || null, status || 'pending', 
        vat || 0, billData.vat_category || 'standard', billData.taxable_amount || amount || 0,
        billData.vat_amount || 0, currency || 'AED', description || null, created_by,
        case_id || null, project_id || null, department_id || null
      ]
    );

    const billId = result.insertId;

    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        billId, 
        item.description, 
        item.amount,
        item.vat_rate || 5.00,
        item.vat_amount || 0
      ]);
      await connection.query(
        "INSERT INTO bill_items (bill_id, description, amount, vat_rate, vat_amount) VALUES ?", 
        [itemValues]
      );
    }

    // Accounting Posting with Allocation Support
    if (allocation_rule_id) {
      const allocations = await allocationService.calculateAllocations(allocation_rule_id, amount);
      await allocationService.saveTransactionAllocations('bill', billId, allocations, connection);

      // Post a split entry in the ledger
      const items = allocations.map(a => ({
        amount: a.amount,
        case_id: a.case_id,
        project_id: a.project_id,
        department_id: a.department_id,
        description: `Split Bill ${bill_number} (${a.percentage}%)`
      }));

      // We need a way to post multiple debit lines. 
      // Let's update accountingService to support split entries.
      await accountingService.postSplitAutomatedEntry('BILL_RECEIVED', {
        currency,
        reference: bill_number,
        party_id: vendor_id,
        branch_id,
        created_by,
        splits: items
      }, connection);
    } else {
      await accountingService.postAutomatedEntry('BILL_RECEIVED', {
        amount,
        currency,
        description: `Bill ${bill_number} from vendor`,
        reference: bill_number,
        party_id: vendor_id,
        branch_id,
        case_id,
        project_id,
        department_id,
        created_by
      }, connection);
    }

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
