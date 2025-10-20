const db = require("../config/db");


const addCasePetition = async (petitionData) => {
  try {
    const {
      case_id,
      date,
      type,
      decision,
      appealDate
    } = petitionData;

    const [result] = await db.query(
      `INSERT INTO case_petitions (case_id, date, type, decision, appeal_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [case_id, date, type, decision, appealDate]
    );

    return {
      id: result.insertId,
      case_id,
      date,
      type,
      decision
    };
  } catch (error) {
    console.error("Error adding case petition:", error);
    throw error;
  }
};



const getAllCasePetitions = async () => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, c.case_number, c.topic as case_topic,c.file_number 
      FROM case_petitions cp
      LEFT JOIN cases c ON cp.case_id = c.id
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching case petitions:", error);
    throw error;
  }
};

const getCasePetitionDocuments = async (petitionId) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_petition_documents
      WHERE petition_id = ?
    `, [petitionId]);
    return rows;
  } catch (error) {
    console.error("Error fetching case petition documents:", error);
    throw error;
  }
};

const getCasePetitionById = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, c.case_number, c.topic as case_topic 
      FROM case_petitions cp
      LEFT JOIN cases c ON cp.case_id = c.id
      WHERE cp.id = ?
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching case petition by ID:", error);
    throw error;
  }
};

const getCasePetitionsByCaseId = async (caseId) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_petitions 
      WHERE case_id = ?
      ORDER BY date DESC
    `, [caseId]);
    return rows;
  } catch (error) {
    console.error("Error fetching case petitions by case ID:", error);
    throw error;
  }
};

const updateCasePetition = async (id, petitionData) => {
  try {
    const { case_id, date, type, decision } = petitionData;
    
    const [result] = await db.query(
      `UPDATE case_petitions 
       SET case_id = ?, date = ?, type = ?, decision = ?
       WHERE id = ?`,
      [case_id, date, type, decision, id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Case petition not found");
    }

    return await getCasePetitionById(id);
  } catch (error) {
    console.error("Error updating case petition:", error);
    throw error;
  }
};

const deleteCasePetition = async (id) => {
  try {
    const [result] = await db.query(
      "DELETE FROM case_petitions WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error("Case petition not found");
    }

    return { message: "Case petition deleted successfully" };
  } catch (error) {
    console.error("Error deleting case petition:", error);
    throw error;
  }
};

const getCasePetitionsByDecision = async (decision) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, c.case_number, c.topic as case_topic 
      FROM case_petitions cp
      LEFT JOIN cases c ON cp.case_id = c.id
      WHERE cp.decision = ?
      ORDER BY cp.date DESC
    `, [decision]);
    return rows;
  } catch (error) {
    console.error("Error fetching case petitions by decision:", error);
    throw error;
  }
};

const getCasePetitionsByDateRange = async (startDate, endDate) => {
  try {
    const [rows] = await db.query(`
      SELECT cp.*, c.case_number, c.topic as case_topic 
      FROM case_petitions cp
      LEFT JOIN cases c ON cp.case_id = c.id
      WHERE cp.date BETWEEN ? AND ?
      ORDER BY cp.date DESC
    `, [startDate, endDate]);
    return rows;
  } catch (error) {
    console.error("Error fetching case petitions by date range:", error);
    throw error;
  }
};

const addCasePetitionDocument = async (petitionId, documentName, documentUrl) => {
  try {
    const [result] = await db.query(`
      INSERT INTO case_petition_documents (petition_id, document_name, document_url)
      VALUES (?, ?, ?)
    `, [petitionId, documentName, documentUrl]);

    return result.insertId;
  } catch (error) {
    console.error("Error adding case petition document:", error);
    throw error;
  }
};
const getCasePetitionDocumentById = async (documentId) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM case_petition_documents WHERE id = ?",
      [documentId]
    );
    return rows[0];
  } catch (error) {
    console.error("Error fetching case petition document by ID:", error);
    throw error;
  }
};

const deleteCasePetitionDocument = async (documentId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM case_petition_documents WHERE id = ?",
      [documentId]
    );

    if (result.affectedRows === 0) {
      throw new Error("Case petition document not found");
    }

    return { message: "Case petition document deleted successfully" };
  } catch (error) {
    console.error("Error deleting case petition document:", error);
    throw error;
  }
};

module.exports = {
  addCasePetition,
  getAllCasePetitions,
  getCasePetitionById,
  getCasePetitionsByCaseId,
  updateCasePetition,
  deleteCasePetition,
  getCasePetitionsByDecision,
  getCasePetitionsByDateRange,
  addCasePetitionDocument,
  getCasePetitionDocuments,
  deleteCasePetitionDocument,
  getCasePetitionDocumentById
};