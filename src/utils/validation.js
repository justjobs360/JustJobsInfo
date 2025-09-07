/**
 * Validate email address format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and errors
 */
export function validatePassword(password) {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if it's a valid length (7-15 digits)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

/**
 * Validate job alert preferences
 * @param {Object} preferences - Job alert preferences
 * @returns {Object} - Validation result
 */
export function validateJobAlertPreferences(preferences) {
  const errors = [];
  
  if (!preferences || typeof preferences !== 'object') {
    errors.push('Preferences object is required');
    return { isValid: false, errors };
  }
  
  // Validate email
  if (!validateEmail(preferences.email)) {
    errors.push('Valid email is required');
  }
  
  // Validate name
  if (!validateName(preferences.name)) {
    errors.push('Valid name is required (2-50 characters)');
  }
  
  // Validate keywords
  if (!preferences.keywords || !Array.isArray(preferences.keywords)) {
    errors.push('Keywords must be an array');
  } else if (preferences.keywords.length === 0) {
    errors.push('At least one keyword is required');
  }
  
  // Validate locations
  if (!preferences.locations || !Array.isArray(preferences.locations)) {
    errors.push('Locations must be an array');
  }
  
  // Validate frequency
  const validFrequencies = ['immediate', 'daily', 'weekly'];
  if (!validFrequencies.includes(preferences.frequency)) {
    errors.push('Invalid frequency. Must be immediate, daily, or weekly');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
