// CV Audit Service - Utility functions for CV audit API calls

export class CVAuditService {
  static async auditCV(file, user = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Prepare headers
      const headers = {};
      
      // Add Firebase ID token if user is authenticated
      if (user) {
        try {
          const idToken = await user.getIdToken();
          headers['Authorization'] = `Bearer ${idToken}`;
        } catch (tokenError) {
          console.warn('Failed to get ID token:', tokenError);
          // Continue without token - will be treated as guest user
        }
      }

      const response = await fetch('/api/cv', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return result;
    } catch (error) {
      console.error('CV Audit API Error:', error);
      throw error;
    }
  }

  static validateFile(file) {
    const errors = [];

    // Check if file exists
    if (!file) {
      errors.push('No file selected');
      return errors;
    }

    // Check file type - DOCX and DOC allowed
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];
    
    if (!allowedTypes.includes(file.type)) {
      errors.push('Please upload a DOCX or DOC file only. PDF files are not supported.');
    }

    // Check file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }

    // Check minimum file size (1KB)
    const minSize = 1024;
    if (file.size < minSize) {
      errors.push('File appears to be too small or corrupted');
    }

    return errors;
  }

  static getFileInfo(file) {
    if (!file) return null;

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeFormatted: this.formatFileSize(file.size),
      extension: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    };
  }

  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static getEstimatedProcessingTime(fileSize, fileType) {
    // Rough estimation based on file size and type
    const sizeInMB = fileSize / (1024 * 1024);
    
    // PDFs get direct analysis which is typically faster
    if (fileType === 'application/pdf') {
      if (sizeInMB < 1) return '20-40 seconds';
      if (sizeInMB < 2) return '30-60 seconds';
      if (sizeInMB < 5) return '1-2 minutes';
      return '2-3 minutes';
    }
    
    // DOCX/DOC files require text extraction first
    if (sizeInMB < 1) return '30-60 seconds';
    if (sizeInMB < 2) return '1-2 minutes';
    if (sizeInMB < 5) return '2-3 minutes';
    
    return '3-5 minutes';
  }

  static getProcessingMethod(fileType) {
    if (fileType === 'application/pdf') {
      return 'Direct PDF file upload with GPT-4o analysis via Assistants API';
    } else if (fileType === 'application/msword') {
      return 'DOC text extraction with GPT-4o-mini analysis';
    }
    return 'DOCX text extraction with GPT-4o-mini analysis';
  }
} 
