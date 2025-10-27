const partiesDocumentsService = require("../services/partiesDocumentsService");

const getAllPartiesDocuments = async (req, res) => {
  try {
    const documents = await partiesDocumentsService.listPartiesDocuments();
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching parties documents",
      error: error.message
    });
  }
};

const getPartiesDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await partiesDocumentsService.getPartiesDocument(id);
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsByPartyId = async (req, res) => {
  try {
    const { partyId } = req.params;
    const documents = await partiesDocumentsService.getDocumentsByParty(partyId);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message === "Party not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const createPartiesDocument = async (req, res) => {
  try {
    const documentData = req.body;
    const newDocument = await partiesDocumentsService.addPartiesDocument(documentData);
    res.status(201).json({
      success: true,
      message: "Parties document created successfully",
      data: newDocument
    });
  } catch (error) {
    const status = error.message.includes("Missing required fields") ||
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const updatePartiesDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    const updatedDocument = await partiesDocumentsService.updatePartiesDocument(id, documentData);
    res.status(200).json({
      success: true,
      message: "Parties document updated successfully",
      data: updatedDocument
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 :
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const deletePartiesDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await partiesDocumentsService.removePartiesDocument(id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsByFileType = async (req, res) => {
  try {
    const { fileType } = req.params;
    const documents = await partiesDocumentsService.getDocumentsByFileType(fileType);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message.includes("must be") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const searchPartiesDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required"
      });
    }

    const documents = await partiesDocumentsService.searchPartiesDocuments(q);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message.includes("must be") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsStatistics = async (req, res) => {
  try {
    const stats = await partiesDocumentsService.getDocumentsStatistics();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents statistics",
      error: error.message
    });
  }
};

const uploadPartiesDocument = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { party_id } = req.body;
    
    if (!party_id) {
      return res.status(400).json({
        success: false,
        message: "Party ID is required"
      });
    }

    // Import required modules for S3 upload
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const path = require('path');

    // Configure AWS S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const folder = 'parties-documents';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;

    // Upload all files and create document records
    const uploadPromises = req.files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${folder}/${filename}`;

      // Upload to S3
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(putCommand);

      // Generate file URL
      let fileUrl;
      if (usePublicUrl && publicUrl) {
        fileUrl = `${publicUrl}/${key}`;
      } else {
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        const { GetObjectCommand } = require('@aws-sdk/client-s3');
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days
      }

      // Create document record in database
      const documentData = {
        party_id: party_id,
        file_name: file.originalname,
        url: fileUrl,
        uploaded_by: req.user?.id || null // If user is authenticated
      };

      return await partiesDocumentsService.addPartiesDocument(documentData);
    });

    const uploadedDocuments = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} file(s) uploaded successfully`,
      data: uploadedDocuments
    });
  } catch (error) {
    console.error('Error uploading parties documents:', error);
    const status = error.message.includes("Missing required fields") ||
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPartiesDocuments,
  getPartiesDocumentById,
  getDocumentsByPartyId,
  createPartiesDocument,
  updatePartiesDocument,
  deletePartiesDocument,
  getDocumentsByFileType,
  searchPartiesDocuments,
  getDocumentsStatistics,
  uploadPartiesDocument
};