const db = require("../config/db");

/**
 * Service to handle cost allocation for shared expenses across multiple cases, projects, or departments.
 */
const getAllRules = async () => {
  const [rows] = await db.query("SELECT * FROM expense_allocation_rules ORDER BY name ASC");
  return rows;
};

const getRuleById = async (id) => {
  const [rules] = await db.query("SELECT * FROM expense_allocation_rules WHERE id = ?", [id]);
  if (rules.length === 0) return null;

  const [items] = await db.query("SELECT * FROM expense_allocation_rule_items WHERE rule_id = ?", [id]);
  return { ...rules[0], items };
};

const createRule = async (ruleData, items) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, description } = ruleData;
    const [result] = await connection.query(
      "INSERT INTO expense_allocation_rules (name, description) VALUES (?, ?)",
      [name, description]
    );

    const ruleId = result.insertId;

    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        ruleId,
        item.case_id || null,
        item.project_id || null,
        item.department_id || null,
        item.percentage
      ]);

      await connection.query(
        "INSERT INTO expense_allocation_rule_items (rule_id, case_id, project_id, department_id, percentage) VALUES ?",
        [itemValues]
      );
    }

    await connection.commit();
    return { success: true, id: ruleId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Calculates allocations for a given amount based on a rule.
 */
const calculateAllocations = async (ruleId, totalAmount) => {
  const rule = await getRuleById(ruleId);
  if (!rule) throw new Error("Allocation rule not found");

  const allocations = rule.items.map(item => ({
    case_id: item.case_id,
    project_id: item.project_id,
    department_id: item.department_id,
    percentage: item.percentage,
    amount: (totalAmount * (item.percentage / 100)).toFixed(2)
  }));

  return allocations;
};

/**
 * Saves actual transaction allocations to the database.
 */
const saveTransactionAllocations = async (sourceType, sourceId, allocations, connection) => {
  const values = allocations.map(a => [
    sourceType,
    sourceId,
    a.case_id || null,
    a.project_id || null,
    a.department_id || null,
    a.amount,
    a.percentage
  ]);

  await connection.query(
    "INSERT INTO transaction_allocations (source_type, source_id, case_id, project_id, department_id, amount, percentage) VALUES ?",
    [values]
  );
};

module.exports = {
  getAllRules,
  getRuleById,
  createRule,
  calculateAllocations,
  saveTransactionAllocations
};
