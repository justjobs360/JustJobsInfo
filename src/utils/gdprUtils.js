// GDPR Utilities for checking consent before using localStorage/cookies

export const getGDPRConsent = () => {
  try {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) return null;
    return JSON.parse(consent);
  } catch (error) {
    console.warn('Error parsing GDPR consent:', error);
    return null;
  }
};

export const hasConsent = (type) => {
  const consent = getGDPRConsent();
  if (!consent) return false;
  
  switch (type) {
    case 'essential':
      return true; // Essential cookies are always allowed
    case 'functional':
      return consent.functional === true;
    case 'analytics':
      return consent.analytics === true;
    default:
      return false;
  }
};

export const canUseLocalStorage = (purpose = 'functional') => {
  return hasConsent(purpose);
};

export const safeLocalStorageSet = (key, value, purpose = 'functional') => {
  if (canUseLocalStorage(purpose)) {
    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
      return false;
    }
  }
  return false;
};

export const safeLocalStorageGet = (key, purpose = 'functional') => {
  if (canUseLocalStorage(purpose)) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }
  return null;
};

export const safeLocalStorageRemove = (key, purpose = 'functional') => {
  if (canUseLocalStorage(purpose)) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
      return false;
    }
  }
  return false;
};

// Specific utilities for common use cases
export const saveResumeData = (templateId, content) => {
  return safeLocalStorageSet(`resume_${templateId}`, {
    templateId,
    content,
    lastModified: new Date().toISOString()
  }, 'functional');
};

export const getResumeData = (templateId) => {
  return safeLocalStorageGet(`resume_${templateId}`, 'functional');
};

export const saveJobAlertsPreference = (enabled) => {
  return safeLocalStorageSet('jobAlertsEnabled', enabled, 'functional');
};

export const getJobAlertsPreference = () => {
  return safeLocalStorageGet('jobAlertsEnabled', 'functional');
};

export const saveBookmarkedJobs = (jobs) => {
  return safeLocalStorageSet('bookmarkedJobs', jobs, 'functional');
};

export const getBookmarkedJobs = () => {
  return safeLocalStorageGet('bookmarkedJobs', 'functional') || [];
};

// Analytics consent check
export const canTrackAnalytics = () => {
  return hasConsent('analytics');
}; 
