const reviewsModel = require("../models/reviewsModel");
const { deleteDocumentFiles } = require("../services/awsS3Service");

// Get all reviews or by employee_id
const getReviews = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = require("../utils/pagination").normalizePagination(req.query, ['created_at', 'id']);
    const reviewsResult = await reviewsModel.getAllReviews(employee_id || null, { page, limit, sortBy, sortOrder });
    const reviews = reviewsResult.rows || reviewsResult.data || reviewsResult;
    const pagination = reviewsResult.pagination || (reviewsResult.total ? {
      total: reviewsResult.total,
      page,
      limit,
      totalPages: Math.ceil(reviewsResult.total / limit)
    } : undefined);
    
    // Get documents count for each review
    const reviewsWithDocs = await Promise.all(
      reviews.map(async (review) => {
        const documents = await reviewsModel.getReviewDocuments(review.id);
        return {
          ...review,
          documents_count: documents.length
        };
      })
    );
    
    res.success(reviewsWithDocs, req.t('generic.ok'), 200, pagination);
  } catch (err) {
    res.fail(err.message, 500, 'REVIEWS_LIST_ERROR');
  }
};

// Get review by ID with documents
const getReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await reviewsModel.getReviewById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }
    
    // Get documents
    const documents = await reviewsModel.getReviewDocuments(id);
    
    res.json({
      success: true,
      data: {
        ...review,
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

// Get review documents
const getReviewDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await reviewsModel.getReviewDocuments(id);
    
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

// Create new review with documents
const createReview = async (req, res) => {
  try {
    const { employee_id, type, date, documents } = req.body;
    
    // Validate required fields
    if (!employee_id || !type || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, type, date"
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user.id;
    
    // Create review
    const reviewData = {
      employee_id,
      type,
      date,
      created_by
    };
    
    const reviewId = await reviewsModel.createReview(reviewData);
    
    // Add documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await reviewsModel.createReviewDocument({
            review_id: reviewId,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the created review with full details
    const newReview = await reviewsModel.getReviewById(reviewId);
    const reviewDocuments = await reviewsModel.getReviewDocuments(reviewId);
    
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        ...newReview,
        documents: reviewDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, date, documents } = req.body;
    
    // Validate required fields
    if (!type || !date) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: type, date"
      });
    }
    
    // Check if review exists
    const existingReview = await reviewsModel.getReviewById(id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }
    
    // Update review
    const reviewData = {
      type,
      date
    };
    
    await reviewsModel.updateReview(id, reviewData);
    
    // Add new documents if provided
    const created_by = req.user.id;
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await reviewsModel.createReviewDocument({
            review_id: id,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the updated review with documents
    const updatedReview = await reviewsModel.getReviewById(id);
    const reviewDocuments = await reviewsModel.getReviewDocuments(id);
    
    res.json({
      success: true,
      message: "Review updated successfully",
      data: {
        ...updatedReview,
        documents: reviewDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete review document
const deleteReviewDocument = async (req, res) => {
  try {
    const { reviewId, documentId } = req.params;
    
    // Get documents before deleting
    const documents = await reviewsModel.getReviewDocuments(reviewId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    if (!documentToDelete) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }
    
    // Delete from database
    await reviewsModel.deleteReviewDocument(documentId, reviewId);
    
    // Delete file from Cloudflare R2
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting review document:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete review (and all documents)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if review exists
    const existingReview = await reviewsModel.getReviewById(id);
    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }
    
    // Get documents before deleting
    const documents = await reviewsModel.getReviewDocuments(id);
    
    // Delete from database (cascade will delete document records)
    await reviewsModel.deleteReview(id);
    
    // Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getReviews,
  getReview,
  getReviewDocuments,
  createReview,
  updateReview,
  deleteReviewDocument,
  deleteReview
};
