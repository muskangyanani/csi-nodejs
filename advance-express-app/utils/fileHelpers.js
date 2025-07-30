/**
 * Validate file type
 * @param {string} mimetype - File mimetype
 * @param {Array} allowedTypes - Array of allowed mimetypes
 * @returns {boolean}
 */
const isValidFileType = (mimetype, allowedTypes = []) => {
  return allowedTypes.includes(mimetype);
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string}
 */
const generateUniqueFilename = (originalName) => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = originalName.split('.').pop();
  const basename = originalName.split('.').slice(0, -1).join('.');
  
  return `${basename}-${timestamp}-${random}.${extension}`;
};

/**
 * Check if file is an image
 * @param {string} mimetype - File mimetype
 * @returns {boolean}
 */
const isImage = (mimetype) => {
  return mimetype.startsWith('image/');
};

/**
 * Get file extension from mimetype
 * @param {string} mimetype - File mimetype
 * @returns {string}
 */
const getExtensionFromMimetype = (mimetype) => {
  const mimetypeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/json': 'json',
    'text/csv': 'csv'
  };
  
  return mimetypeMap[mimetype] || 'bin';
};

module.exports = {
  isValidFileType,
  formatFileSize,
  generateUniqueFilename,
  isImage,
  getExtensionFromMimetype
};
