const { MongoClient } = require('mongodb');
const crypto = require('crypto');

class JobAlertService {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.dbName = 'justjobsdata';
    this.collectionName = 'job_alerts';
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
    }
    return this.client.db(this.dbName).collection(this.collectionName);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Generate a unique unsubscribe token
   */
  generateUnsubscribeToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Subscribe a user to job alerts
   * @param {Object} userData - User subscription data
   * @param {string} userData.email - User email
   * @param {string} userData.name - User name
   * @param {Array} userData.keywords - Search keywords
   * @param {Array} userData.locations - Preferred locations
   * @param {boolean} userData.remoteOnly - Only remote jobs
   * @param {Array} userData.employmentTypes - Employment types
   * @param {Array} userData.seniority - Seniority levels
   * @param {string} userData.frequency - Alert frequency (immediate, daily, weekly)
   */
  async subscribeUser(userData) {
    try {
      const collection = await this.connect();
      
      const unsubscribeToken = this.generateUnsubscribeToken();
      const now = new Date();
      
      const alertData = {
        email: userData.email.toLowerCase().trim(),
        name: userData.name?.trim() || '',
        keywords: userData.keywords || [],
        locations: userData.locations || [],
        remoteOnly: userData.remoteOnly || false,
        employmentTypes: userData.employmentTypes || ['Full-time', 'Part-time', 'Contract'],
        seniority: userData.seniority || ['Entry', 'Mid', 'Senior', 'Executive'],
        frequency: userData.frequency || 'immediate',
        isActive: true,
        unsubscribeToken,
        createdAt: now,
        updatedAt: now,
        lastSentAt: null,
        totalSent: 0
      };

      // Check if user already exists
      const existingUser = await collection.findOne({ email: alertData.email });
      
      if (existingUser) {
        // Update existing user
        const result = await collection.updateOne(
          { email: alertData.email },
          { 
            $set: {
              ...alertData,
              updatedAt: now,
              // Keep existing unsubscribeToken if user is reactivating
              unsubscribeToken: existingUser.unsubscribeToken || unsubscribeToken
            }
          }
        );
        
        return {
          success: true,
          message: 'Job alert preferences updated successfully',
          unsubscribeToken: existingUser.unsubscribeToken || unsubscribeToken,
          isNewUser: false
        };
      } else {
        // Create new user
        const result = await collection.insertOne(alertData);
        
        return {
          success: true,
          message: 'Successfully subscribed to job alerts',
          unsubscribeToken,
          isNewUser: true,
          id: result.insertedId
        };
      }
    } catch (error) {
      console.error('Error subscribing user to job alerts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Unsubscribe a user from job alerts
   * @param {string} unsubscribeToken - User's unsubscribe token
   */
  async unsubscribeUser(unsubscribeToken) {
    try {
      const collection = await this.connect();
      
      const result = await collection.updateOne(
        { unsubscribeToken },
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return {
          success: false,
          error: 'Invalid unsubscribe token'
        };
      }

      return {
        success: true,
        message: 'Successfully unsubscribed from job alerts'
      };
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's job alert preferences
   * @param {string} email - User email
   */
  async getUserPreferences(email) {
    try {
      const collection = await this.connect();
      
      const user = await collection.findOne({ 
        email: email.toLowerCase().trim(),
        isActive: true 
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found or not subscribed'
        };
      }

      // Remove sensitive data
      const { unsubscribeToken, ...preferences } = user;
      
      return {
        success: true,
        preferences
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all active subscribers for job matching
   */
  async getActiveSubscribers() {
    try {
      const collection = await this.connect();
      
      const subscribers = await collection.find({ 
        isActive: true 
      }).toArray();

      return {
        success: true,
        subscribers
      };
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update last sent timestamp for a user
   * @param {string} email - User email
   * @param {number} jobCount - Number of jobs sent
   */
  async updateLastSent(email, jobCount = 0) {
    try {
      const collection = await this.connect();
      
      await collection.updateOne(
        { email: email.toLowerCase().trim() },
        { 
          $set: { 
            lastSentAt: new Date()
          },
          $inc: {
            totalSent: jobCount
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating last sent timestamp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by unsubscribe token
   * @param {string} unsubscribeToken - User's unsubscribe token
   */
  async getUserByToken(unsubscribeToken) {
    try {
      const collection = await this.connect();
      
      const user = await collection.findOne({ unsubscribeToken });
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid unsubscribe token'
        };
      }

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Error getting user by token:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get subscription statistics
   */
  async getStats() {
    try {
      const collection = await this.connect();
      
      const totalSubscribers = await collection.countDocuments({ isActive: true });
      const totalUnsubscribed = await collection.countDocuments({ isActive: false });
      const recentSubscribers = await collection.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });

      return {
        success: true,
        stats: {
          totalSubscribers,
          totalUnsubscribed,
          recentSubscribers
        }
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = JobAlertService;
