const db = require("../config/db");
const { generateFileNumber } = require("../utils/generateFileNumber");

const addCase = async (caseData) => {
  const uploaded_by = null;
  try {
    const fileNumber = generateFileNumber();

    const {
      case_number,
      police_station_id,
      public_prosecution_id,
      court_id,
      lawyer_id,
      secretary_id,
      case_classification_id,
      case_type_id,
      legal_advisor_id,
      legal_researcher_id,
      counter_case_id = null,
      fees = 0,
      start_date = null,
      additional_note = null,
      topic = null,
      branch_id,
      isImportant = 0,
      is_secret = 0,
      is_archived = 0,
    } = caseData;

    const [result] = await db.query(
      `
      INSERT INTO cases (
         file_number, case_number, police_station_id, 
        public_prosecution_id, court_id, lawyer_id, secretary_id, 
        case_classification_id, case_type_id, legal_advisor_id, 
        legal_researcher_id, counter_case_id, fees, start_date, 
        additional_note, topic, branch_id, is_important, is_secret, is_archived
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        fileNumber,
        case_number,
        police_station_id,
        public_prosecution_id,
        court_id,
        lawyer_id,
        secretary_id,
        case_classification_id,
        case_type_id,
        legal_advisor_id,
        legal_researcher_id,
        counter_case_id,
        fees,
        start_date,
        additional_note,
        topic,
        branch_id,
        isImportant,
        is_secret,
        is_archived,
      ]
    );

    return  result.insertId;
     
  } catch (error) {
    console.error("Error inserting case:", error);
    throw error;
  }
};

const getAllCases = async (filters = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      branchId, 
      fromDate, 
      toDate,
      fileNumber,
      caseNumber 
    } = filters;
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build WHERE clause conditions
    let whereConditions = [];
    let queryParams = [];
    
    if (branchId) {
      whereConditions.push('c.branch_id = ?');
      queryParams.push(branchId);
    }
    
    if (fromDate) {
      whereConditions.push('c.start_date >= ?');
      queryParams.push(fromDate);
    }
    
    if (toDate) {
      whereConditions.push('c.start_date <= ?');
      queryParams.push(toDate);
    }
    
    if (fileNumber) {
      whereConditions.push('c.file_number LIKE ?');
      queryParams.push(`%${fileNumber}%`);
    }
    
    if (caseNumber) {
      whereConditions.push('c.case_number LIKE ?');
      queryParams.push(`%${caseNumber}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM cases c
      ${whereClause}
    `;
    
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get paginated data
    const dataQuery = `
      SELECT 
        c.id,
        c.case_number,
        c.file_number,
        c.topic,
        c.status,
        c.start_date,
        c.is_important,
        c.is_secret,
        c.is_archived,
        courts.court_ar,
        courts.court_en,
        ct.name_ar as case_type_ar,
        ct.name_en as case_type_en,
        cc.name_ar as case_classification_ar,
        cc.name_en as case_classification_en,
        COUNT(DISTINCT s.id) as session_count,
        MAX(s.session_date) as last_session_date,
        GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
        GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties
      FROM cases c
      LEFT JOIN courts ON c.court_id = courts.id
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN case_classifications cc ON c.case_classification_id = cc.id
      LEFT JOIN sessions s ON c.id = s.case_id
      LEFT JOIN case_parties cp ON c.id = cp.case_id
      LEFT JOIN parties p ON cp.party_id = p.id
      ${whereClause}
      GROUP BY c.id, c.case_number, c.file_number, c.topic, c.start_date, c.is_important, c.is_secret, c.is_archived, courts.court_ar, courts.court_en, ct.name_ar, ct.name_en, cc.name_ar, cc.name_en
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const [rows] = await db.query(dataQuery, [...queryParams, limit, offset]);
    
    // Convert comma-separated strings to arrays and handle null values
    const cases = rows.map(row => ({
      ...row,
      clientParties: row.client_parties ? row.client_parties.split(', ') : [],
      opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
      client_parties: undefined, // Remove the original field
      opponent_parties: undefined // Remove the original field
    }));
    
    return {
      cases,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching cases:", error);
    throw error;
  }
};

const getCaseById = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.*,
        cc.file_number AS counter_file_number,
        ct.name_ar as case_type_ar,
        ct.name_en as case_type_en,
        lawyer.name as lawyer_name
      FROM cases c 
      LEFT JOIN cases cc ON cc.id = c.counter_case_id 
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN employees lawyer ON c.lawyer_id = lawyer.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching case by ID:", error);
    throw error;
  }
};

