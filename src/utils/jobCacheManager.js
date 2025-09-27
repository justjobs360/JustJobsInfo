import { getCachedValue, setCachedValue } from './cacheService';
import { recordUpstreamCall, getMonthlyCount, isNearMonthlyLimit } from './usageService';

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';
const MAX_MONTHLY_CALLS = parseInt(process.env.JSEARCH_MONTHLY_LIMIT || '100', 10);

// Popular job search combinations to prewarm
const POPULAR_SEARCHES = [
  { query: 'software developer', location: '', employment_types: 'FULLTIME' },
  { query: 'marketing manager', location: '', employment_types: 'FULLTIME' },
  { query: 'data analyst', location: '', employment_types: 'FULLTIME' },
  { query: 'project manager', location: '', employment_types: 'FULLTIME' },
  { query: 'sales representative', location: '', employment_types: 'FULLTIME' },
  { query: 'customer service', location: '', employment_types: 'FULLTIME' },
  { query: 'software engineer', location: 'remote', employment_types: 'FULLTIME', remote_jobs_only: true },
  { query: 'graphic designer', location: '', employment_types: 'FULLTIME' },
  { query: 'accountant', location: '', employment_types: 'FULLTIME' },
  { query: 'nurse', location: '', employment_types: 'FULLTIME' },
  // Add more popular searches as needed
];

class JobCacheManager {
  constructor() {
    this.isPrewarming = false;
    this.lastPrewarmTime = null;
    this.prewarmInterval = 24 * 60 * 60 * 1000; // 24 hours (daily)
  }

  /**
   * Check if we should prewarm cache based on time and usage
   */
  async shouldPrewarm() {
    // Don't prewarm if we're near the limit
    const { near, count } = await isNearMonthlyLimit(0.8);
    if (near) {
      console.log(`⚠️ Skipping prewarm - near monthly limit (${count}/${MAX_MONTHLY_CALLS})`);
      return false;
    }

    // Don't prewarm if we're already doing it
    if (this.isPrewarming) {
      return false;
    }

    // Prewarm if it's been more than 24 hours since last prewarm
    const now = Date.now();
    if (!this.lastPrewarmTime || (now - this.lastPrewarmTime) > this.prewarmInterval) {
      return true;
    }

    return false;
  }

