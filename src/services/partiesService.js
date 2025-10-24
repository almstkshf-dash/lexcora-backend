
const partiesModel = require('../models/partiesModel');
const casesModel = require('../models/casesModel');
const { deleteDocumentFiles } = require('./cloudflareService');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllParties = async (filters) => {
  return await partiesModel.getAllParties(filters);
};

const getPartiesByBranchId = async (branchId) => {
  return await partiesModel.getPartiesByBranchId(branchId);

};

const createParty = async (party, createdBy = null) => {
  const partyId = await partiesModel.createParty(party);
  
  // Log party creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'طرف',
      party.name || 'طرف جديد',
      partyId
    );
  }
  
  return partyId;
};

const addPartyDocuments = async (partyId, files) => {
  // files is an array of {document_name, document_url} objects
  const documentPromises = files.map(file => 
    partiesModel.addPartyDocument(partyId, file.document_name, file.document_url, null)
  );
  return await Promise.all(documentPromises);
};

const deleteParty = async (id, deletedBy = null) => {
  const party = await partiesModel.getPartyById(id);
  const documents = await partiesModel.getPartyDocuments(id);
  console.log("Deleting party documents from R2:", documents);
 if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
  const result = await partiesModel.deleteParty(id);
  
  // Log party deletion
  if (deletedBy && party) {
    await logDelete(
      deletedBy,
      'طرف',
      party.name || 'طرف',
      id
    );
  }
  
  return result;
};
const getPartyById = async (id) => {
  const party = await partiesModel.getPartyById(id);
  if (party) {
    // Get party documents
    const documents = await partiesModel.getPartyDocuments(id);
    party.documents = documents;
  }
  return party;
};

const updateParty = async (id, party, updatedBy = null) => {
  const currentParty = await partiesModel.getPartyById(id);
  const result = await partiesModel.updateParty(id, party);
  
  // Log party update
  if (updatedBy && currentParty) {
    await logUpdate(
      updatedBy,
      'طرف',
      currentParty.name || 'طرف',
      id
    );
  }
  
  return result;
};

const getPartyCases = async (partyId) => {
  return await casesModel.getPartyCases(partyId);
};

const getPotentialClients = async (filters) => {
  return await partiesModel.getPotentialClients(filters);
};

const searchParties = async (query) => {
  return await partiesModel.searchParties(query);
};

const checkDuplicateParty = async (name, phone, excludeId = null) => {
  return await partiesModel.checkDuplicateParty(name, phone, excludeId);
};

module.exports = {
  getAllParties,
  getPartiesByBranchId,
  createParty,
  addPartyDocuments,
  deleteParty,
  getPartyById,
  updateParty,
  getPartyCases,
  getPotentialClients,
  searchParties,
  checkDuplicateParty
};