const getAllCaseDetails = async (id) => {
  try {
    // Get main case details with all related basic information
    const [caseRows] = await db.query(`
      SELECT 
        c.*,
        -- Court information
        courts.court_ar,
        courts.court_en,
        -- Case type and classification
        ct.name_ar as case_type_ar,
        ct.name_en as case_type_en,
        cc.name_ar as case_classification_ar,
        cc.name_en as case_classification_en,
        -- Branch information
        b.name_ar as branch_ar,
        b.name_en as branch_en,
        -- Police station
        ps.name_ar as police_station_ar,
        ps.name_en as police_station_en,
        -- Public prosecution
        pp.name_ar as public_prosecution_ar,
        pp.name_en as public_prosecution_en,
        -- Employee details
        lawyer.name as lawyer_name,
        lawyer.username as lawyer_username,
        secretary.name as secretary_name,
        secretary.username as secretary_username,
        legal_advisor.name as legal_advisor_name,
        legal_advisor.username as legal_advisor_username,
        legal_researcher.name as legal_researcher_name,
        legal_researcher.username as legal_researcher_username,
        -- Counter case info
        counter_case.case_number as counter_case_number,
        counter_case.file_number as counter_case_file_number
      FROM cases c
      LEFT JOIN courts ON c.court_id = courts.id
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN case_classifications cc ON c.case_classification_id = cc.id
      LEFT JOIN branches b ON c.branch_id = b.id
      LEFT JOIN police_stations ps ON c.police_station_id = ps.id
      LEFT JOIN public_prosecutions pp ON c.public_prosecution_id = pp.id
      LEFT JOIN employees lawyer ON c.lawyer_id = lawyer.id
      LEFT JOIN employees secretary ON c.secretary_id = secretary.id
      LEFT JOIN employees legal_advisor ON c.legal_advisor_id = legal_advisor.id
      LEFT JOIN employees legal_researcher ON c.legal_researcher_id = legal_researcher.id
      LEFT JOIN cases counter_case ON c.counter_case_id = counter_case.id
      WHERE c.id = ?
    `, [id]);

    if (!caseRows || caseRows.length === 0) {
      return null;
    }

    const caseDetails = caseRows[0];
    // Get case parties with their details
    const [partiesRows] = await db.query(`
      SELECT 
        cp.type,
        p.name as party_name,
        p.phone,
        p.email,
        p.address,
        p.nationality
      FROM case_parties cp
      LEFT JOIN parties p ON cp.party_id = p.id
      WHERE cp.case_id = ?
      ORDER BY cp.type, p.name
    `, [id]);

    // Get case party documents for all parties
    // const [partyDocumentsRows] = await db.query(`
    //   SELECT 
    //     cpd.*,
    //     cp.type as party_type,
    //     p.name as party_name
    //   FROM case_parties_documents cpd
    //   LEFT JOIN case_parties cp ON cpd.case_id = cp.case_id AND cpd.party_id = cp.party_id
    //   LEFT JOIN parties p ON cp.party_id = p.id
    //   WHERE cpd.case_id = ?
    //   ORDER BY p.name, cpd.created_at DESC
    // `, [id]);

    // Get sessions
    const [sessionsRows] = await db.query(`
      SELECT 
        s.*,
        COUNT(DISTINCT sd.id) as document_count
      FROM sessions s
      LEFT JOIN session_documents sd ON s.id = sd.session_id
      WHERE s.case_id = ?
      GROUP BY s.id
      ORDER BY s.session_date DESC
    `, [id]);

    // Get session documents for all sessions
    // const [sessionDocumentsRows] = await db.query(`
    //   SELECT 
    //     sd.*,
    //     s.session_date
    //   FROM session_documents sd
    //   LEFT JOIN sessions s ON sd.session_id = s.id
    //   WHERE s.case_id = ?
    //   ORDER BY s.session_date DESC, sd.created_at DESC
    // `, [id]);


    // Get case documents (general case documents)
    // const [caseDocumentsRows] = await db.query(`
    //   SELECT * FROM case_documents WHERE case_id = ?
    //   ORDER BY created_at DESC
    // `, [id]);

    // Get court case documents
    // const [courtDocumentsRows] = await db.query(`
    //   SELECT * FROM court_case_documents WHERE case_id = ?
    //   ORDER BY created_at DESC
    // `, [id]);

    // Get employee case documents
    // const [employeeDocumentsRows] = await db.query(`
    //   SELECT 
    //     ced.*,
    //     e.name as uploaded_by_name
    //   FROM case_employees_documents ced
    //   LEFT JOIN employees e ON ced.employee_id = e.id
    //   WHERE ced.case_id = ?
    // `, [id]);

    // Get tasks related to this case
    const [tasksRows] = await db.query(`
      SELECT 
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        assigned_to_emp.name as assigned_to_name,
        assigned_by_emp.name as assigned_by_name,
        COUNT(DISTINCT td.id) as document_count,
        COUNT(DISTINCT tc.id) as comment_count
      FROM tasks t
      LEFT JOIN employees assigned_to_emp ON t.assigned_to = assigned_to_emp.id
      LEFT JOIN employees assigned_by_emp ON t.assigned_by = assigned_by_emp.id
      LEFT JOIN task_documents td ON t.id = td.task_id
      LEFT JOIN task_comments tc ON t.id = tc.task_id
      WHERE t.case_id = ?
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `, [id]);

    // Get executions
    const [executionsRows] = await db.query(`
      SELECT 
        ex.*,
        e.name as employee_name,
        COUNT(DISTINCT exd.id) as document_count
      FROM executions ex
      LEFT JOIN employees e ON ex.employee_id = e.id
      LEFT JOIN executions_documents exd ON ex.id = exd.execution_id
      WHERE ex.case_id = ?
      GROUP BY ex.id
      ORDER BY ex.date DESC
    `, [id]);


    // Get judicial orders
    const [judicialOrdersRows] = await db.query(`
      SELECT 
        jo.date,
        CASE WHEN jo.service_completed IS TRUE THEN 'yes' ELSE 'no' END AS service_completed,
        jo.notification_period_days,
        CASE WHEN jo.case_filed IS TRUE THEN 'yes' ELSE 'no' END AS case_filed,
        COUNT(DISTINCT jod.id) as document_count
      FROM judicial_orders jo
      LEFT JOIN judicial_orders_documents jod ON jo.id = jod.judicial_order_id
      WHERE jo.case_id = ?
      GROUP BY jo.id
      ORDER BY jo.date DESC
    `, [id]);


    // Get case petitions
    const [petitionsRows] = await db.query(`
      SELECT 
        cp.*,
        COUNT(DISTINCT cpd.id) as document_count
      FROM case_petitions cp
      LEFT JOIN case_petition_documents cpd ON cp.id = cpd.petition_id
      WHERE cp.case_id = ?
      GROUP BY cp.id
      ORDER BY cp.date DESC
    `, [id]);

    // Get case degrees (litigation degrees)
    const [degreesRows] = await db.query(`
      SELECT 
        year,  referral_date, case_number, created_at
      FROM case_degrees
      WHERE case_id = ?
      ORDER BY created_at DESC
    `, [id]);

    // Get petition orders if they exist
    const [petitionOrdersRows] = await db.query(`
      SELECT 
        type AS type_title,
        CASE WHEN decision IS TRUE THEN 'approved' ELSE 'not accepted' END AS decision_status,
        date,
        created_at,
        appeal_date
      FROM case_petitions
      WHERE case_id = ?
      ORDER BY date DESC
    `, [id]);
     return { 
      info:caseDetails, 
      parties:partiesRows,
      sessions:sessionsRows,
      tasks:tasksRows,
      executions:executionsRows,
      judicial:judicialOrdersRows,
      petitions:petitionsRows,
      degrees:degreesRows,
      petition:petitionOrdersRows
    };



  } catch (error) {
    console.error("Error fetching comprehensive case details:", error);
    throw error;
  }
};