  /**
   * Fetch jobs from external API with proper error handling
   */
  async fetchFromExternalAPI(params) {
    try {
      const baseUrl = `https://${JSEARCH_API_HOST}/search`;
      const urlParams = new URLSearchParams({
        query: params.location ? `${params.query} in ${params.location}` : params.query,
        page: '1',
        num_pages: '3', // Get more results per call
        ...(params.employment_types && { employment_types: params.employment_types }),
        ...(params.remote_jobs_only && { remote_jobs_only: 'true' }),
        ...(params.date_posted && params.date_posted !== 'all' && { date_posted: params.date_posted })
      });

      const apiUrl = `${baseUrl}?${urlParams.toString()}`;
      console.log('🔄 Fetching from external API:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': JSEARCH_API_KEY,
          'X-RapidAPI-Host': JSEARCH_API_HOST,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Record the API call
      await recordUpstreamCall();
      
      return {
        success: true,
        data: data.data || [],
        total: data.total || 0,
        hasMore: data.hasMore || false,
        query_info: {
          source: 'external_api',
          timestamp: new Date().toISOString(),
          cache_strategy: 'prewarm'
        }
      };
    } catch (error) {
      console.error('❌ External API fetch failed:', error);
      return {
        success: false,
        error: error.message,
        data: [],
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Generate cache key for search parameters
   */
  generateCacheKey(params) {
    const {
      query = '',
      location = '',
      employment_types = '',
      remote_jobs_only = false,
      date_posted = 'all',
      page = 1,
      num_pages = 1
    } = params;

    return `jobs:v2:query=${(query || '').toLowerCase().trim()}|location=${(location || '').toLowerCase().trim()}|employment_types=${employment_types}|remote=${remote_jobs_only}|date_posted=${date_posted}|page=${page}|num_pages=${num_pages}`;
  }

  /**
   * Prewarm cache with popular searches
   */
  async prewarmCache() {
    if (!await this.shouldPrewarm()) {
      return { success: false, reason: 'Not needed or already running' };
    }

    this.isPrewarming = true;
      console.log('🚀 Starting cache prewarm (daily interval)...');

    try {
      const results = [];
      const currentUsage = await getMonthlyCount();
      const remainingCalls = MAX_MONTHLY_CALLS - currentUsage;
      const searchesToRun = Math.min(POPULAR_SEARCHES.length, remainingCalls);

      console.log(`📊 Current usage: ${currentUsage}/${MAX_MONTHLY_CALLS}, will run ${searchesToRun} searches`);

      for (let i = 0; i < searchesToRun; i++) {
        const search = POPULAR_SEARCHES[i];
        const cacheKey = this.generateCacheKey(search);
        
        // Check if we already have fresh cache
        const cached = await getCachedValue(cacheKey, 24 * 60 * 60); // 24 hours
        if (cached.hit && cached.fresh) {
          console.log(`✅ Cache hit for: ${search.query} in ${search.location}`);
          continue;
        }

        // Fetch from API
        const result = await this.fetchFromExternalAPI(search);
        if (result.success) {
          // Cache the result for 24 hours
          await setCachedValue(cacheKey, result);
          console.log(`💾 Cached ${result.data.length} jobs for: ${search.query} in ${search.location}`);
          results.push({ search, jobsCount: result.data.length });
        } else {
          console.log(`❌ Failed to fetch: ${search.query} - ${result.error}`);
        }

        // Small delay to be nice to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.lastPrewarmTime = Date.now();
      console.log(`🎉 Prewarm completed. Cached ${results.length} searches.`);

      return {
        success: true,
        cached: results.length,
        searches: results
      };

    } catch (error) {
      console.error('❌ Prewarm failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isPrewarming = false;
    }
  }

  /**
   * Get cached jobs or serve from cache with fallback
   */
  async getJobs(params) {
    const cacheKey = this.generateCacheKey(params);
    
    // Try to get from cache first
    const cached = await getCachedValue(cacheKey, 24 * 60 * 60); // 24 hours cache
    if (cached.hit) {
      console.log(`📋 Cache hit for: ${params.query || 'all jobs'}`);
      return {
        ...cached.value,
        cache: { hit: true, fresh: cached.fresh }
      };
    }

    // Check if we can make API calls
    const { near, count } = await isNearMonthlyLimit(0.95);
    if (near) {
      console.log(`⚠️ Near API limit (${count}/${MAX_MONTHLY_CALLS}), serving stale cache if available`);
      
      // Try to get stale cache
      const staleCache = await getCachedValue(cacheKey, 7 * 24 * 60 * 60); // 7 days
      if (staleCache.hit) {
        return {
          ...staleCache.value,
          cache: { hit: true, fresh: false, stale: true },
          query_info: {
            ...staleCache.value.query_info,
            budget_guard: { count, limit: MAX_MONTHLY_CALLS, servedFromStaleCache: true }
          }
        };
      }

      // No cache available, return empty results
      return {
        success: true,
        data: [],
        total: 0,
        hasMore: false,
        query_info: {
          source: 'budget_guard',
          message: 'API limit reached, no cached data available',
          budget_guard: { count, limit: MAX_MONTHLY_CALLS }
        },
        cache: { hit: false, budgetLimited: true }
      };
    }

    // We can make API calls, fetch fresh data
    console.log(`🔄 Cache miss, fetching fresh data for: ${params.query || 'all jobs'}`);
    const result = await this.fetchFromExternalAPI(params);
    
    if (result.success) {
      // Cache the result
      await setCachedValue(cacheKey, result);
    }

    return {
      ...result,
      cache: { hit: false, fresh: true }
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const currentUsage = await getMonthlyCount();
      const { near } = await isNearMonthlyLimit();
      
      return {
        monthlyUsage: currentUsage,
        monthlyLimit: MAX_MONTHLY_CALLS,
        usagePercentage: (currentUsage / MAX_MONTHLY_CALLS) * 100,
        nearLimit: near,
        isPrewarming: this.isPrewarming,
        lastPrewarmTime: this.lastPrewarmTime
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const jobCacheManager = new JobCacheManager();
export default jobCacheManager;
