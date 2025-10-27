const formsModel = require("../models/formsModel");
const { deleteFileFromS3 } = require("../services/awsS3Service");

// Get all forms
const getForms = async (req, res) => {
  try {
    const { document_for } = req.query;
    
    let forms;
    if (document_for) {
      forms = await formsModel.getFormsByType(document_for);
    } else {
      forms = await formsModel.getAllForms();
    }
    
    res.json({
      success: true,
      data: forms,
      count: forms.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get form by ID
const getForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await formsModel.getFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    res.json({
      success: true,
      data: form
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new form
const createForm = async (req, res) => {
  try {
    const { document_url, document_for } = req.body;
    
    // Validation
    if (!document_url || !document_for) {
      return res.status(400).json({
        success: false,
        message: "Document URL and document type are required"
      });
    }
    
    // Validate document_for against allowed values
    const allowedTypes = formsModel.getFormTypes();
    if (!allowedTypes.includes(document_for)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type"
      });
    }
    
    const formId = await formsModel.createForm({ document_url, document_for });
    
    res.status(201).json({
      success: true,
      message: "Form created successfully",
      data: { id: formId }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update form
const updateForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { document_url, document_for } = req.body;
    
    // Validation
    if (!document_url || !document_for) {
      return res.status(400).json({
        success: false,
        message: "Document URL and document type are required"
      });
    }
    
    // Validate document_for against allowed values
    const allowedTypes = formsModel.getFormTypes();
    if (!allowedTypes.includes(document_for)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document type"
      });
    }
    
    const updated = await formsModel.updateForm(id, { document_url, document_for });
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    res.json({
      success: true,
      message: "Form updated successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete form
const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the form to retrieve the document_url
    const form = await formsModel.getFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Delete the form from database
    const deleted = await formsModel.deleteForm(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Delete the file from AWS S3
    if (form.document_url) {
      try {
        await deleteFileFromS3(form.document_url);
      } catch (s3Error) {
        // Log the error but don't fail the request since the DB record is already deleted
        console.error('Error deleting file from S3:', s3Error);
      }
    }
    
    res.json({
      success: true,
      message: "Form deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get form types (enum values)
const getFormTypes = async (req, res) => {
  try {
    const formTypes = formsModel.getFormTypes();
    
    res.json({
      success: true,
      data: formTypes
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Download form (proxy to actual file)
const downloadForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await formsModel.getFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // For now, just redirect to the document URL
    // In a production environment, you might want to serve the file through your backend
    // for security and access control
    res.redirect(form.document_url);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getFormTypes,
  downloadForm
};