const updateCase = async (id, caseData) => {
  try {
    const {
      case_number,
      police_station_id,
      public_prosecution_id,
      court_id,
      lawyer_id,
      secretary_id,
      case_classification_id,
      case_type_id,
      legal_advisor_id,
      legal_researcher_id,
      counter_case_id = null,
      fees = 0,
      start_date = null,
      additional_note = null,
      topic = null,
      branch_id,
      isImportant = 0,
      is_secret = 0,
      is_archived = 0,
    } = caseData;

    const [result] = await db.query(
      `
      UPDATE cases SET 
        case_number = ?, police_station_id = ?, 
        public_prosecution_id = ?, court_id = ?, lawyer_id = ?, 
        secretary_id = ?, case_classification_id = ?, case_type_id = ?, 
        legal_advisor_id = ?, legal_researcher_id = ?, counter_case_id = ?, 
        fees = ?, start_date = ?, additional_note = ?, topic = ?, branch_id = ?, 
        is_important = ?, is_secret = ?, is_archived = ?
      WHERE id = ?
      `,
      [
        case_number,
        police_station_id,
        public_prosecution_id,
        court_id,
        lawyer_id,
        secretary_id,
        case_classification_id,
        case_type_id,
        legal_advisor_id,
        legal_researcher_id,
        counter_case_id,
        fees,
        start_date,
        additional_note,
        topic,
        branch_id,
        isImportant,
        is_secret,
        is_archived,
        id,
      ]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating case:", error);
    throw error;
  }
};
const getCaseDocuments = async (caseId) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_documents WHERE case_id = ?
    `, [caseId]);
    return rows;
  } catch (error) {
    console.error("Error fetching case documents:", error);
    throw error;
  }
};
const getEmployeesCaseDocuments = async (caseId) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_employees_documents WHERE case_id = ?
    `, [caseId]);
    return rows;
  } catch (error) {
    console.error("Error fetching case documents:", error);
    throw error;
  }
};

 

