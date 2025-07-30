const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation middleware for file upload metadata
const validateUploadMetadata = [
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('category').optional().isIn(['image', 'document', 'other']).withMessage('Category must be image, document, or other')
];

// Helper function to process uploaded files
const processUploadedFiles = async (files, options = {}) => {
  const processedFiles = [];
  
  for (const file of files) {
    const fileInfo = {
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      url: `/uploads/${file.filename}`
    };

    // Process images with Sharp
    if (file.mimetype.startsWith('image/') && options.processImages !== false) {
      try {
        const metadata = await sharp(file.path).metadata();
        fileInfo.dimensions = {
          width: metadata.width,
          height: metadata.height
        };

        // Create thumbnail for images
        if (options.createThumbnail !== false) {
          const thumbnailPath = path.join(
            path.dirname(file.path),
            'thumb_' + file.filename
          );
          
          await sharp(file.path)
            .resize(200, 200, { 
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
            
          fileInfo.thumbnail = `/uploads/thumb_${file.filename}`;
        }
      } catch (error) {
        console.error('Error processing image:', error);
        // Continue without image processing if it fails
      }
    }

    processedFiles.push(fileInfo);
  }

  return processedFiles;
};

// Single file upload endpoint
router.post('/single', uploadSingle('file'), validateUploadMetadata, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const processedFiles = await processUploadedFiles([req.file], {
    createThumbnail: req.body.createThumbnail !== 'false',
    processImages: req.body.processImages !== 'false'
  });

  const fileInfo = processedFiles[0];

  // Add metadata from request body
  if (req.body.description) fileInfo.description = req.body.description;
  if (req.body.tags) fileInfo.tags = JSON.parse(req.body.tags);
  if (req.body.category) fileInfo.category = req.body.category;

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    file: fileInfo,
    uploadedAt: new Date().toISOString()
  });
}));

// Multiple files upload endpoint
router.post('/multiple', uploadMultiple('files'), validateUploadMetadata, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  if (!req.files || req.files.length === 0) {
    throw new ValidationError('No files uploaded');
  }

  const processedFiles = await processUploadedFiles(req.files, {
    createThumbnail: req.body.createThumbnail !== 'false',
    processImages: req.body.processImages !== 'false'
  });

  // Add metadata to all files
  processedFiles.forEach(file => {
    if (req.body.description) file.description = req.body.description;
    if (req.body.tags) file.tags = JSON.parse(req.body.tags);
    if (req.body.category) file.category = req.body.category;
  });

  res.status(201).json({
    success: true,
    message: `${processedFiles.length} files uploaded successfully`,
    files: processedFiles,
    uploadedAt: new Date().toISOString()
  });
}));

// Get uploaded file endpoint
router.get('/:filename', asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new NotFoundError('File');
  }

  // Get file stats
  const stats = fs.statSync(filePath);
  
  res.sendFile(filePath, {
    headers: {
      'Content-Length': stats.size,
      'Last-Modified': stats.mtime.toUTCString()
    }
  });
}));

// List uploaded files endpoint
router.get('/', asyncHandler(async (req, res) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    return res.json({
      success: true,
      files: [],
      total: 0
    });
  }

  const files = fs.readdirSync(uploadsDir);
  const fileList = files
    .filter(file => !file.startsWith('thumb_')) // Exclude thumbnails from listing
    .map(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      return {
        filename: file,
        size: stats.size,
        uploadedAt: stats.birthtime,
        url: `/uploads/${file}`,
        hasThumnail: fs.existsSync(path.join(uploadsDir, `thumb_${file}`))
      };
    })
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  res.json({
    success: true,
    files: fileList,
    total: fileList.length
  });
}));

// Delete uploaded file endpoint
router.delete('/:filename', asyncHandler(async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  const thumbnailPath = path.join(__dirname, '../uploads', `thumb_${filename}`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new NotFoundError('File');
  }

  // Delete main file
  fs.unlinkSync(filePath);

  // Delete thumbnail if exists
  if (fs.existsSync(thumbnailPath)) {
    fs.unlinkSync(thumbnailPath);
  }

  res.json({
    success: true,
    message: 'File deleted successfully',
    filename: filename
  });
}));

module.exports = router;
