const partiesFormsModel = require("../models/partiesFormsModel");
const { deleteFileFromS3 } = require("../services/awsS3Service");

// Get all parties forms
const getPartiesForms = async (req, res) => {
  try {
    const { type } = req.query;
    
    let forms;
    if (type) {
      forms = await partiesFormsModel.getPartiesFormsByType(type);
    } else {
      forms = await partiesFormsModel.getAllPartiesForms();
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

// Get parties form by ID
const getPartiesForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await partiesFormsModel.getPartiesFormById(id);
    
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

// Create new parties form
const createPartiesForm = async (req, res) => {
  try {
    const { title, document_name, document_url, type } = req.body;
    const created_by = req.user.id; // From authenticateToken middleware
    
    // Validation
    if (!title || !document_name || !document_url || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, document name, document URL, and type are required"
      });
    }
    
    // Validate type against allowed values
    const allowedTypes = partiesFormsModel.getPartiesFormTypes();
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form type. Must be 'welcome_message' or 'price_quote'"
      });
    }
    
    const formId = await partiesFormsModel.createPartiesForm({ 
      title, 
      document_name, 
      document_url, 
      type, 
      created_by 
    });
    
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

// Update parties form
const updatePartiesForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, document_name, document_url, type } = req.body;
    
    // Validation
    if (!title || !document_name || !document_url || !type) {
      return res.status(400).json({
        success: false,
        message: "Title, document name, document URL, and type are required"
      });
    }
    
    // Validate type against allowed values
    const allowedTypes = partiesFormsModel.getPartiesFormTypes();
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form type. Must be 'welcome_message' or 'price_quote'"
      });
    }
    
    const updated = await partiesFormsModel.updatePartiesForm(id, { 
      title, 
      document_name, 
      document_url, 
      type 
    });
    
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

// Delete parties form
const deletePartiesForm = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, get the form to retrieve the document_url
    const form = await partiesFormsModel.getPartiesFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Delete the form from database
    const deleted = await partiesFormsModel.deletePartiesForm(id);
    
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

// Get parties form types (enum values)
const getPartiesFormTypes = async (req, res) => {
  try {
    const formTypes = partiesFormsModel.getPartiesFormTypes();
    
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

// Download parties form (proxy to actual file)
const downloadPartiesForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await partiesFormsModel.getPartiesFormById(id);
    
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found"
      });
    }
    
    // Redirect to the document URL
    res.redirect(form.document_url);
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getPartiesForms,
  getPartiesForm,
  createPartiesForm,
  updatePartiesForm,
  deletePartiesForm,
  getPartiesFormTypes,
  downloadPartiesForm
};