const deleteCaseDocument = async (documentId, caseId) => {
  try {
    const [result] = await db.query(`
      DELETE FROM case_documents WHERE id = ? AND case_id = ?
    `, [documentId, caseId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting case document:", error);
    throw error;
  }
};

const getCaseCourtDocuments = async (caseId) => {
  try {
    const [rows] = await db.query(`   
      SELECT * FROM court_case_documents WHERE case_id = ?
    `, [caseId]);
    return rows;
  } catch (error) {
    console.error("Error fetching case court documents:", error);
    throw error;
  }
};
const deleteCaseCourtDocument = async (documentId, caseId) => {
  try {
    const [result] = await db.query(` 
      DELETE FROM court_case_documents WHERE id = ? AND case_id = ?
    `, [documentId, caseId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting case court document:", error);
    throw error;
  }
};

const deleteCase = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM cases WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting case:", error);
    throw error;
  }
};

const getCasesByBranch = async (branchId) => {
  try {
    const [rows] = await db.query("SELECT * FROM cases WHERE branch_id = ?", [branchId]);
    return rows;
  } catch (error) {
    console.error("Error fetching cases by branch:", error);
    throw error;
  }
};

const getCasesByLawyer = async (lawyerId) => {
  try {
    const [rows] = await db.query("SELECT * FROM cases WHERE lawyer_id = ?", [lawyerId]);
    return rows;
  } catch (error) {
    console.error("Error fetching cases by lawyer:", error);
    throw error;
  }
};

const getCasesByLegalAdvisor = async (legalAdvisorId) => {
  try {
    const [rows] = await db.query("SELECT * FROM cases WHERE legal_advisor_id = ?", [legalAdvisorId]);
    return rows;
  } catch (error) {
    console.error("Error fetching cases by legal advisor:", error);
    throw error;
  }
};

const getCasesByLegalResearcher = async (legalResearcherId) => {
  try {
    const [rows] = await db.query("SELECT * FROM cases WHERE legal_researcher_id = ?", [legalResearcherId]);
    return rows;
  } catch (error) {
    console.error("Error fetching cases by legal researcher:", error);
    throw error;
  }
};

 const addCaseDocument = async (caseId, document_name, document_url, uploaded_by) => {
  try {
    const [result] = await db.query(
      `INSERT INTO case_documents (case_id, document_name, document_url, uploaded_by) 
       VALUES (?, ?, ?, ?)`,
      [caseId, document_name, document_url, uploaded_by]
    );

    return {
      id: result.insertId,
      case_id: caseId,
      document_name,
      document_url
    };
  } catch (error) {
    console.error("Error adding case document:", error);
    throw error;
  }
};

const addCaseParty = async (caseId, party_id, type) => {
  try {
    const [result] = await db.query(
      `INSERT INTO case_parties (case_id, party_id, type) 
       VALUES (?, ?, ?)`,
      [caseId, party_id, type]
    );

    return {
      id: result.insertId,
      
    };
  } catch (error) {
    console.error("Error adding case party:", error);
    throw error;
  }
};
const updateCaseParty = async (caseId, partyId, partyData) => {
  try {
    await db.query(
      `UPDATE case_parties SET type = ? WHERE case_id = ? AND id = ?`,
      [partyData.type, caseId, partyId]
    );
  } catch (error) {
    console.error('Error in updateCaseParty service:', error);
    throw error;
  }
};  
const addCasePartyDocument = async (caseId, party_id, document_name, document_url, uploaded_by) => {
  try {
    const [result] = await db.query(
      `INSERT INTO case_parties_documents (case_id, party_id, document_name, document_url, uploaded_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [caseId, party_id, document_name, document_url, uploaded_by]
    );

    return {
      id: result.insertId,
      case_id: caseId,
      document_name,
      document_url,
      uploaded_by
    };
  } catch (error) {
    console.error("Error adding case party document:", error);
    throw error;
  }
};

const checkCasePartyExists = async (caseId, partyId) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM case_parties 
       WHERE case_id = ? AND party_id = ?`,
      [caseId, partyId]
    );
    return rows[0].count > 0;
  } catch (error) {
    console.error("Error checking case party exists:", error);
    throw error;
  }
};

const deleteCasePartyDocuments = async (caseId, partyId) => {
  try {
    const [result] = await db.query(
      `DELETE FROM case_parties_documents 
       WHERE case_id = ? AND party_id = ?`,
      [caseId, partyId]
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error deleting case party documents:", error);
    throw error;
  }
};

const deleteCaseParty = async (caseId, partyId) => {
  try {
    
    const [result] = await db.query(
      `DELETE FROM case_parties 
       WHERE case_id = ? AND id = ?`,
      [caseId, partyId]
    );
    
    return result.affectedRows;
  } catch (error) {
    console.error("Error deleting case party:", error);
    throw error;
  }
};

const searchCasesForAddNewCasePage = async (searchTerm) => {
  try {
    const [rows] = await db.query(
      "SELECT id, case_number, file_number ,topic FROM cases WHERE  file_number LIKE ? LIMIT 10",
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  } catch (error) {
    console.error("Error searching cases:", error);
    throw error;
  }
};
const getCaseIdFromFileNumber = async (fileNumber) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM cases WHERE file_number = ?",
      [fileNumber]
    );
    return rows[0]?.id || null;
  } catch (error) {
    console.error("Error getting case ID from file number:", error);
    throw error;
  }
};

const getCaseParties = async (caseId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        cp.id as case_party_id,
        cp.case_id,
        cp.party_id,
        cp.type,
        p.name as party_name,
        p.phone,
        p.email,
        p.address,
        p.nationality,
        p.created_at as party_created_at,
        p.updated_at as party_updated_at
      FROM case_parties cp
      LEFT JOIN parties p ON cp.party_id = p.id
      WHERE cp.case_id = ?
      ORDER BY cp.type, p.name
    `, [caseId]);
    
    return rows;
  } catch (error) {
    console.error("Error getting case parties:", error);
    throw error;
  }
};
const getPartyCases = async (partyId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.case_number,
        c.file_number,
        c.topic,
        c.status,
        c.start_date,
        c.is_important,
        c.is_secret,
        c.fees,
        c.is_archived,
        courts.court_ar,
        courts.court_en,
        ct.name_ar as case_type_ar,
        ct.name_en as case_type_en,
        cc.name_ar as case_classification_ar,
        cc.name_en as case_classification_en,
        COUNT(DISTINCT s.id) as session_count,
        MAX(s.session_date) as last_session_date,
        GROUP_CONCAT(DISTINCT CASE WHEN cp2.type = 'client' THEN p2.name END ORDER BY p2.name SEPARATOR ', ') as client_parties,
        GROUP_CONCAT(DISTINCT CASE WHEN cp2.type = 'opponent' THEN p2.name END ORDER BY p2.name SEPARATOR ', ') as opponent_parties
      FROM cases c
      JOIN case_parties cp ON c.id = cp.case_id
      LEFT JOIN courts ON c.court_id = courts.id
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN case_classifications cc ON c.case_classification_id = cc.id
      LEFT JOIN sessions s ON c.id = s.case_id
      LEFT JOIN case_parties cp2 ON c.id = cp2.case_id
      LEFT JOIN parties p2 ON cp2.party_id = p2.id
      WHERE cp.party_id = ?
      GROUP BY c.id, c.case_number, c.file_number, c.topic, c.status, c.start_date, c.is_important, c.is_secret, c.is_archived, courts.court_ar, courts.court_en, ct.name_ar, ct.name_en, cc.name_ar, cc.name_en
      ORDER BY c.created_at DESC
    `, [partyId]);
    
    // Convert comma-separated strings to arrays and handle null values
    const cases = rows.map(row => ({
      ...row,
      clientParties: row.client_parties ? row.client_parties.split(', ') : [],
      opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
      client_parties: undefined, // Remove the original field
      opponent_parties: undefined // Remove the original field
    }));
    
    return cases;
  } catch (error) {
    console.error("Error getting party cases:", error);
    throw error;
  }
};
const getRelatedCases = async (caseId) => {
  try {
    const [rows] = await db.query(`select rc.id, c.case_number, c.file_number, c.topic from related_cases rc join cases c on rc.related_case_id = c.id where rc.case_id  = ?`, [caseId]);
    return rows;
  } catch (error) {
    console.error("Error getting related cases:", error);
    throw error;
  }
};

