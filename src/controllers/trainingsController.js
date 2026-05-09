const trainingsModel = require("../models/trainingsModel");
const { deleteDocumentFiles } = require("../services/storageService");
const { normalizePagination } = require("../utils/pagination");

// Get all trainings or by employee_id
const getTrainings = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id', 'date']);
    const trainingsResult = await trainingsModel.getAllTrainings(employee_id || null, { page, limit, sortBy, sortOrder });
    const trainings = trainingsResult.rows || trainingsResult.data || trainingsResult || [];
    const pagination = trainingsResult.pagination || (trainingsResult.total ? {
      total: trainingsResult.total,
      page,
      limit,
      totalPages: Math.ceil(trainingsResult.total / limit)
    } : undefined);
    
    // Get documents count for each training
    const trainingsWithDocs = await Promise.all(
      trainings.map(async (training) => {
        const documents = await trainingsModel.getTrainingDocuments(training.id);
        return {
          ...training,
          documents_count: documents.length
        };
      })
    );
    
    res.list(trainingsWithDocs, req.t('generic.ok'), pagination);
  } catch (err) {
    console.error('[GET_TRAININGS_ERROR]', { message: err.message, stack: err.stack, query: req.query });
    res.fail(err.message, 500, 'TRAININGS_LIST_ERROR');
  }
};

// Get training by ID with documents
const getTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await trainingsModel.getTrainingById(id);
    
    if (!training) {
      return res.fail(req.t('training.notFound'), 404, 'TRAINING_NOT_FOUND');
    }
    
    // Get documents
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    res.success({
      ...training,
      documents
    });
  } catch (err) {
    console.error('[GET_TRAINING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'TRAINING_FETCH_ERROR');
  }
};

// Get training documents
const getTrainingDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    res.list(documents || [], req.t('generic.ok'), {
      count: documents.length
    });
  } catch (err) {
    console.error('[GET_TRAINING_DOCUMENTS_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'TRAINING_DOCS_ERROR');
  }
};

// Create new training with documents
const createTraining = async (req, res) => {
  try {
    const { employee_id, training_date, type, documents } = req.body;
    
    // Validate required fields
    if (!employee_id || !training_date || !type) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
    // Create training
    const trainingData = {
      employee_id,
      training_date,
      type,
      created_by
    };
    
    const trainingId = await trainingsModel.createTraining(trainingData);
    
    // Add documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await trainingsModel.createTrainingDocument({
            training_id: trainingId,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the created training with full details
    const newTraining = await trainingsModel.getTrainingById(trainingId);
    const trainingDocuments = await trainingsModel.getTrainingDocuments(trainingId);
    
    res.created({
      ...newTraining,
      documents: trainingDocuments
    }, req.t('training.created'));
  } catch (err) {
    console.error('[CREATE_TRAINING_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(err.message, 500, 'TRAINING_CREATE_ERROR');
  }
};

// Update training
const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { training_date, type, documents } = req.body;
    
    // Validate required fields
    if (!training_date || !type) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Check if training exists
    const existingTraining = await trainingsModel.getTrainingById(id);
    if (!existingTraining) {
      return res.fail(req.t('training.notFound'), 404, 'TRAINING_NOT_FOUND');
    }
    
    // Update training
    const trainingData = {
      training_date,
      type
    };
    
    await trainingsModel.updateTraining(id, trainingData);
    
    // Add new documents if provided
    const created_by = req.user?.id || null;
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await trainingsModel.createTrainingDocument({
            training_id: id,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the updated training with documents
    const updatedTraining = await trainingsModel.getTrainingById(id);
    const trainingDocuments = await trainingsModel.getTrainingDocuments(id);
    
    res.success({
      ...updatedTraining,
      documents: trainingDocuments
    }, req.t('training.updated'));
  } catch (err) {
    console.error('[UPDATE_TRAINING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack, body: req.body });
    res.fail(err.message, 500, 'TRAINING_UPDATE_ERROR');
  }
};

// Delete training document
const deleteTrainingDocument = async (req, res) => {
  try {
    const { trainingId, documentId } = req.params;
    
    // Get documents before deleting
    const documents = await trainingsModel.getTrainingDocuments(trainingId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    if (!documentToDelete) {
      return res.fail(req.t('generic.notFound'), 404, 'DOC_NOT_FOUND');
    }
    
    // Delete from database
    await trainingsModel.deleteTrainingDocument(documentId, trainingId);
    
    // Delete file
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.success(null, req.t('training.docDeleted'));
  } catch (err) {
    console.error('[DELETE_TRAINING_DOC_ERROR]', { trainingId: req.params.trainingId, documentId: req.params.documentId, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'TRAINING_DOC_DELETE_ERROR');
  }
};

// Delete training (and all documents)
const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if training exists
    const existingTraining = await trainingsModel.getTrainingById(id);
    if (!existingTraining) {
      return res.fail(req.t('training.notFound'), 404, 'TRAINING_NOT_FOUND');
    }
    
    // Get documents before deleting
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    // Delete from database (cascade will delete document records)
    await trainingsModel.deleteTraining(id);
    
    // Delete files
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.success(null, req.t('training.deleted'));
  } catch (err) {
    console.error('[DELETE_TRAINING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'TRAINING_DELETE_ERROR');
  }
};

module.exports = {
  getTrainings,
  getTraining,
  getTrainingDocuments,
  createTraining,
  updateTraining,
  deleteTrainingDocument,
  deleteTraining
};
