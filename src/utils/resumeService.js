import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

class ResumeService {
  // Helper function to check if Firebase is ready
  static isFirebaseReady() {
    return auth && db;
  }

  // Helper function to check if user is authenticated
  static isUserAuthenticated() {
    return auth && auth.currentUser !== null;
  }

  // Helper function to get current user ID
  static getCurrentUserId() {
    return auth && auth.currentUser ? auth.currentUser.uid : null;
  }

  // Save user's resume data
  static async saveUserResume(userId, resumeData) {
    try {
      // Ensure Firebase is ready
      if (!this.isFirebaseReady()) {
        throw new Error('Firebase not initialized');
      }

      // Ensure user is authenticated
      if (!this.isUserAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Ensure the user is trying to save their own data
      if (userId !== this.getCurrentUserId()) {
        throw new Error('Unauthorized: Cannot save data for another user');
      }

      const userResumeRef = doc(db, 'userResumes', userId);
      
      const resumeDocument = {
        userId,
        resumeData,
        sections: resumeData.sections || [],
        customSections: resumeData.customSections || [],
        lastUpdated: new Date().toISOString(),
        createdAt: resumeData.createdAt || new Date().toISOString(),
        templateId: resumeData.templateId || null,
        version: (resumeData.version || 0) + 1
      };

      await setDoc(userResumeRef, resumeDocument, { merge: true });
      
      console.log('Resume data saved successfully for user:', userId);
      return { success: true, version: resumeDocument.version };
    } catch (error) {
      console.error('Error saving resume data:', error);
      throw new Error(`Failed to save resume: ${error.message}`);
    }
  }

  // Load user's resume data
  static async loadUserResume(userId) {
    try {
      // Ensure Firebase is ready
      if (!this.isFirebaseReady()) {
        throw new Error('Firebase not initialized');
      }

      // Ensure user is authenticated
      if (!this.isUserAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Ensure the user is trying to load their own data
      if (userId !== this.getCurrentUserId()) {
        throw new Error('Unauthorized: Cannot load data for another user');
      }

      const userResumeRef = doc(db, 'userResumes', userId);
      const userResumeDoc = await getDoc(userResumeRef);
      
      if (userResumeDoc.exists()) {
        const data = userResumeDoc.data();
        console.log('Resume data loaded successfully for user:', userId);
        return {
          success: true,
          data: data.resumeData,
          sections: data.sections || [],
          customSections: data.customSections || [],
          lastUpdated: data.lastUpdated,
          version: data.version || 0
        };
      } else {
        console.log('No resume data found for user:', userId);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      throw new Error(`Failed to load resume: ${error.message}`);
    }
  }

  // Save resume progress (auto-save)
  static async saveResumeProgress(userId, resumeData, sections = [], customSections = []) {
    try {
      // Ensure Firebase is ready
      if (!this.isFirebaseReady()) {
        throw new Error('Firebase not initialized');
      }

      // Ensure user is authenticated
      if (!this.isUserAuthenticated()) {
        throw new Error('User not authenticated');
      }

      // Ensure the user is trying to save their own data
      if (userId !== this.getCurrentUserId()) {
        throw new Error('Unauthorized: Cannot save data for another user');
      }

      const userResumeRef = doc(db, 'userResumes', userId);
      
      const progressData = {
        userId,
        resumeData,
        sections,
        customSections,
        lastUpdated: new Date().toISOString(),
        isDraft: true
      };

      // Use setDoc with merge to create document if it doesn't exist
      await setDoc(userResumeRef, progressData, { merge: true });
      
      console.log('Resume progress saved for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error saving resume progress:', error);
      // Don't throw error for auto-save failures
      return { success: false, error: error.message };
    }
  }

  // Get user's resume versions/history
  static async getUserResumeHistory(userId) {
    try {
      const userResumeRef = doc(db, 'userResumes', userId);
      const userResumeDoc = await getDoc(userResumeRef);
      
      if (userResumeDoc.exists()) {
        const data = userResumeDoc.data();
        return {
          success: true,
          history: [{
            version: data.version || 1,
            lastUpdated: data.lastUpdated,
            templateId: data.templateId,
            isDraft: data.isDraft || false
          }]
        };
      }
      
      return { success: false, history: [] };
    } catch (error) {
      console.error('Error getting resume history:', error);
      return { success: false, history: [], error: error.message };
    }
  }

  // Delete user's resume data
  static async deleteUserResume(userId) {
    try {
      const userResumeRef = doc(db, 'userResumes', userId);
      await setDoc(userResumeRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
      
      console.log('Resume data marked as deleted for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting resume data:', error);
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }

  // Check if user has existing resume data
  static async hasExistingResume(userId) {
    try {
      const userResumeRef = doc(db, 'userResumes', userId);
      const userResumeDoc = await getDoc(userResumeRef);
      
      return userResumeDoc.exists() && !userResumeDoc.data().deleted;
    } catch (error) {
      console.error('Error checking existing resume:', error);
      return false;
    }
  }

  // Export resume data for backup
  static async exportUserResume(userId) {
    try {
      const resumeData = await this.loadUserResume(userId);
      if (resumeData.success) {
        return {
          success: true,
          exportData: {
            ...resumeData.data,
            sections: resumeData.sections,
            customSections: resumeData.customSections,
            exportedAt: new Date().toISOString(),
            version: resumeData.version
          }
        };
      }
      return { success: false, error: 'No resume data found' };
    } catch (error) {
      console.error('Error exporting resume:', error);
      return { success: false, error: error.message };
    }
  }

  // Import resume data from backup
  static async importUserResume(userId, importData) {
    try {
      const { resumeData, sections, customSections } = importData;
      
      const userResumeRef = doc(db, 'userResumes', userId);
      
      const importDocument = {
        userId,
        resumeData,
        sections: sections || [],
        customSections: customSections || [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        importedAt: new Date().toISOString(),
        version: 1
      };

      await setDoc(userResumeRef, importDocument);
      
      console.log('Resume data imported successfully for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error importing resume data:', error);
      throw new Error(`Failed to import resume: ${error.message}`);
    }
  }
}

export default ResumeService;