const getCasePartyDocuments = async (caseId, partyId) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_parties_documents WHERE case_id = ? AND party_id = ?
    `, [caseId, partyId]);

    return rows;
  } catch (error) {
    console.error("Error getting case party documents:", error);
    throw error;
  }
};
const addRelatedCase = async (caseId, relatedCaseId) => {
  try {
    const [result] = await db.query(`
      INSERT INTO related_cases (case_id, related_case_id)
      VALUES (?, ?)
    `, [caseId, relatedCaseId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error adding related case:", error);
    throw error;
  }
};
const clearRelatedCases = async (caseId) => {
  try {
    const [result] = await db.query(`
      DELETE FROM related_cases WHERE case_id = ?
    `, [caseId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error clearing related cases:", error);
    throw error;
  }
};


const deleteCasePartyDocument = async (documentId, caseId, partyId) => {
  try {
    const [result] = await db.query(`
      DELETE FROM case_parties_documents WHERE id = ? AND case_id = ? AND party_id = ?
    `, [documentId, caseId, partyId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting case party document:", error);
    throw error;
  }
};
const deleteEmployeeCaseDocument = async (documentId) => {
  try {
    const [result] = await db.query(`DELETE FROM case_documents WHERE id = ?`, [documentId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting employee case document:", error);
    throw error;
  }
};
const getCasePartyDocumentById=async (documentId) => {
  try {
    const [rows] = await db.query(`SELECT * FROM case_parties_documents WHERE id = ?`, [documentId]);
    return rows[0];
  } catch (error) {
    console.error("Error getting case party document:", error);
    throw error;
  }
};

module.exports = {
  addCase,
  getAllCases,
  getCaseById,
  getAllCaseDetails,
  updateCase,
  deleteCase,
  getCasesByBranch,
  getCasesByLawyer,
  getCasesByLegalAdvisor,
  getCasesByLegalResearcher,
  addCaseDocument,
  addCaseParty,
  addCasePartyDocument,
  checkCasePartyExists,
  deleteCasePartyDocuments,
  deleteCaseParty,
  searchCasesForAddNewCasePage,
  getCaseParties,
  getEmployeesCaseDocuments,
  getCaseDocuments,
  deleteCaseDocument,
  deleteCaseCourtDocument,
  getCaseCourtDocuments,
  getCasePartyDocuments,
  deleteCasePartyDocument,
  updateCaseParty,
  getAllCaseDetails,
  getPartyCases,
  getRelatedCases,
  getCaseIdFromFileNumber,
  clearRelatedCases,
  addRelatedCase,
  getCasePartyDocumentById
};
