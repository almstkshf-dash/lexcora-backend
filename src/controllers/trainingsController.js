const trainingsModel = require("../models/trainingsModel");
const { deleteDocumentFiles } = require("../services/awsS3Service");

// Get all trainings or by employee_id
const getTrainings = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const trainings = await trainingsModel.getAllTrainings(employee_id || null);
    
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
    
    res.json({
      success: true,
      data: trainingsWithDocs,
      count: trainingsWithDocs.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get training by ID with documents
const getTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const training = await trainingsModel.getTrainingById(id);
    
    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training not found"
      });
    }
    
    // Get documents
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    res.json({
      success: true,
      data: {
        ...training,
        documents
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get training documents
const getTrainingDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new training with documents
const createTraining = async (req, res) => {
  try {
    const { employee_id, training_date, type, documents } = req.body;
    
    // Validate required fields
    if (!employee_id || !training_date || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, training_date, type"
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user.id;
    
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
    
    res.status(201).json({
      success: true,
      message: "Training created successfully",
      data: {
        ...newTraining,
        documents: trainingDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update training
const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const { training_date, type, documents } = req.body;
    
    // Validate required fields
    if (!training_date || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: training_date, type"
      });
    }
    
    // Check if training exists
    const existingTraining = await trainingsModel.getTrainingById(id);
    if (!existingTraining) {
      return res.status(404).json({
        success: false,
        message: "Training not found"
      });
    }
    
    // Update training
    const trainingData = {
      training_date,
      type
    };
    
    await trainingsModel.updateTraining(id, trainingData);
    
    // Add new documents if provided
    const created_by = req.user.id;
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
    
    res.json({
      success: true,
      message: "Training updated successfully",
      data: {
        ...updatedTraining,
        documents: trainingDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
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
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }
    
    // Delete from database
    await trainingsModel.deleteTrainingDocument(documentId, trainingId);
    
    // Delete file from Cloudflare R2
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting training document:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete training (and all documents)
const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if training exists
    const existingTraining = await trainingsModel.getTrainingById(id);
    if (!existingTraining) {
      return res.status(404).json({
        success: false,
        message: "Training not found"
      });
    }
    
    // Get documents before deleting
    const documents = await trainingsModel.getTrainingDocuments(id);
    
    // Delete from database (cascade will delete document records)
    await trainingsModel.deleteTraining(id);
    
    // Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.json({
      success: true,
      message: "Training deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting training:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
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
