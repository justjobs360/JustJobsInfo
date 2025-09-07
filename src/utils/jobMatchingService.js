const { MongoClient } = require('mongodb');

class JobMatchingService {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI;
    this.dbName = 'justjobsdata';
    this.jobsCollectionName = 'jobs';
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
    }
    return this.client.db(this.dbName).collection(this.jobsCollectionName);
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Match jobs against user preferences
   * @param {Object} userPreferences - User's job alert preferences
   * @param {number} limit - Maximum number of jobs to return
   * @param {Date} sinceDate - Only return jobs posted after this date
   */
  async findMatchingJobs(userPreferences, limit = 20, sinceDate = null) {
    try {
      const collection = await this.connect();
      
      // Build query based on user preferences
      const query = this.buildJobQuery(userPreferences, sinceDate);
      
      // Find matching jobs
      const jobs = await collection
        .find(query)
        .sort({ posted_at: -1 }) // Most recent first
        .limit(limit)
        .toArray();

      // Score and rank jobs based on relevance
      const scoredJobs = this.scoreJobs(jobs, userPreferences);
      
      return {
        success: true,
        jobs: scoredJobs,
        totalFound: scoredJobs.length
      };
    } catch (error) {
      console.error('Error finding matching jobs:', error);
      return {
        success: false,
        error: error.message,
        jobs: []
      };
    }
  }

  /**
   * Build MongoDB query based on user preferences
   */
  buildJobQuery(userPreferences, sinceDate) {
    const query = {
      // Only active jobs
      status: 'active'
    };

    // Date filter
    if (sinceDate) {
      query.posted_at = { $gte: sinceDate };
    }

    // Keywords matching
    if (userPreferences.keywords && userPreferences.keywords.length > 0) {
      const keywordRegex = userPreferences.keywords.map(keyword => 
        new RegExp(keyword.trim(), 'i')
      );
      
      query.$or = [
        { title: { $in: keywordRegex } },
        { description: { $in: keywordRegex } },
        { company: { $in: keywordRegex } },
        { skills: { $in: keywordRegex } }
      ];
    }

    // Location matching
    if (userPreferences.locations && userPreferences.locations.length > 0) {
      const locationRegex = userPreferences.locations.map(location => 
        new RegExp(location.trim(), 'i')
      );
      
      if (query.$or) {
        query.$or.push({ location: { $in: locationRegex } });
      } else {
        query.$or = [{ location: { $in: locationRegex } }];
      }
    }

    // Remote only filter
    if (userPreferences.remoteOnly) {
      query.is_remote = true;
    }

    // Employment type filter
    if (userPreferences.employmentTypes && userPreferences.employmentTypes.length > 0) {
      query.employment_type = { $in: userPreferences.employmentTypes };
    }

    // Seniority level filter
    if (userPreferences.seniority && userPreferences.seniority.length > 0) {
      query.seniority = { $in: userPreferences.seniority };
    }

    return query;
  }

  /**
   * Score jobs based on relevance to user preferences
   */
  scoreJobs(jobs, userPreferences) {
    return jobs.map(job => {
      let score = 0;
      const jobText = `${job.title} ${job.description} ${job.company} ${job.skills || ''}`.toLowerCase();

      // Score based on keyword matches
      if (userPreferences.keywords && userPreferences.keywords.length > 0) {
        userPreferences.keywords.forEach(keyword => {
          const keywordLower = keyword.toLowerCase();
          
          // Title match gets highest score
          if (job.title.toLowerCase().includes(keywordLower)) {
            score += 10;
          }
          
          // Company match gets high score
          if (job.company.toLowerCase().includes(keywordLower)) {
            score += 8;
          }
          
          // Description match gets medium score
          if (job.description && job.description.toLowerCase().includes(keywordLower)) {
            score += 5;
          }
          
          // Skills match gets medium score
          if (job.skills && job.skills.toLowerCase().includes(keywordLower)) {
            score += 6;
          }
        });
      }

      // Score based on location matches
      if (userPreferences.locations && userPreferences.locations.length > 0) {
        userPreferences.locations.forEach(location => {
          if (job.location.toLowerCase().includes(location.toLowerCase())) {
            score += 7;
          }
        });
      }

      // Remote preference bonus
      if (userPreferences.remoteOnly && job.is_remote) {
        score += 5;
      }

      // Employment type match
      if (userPreferences.employmentTypes && userPreferences.employmentTypes.includes(job.employment_type)) {
        score += 3;
      }

      // Seniority match
      if (userPreferences.seniority && userPreferences.seniority.includes(job.seniority)) {
        score += 3;
      }

      // Recency bonus (newer jobs get higher score)
      const daysSincePosted = (new Date() - new Date(job.posted_at)) / (1000 * 60 * 60 * 24);
      if (daysSincePosted <= 1) {
        score += 5;
      } else if (daysSincePosted <= 3) {
        score += 3;
      } else if (daysSincePosted <= 7) {
        score += 1;
      }

      return {
        ...job,
        relevanceScore: score
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance score
    .filter(job => job.relevanceScore > 0); // Only return jobs with positive relevance
  }

  /**
   * Get recent jobs for a specific user (considering their last sent date)
   */
  async getRecentJobsForUser(userPreferences, limit = 20) {
    try {
      // Calculate since date based on user's last sent date
      let sinceDate = null;
      
      if (userPreferences.lastSentAt) {
        sinceDate = new Date(userPreferences.lastSentAt);
      } else {
        // If never sent, get jobs from last 7 days
        sinceDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      return await this.findMatchingJobs(userPreferences, limit, sinceDate);
    } catch (error) {
      console.error('Error getting recent jobs for user:', error);
      return {
        success: false,
        error: error.message,
        jobs: []
      };
    }
  }

  /**
   * Get sample jobs for testing
   */
  async getSampleJobs(limit = 5) {
    try {
      const collection = await this.connect();
      
      const jobs = await collection
        .find({ status: 'active' })
        .sort({ posted_at: -1 })
        .limit(limit)
        .toArray();

      return {
        success: true,
        jobs
      };
    } catch (error) {
      console.error('Error getting sample jobs:', error);
      return {
        success: false,
        error: error.message,
        jobs: []
      };
    }
  }

  /**
   * Get job statistics
   */
  async getJobStats() {
    try {
      const collection = await this.connect();
      
      const totalJobs = await collection.countDocuments({ status: 'active' });
      const recentJobs = await collection.countDocuments({
        status: 'active',
        posted_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      const remoteJobs = await collection.countDocuments({
        status: 'active',
        is_remote: true
      });

      return {
        success: true,
        stats: {
          totalJobs,
          recentJobs,
          remoteJobs
        }
      };
    } catch (error) {
      console.error('Error getting job stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = JobMatchingService;
