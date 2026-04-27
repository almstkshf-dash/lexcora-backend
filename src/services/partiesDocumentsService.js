const partiesDocumentsModel = require("../models/partiesDocumentsModel");
const { deleteDocumentFiles } = require("./storageService");

const listPartiesDocuments = async (options) => {
  const { rows, total } = await partiesDocumentsModel.getAllPartiesDocuments(options);
  return {
    data: rows,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const getPartiesDocument = async (id) => {
  const document = await partiesDocumentsModel.getPartiesDocumentById(id);
  if (!document) {
    throw new Error("Parties document not found");
  }
  return document;
};

const getDocumentsByParty = async (partyId) => {
  // Check if party exists
  const partyExists = await partiesDocumentsModel.checkPartyExists(partyId);
  if (!partyExists) {
    throw new Error("Party not found");
  }
  
  return await partiesDocumentsModel.getPartiesDocumentsByPartyId(partyId);
};

const addPartiesDocument = async (data) => {
  // Validation
  if (!data.party_id || !data.file_name || !data.url) {
    throw new Error("Missing required fields: party_id, file_name, url");
  }

  // Validate party_id is a number
  if (isNaN(data.party_id) || data.party_id <= 0) {
    throw new Error("party_id must be a valid positive number");
  }

  // Validate file_name
  if (typeof data.file_name !== 'string' || data.file_name.trim().length === 0) {
    throw new Error("file_name must be a non-empty string");
  }

  if (data.file_name.length > 255) {
    throw new Error("file_name must be 255 characters or less");
  }

  // Validate URL format
  const urlRegex = /^(https?:\/\/|\/)[^\s]+$/;
  if (!urlRegex.test(data.url)) {
    throw new Error("url must be a valid HTTP/HTTPS URL or relative path");
  }

  if (data.url.length > 500) {
    throw new Error("url must be 500 characters or less");
  }

  // Check if party exists
  const partyExists = await partiesDocumentsModel.checkPartyExists(data.party_id);
  if (!partyExists) {
    throw new Error("Party not found");
  }

  // Clean data - only include fields that exist in the table
  const documentData = {
    party_id: parseInt(data.party_id),
    file_name: data.file_name.trim(),
    url: data.url.trim(),
    uploaded_by: data.uploaded_by || null
  };

  const documentId = await partiesDocumentsModel.createPartiesDocument(documentData);
  return await getPartiesDocument(documentId);
};

const updatePartiesDocument = async (id, data) => {
  // Check if document exists
  const existingDocument = await partiesDocumentsModel.getPartiesDocumentById(id);
  if (!existingDocument) {
    throw new Error("Parties document not found");
  }

  // Validate party_id if provided
  if (data.party_id !== undefined) {
    if (isNaN(data.party_id) || data.party_id <= 0) {
      throw new Error("party_id must be a valid positive number");
    }

    const partyExists = await partiesDocumentsModel.checkPartyExists(data.party_id);
    if (!partyExists) {
      throw new Error("Party not found");
    }
    data.party_id = parseInt(data.party_id);
  }

  // Validate file_name if provided
  if (data.file_name !== undefined) {
    if (typeof data.file_name !== 'string' || data.file_name.trim().length === 0) {
      throw new Error("file_name must be a non-empty string");
    }
    if (data.file_name.length > 255) {
      throw new Error("file_name must be 255 characters or less");
    }
    data.file_name = data.file_name.trim();
  }

  // Validate URL if provided
  if (data.url !== undefined) {
    const urlRegex = /^(https?:\/\/|\/)[^\s]+$/;
    if (!urlRegex.test(data.url)) {
      throw new Error("url must be a valid HTTP/HTTPS URL or relative path");
    }
    if (data.url.length > 500) {
      throw new Error("url must be 500 characters or less");
    }
    data.url = data.url.trim();
  }

  const updated = await partiesDocumentsModel.updatePartiesDocument(id, data);
  if (!updated) {
    throw new Error("Failed to update parties document");
  }

  return await getPartiesDocument(id);
};

const removePartiesDocument = async (id) => {
  // Check if document exists
  const existingDocument = await partiesDocumentsModel.getPartiesDocumentById(id);
  if (!existingDocument) {
    throw new Error("Parties document not found");
  }

  // Delete the file from AWS S3

    await deleteDocumentFiles([existingDocument]);
   

  const deleted = await partiesDocumentsModel.deletePartiesDocument(id);
  if (!deleted) {
    throw new Error("Failed to delete parties document");
  }


  return { message: "Parties document deleted successfully" };
};

const getDocumentsByFileType = async (fileType) => {
  if (!fileType || typeof fileType !== 'string') {
    throw new Error("file_type must be a non-empty string");
  }

  return await partiesDocumentsModel.getDocumentsByFileType(fileType.trim());
};

const searchPartiesDocuments = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
    throw new Error("Search term must be a non-empty string");
  }

  if (searchTerm.length < 2) {
    throw new Error("Search term must be at least 2 characters long");
  }

  return await partiesDocumentsModel.searchDocuments(searchTerm.trim());
};

const getDocumentsStatistics = async () => {
  return await partiesDocumentsModel.getDocumentsStatistics();
};

module.exports = {
  listPartiesDocuments,
  getPartiesDocument,
  getDocumentsByParty,
  addPartiesDocument,
  updatePartiesDocument,
  removePartiesDocument,
  getDocumentsByFileType,
  searchPartiesDocuments,
  getDocumentsStatistics
};
