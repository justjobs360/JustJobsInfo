import { NextResponse } from 'next/server';
import { generateSalaryEstimate } from '@/utils/salaryEstimate';
import { searchAdminJobs, listAdminJobs } from '@/utils/adminJobsService';
import { jobCacheManager } from '@/utils/jobCacheManager';

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;

export async function GET(request) {
  try {
    // Check if API key is configured
    if (!JSEARCH_API_KEY) {
      console.error('JSEARCH_API_KEY is not configured');
      return NextResponse.json({
        success: false,
        error: 'API configuration error. Please contact support.'
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    // Extract search parameters
    const query = searchParams.get('query') || '';
    const location = searchParams.get('location') || '';
    const employmentTypes = searchParams.get('employment_types') || '';
    const remoteJobsOnly = searchParams.get('remote_jobs_only') === 'true';
    const datePosted = searchParams.get('date_posted') || 'all';
    const page = parseInt(searchParams.get('page')) || 1;
    const requestedNumPages = parseInt(searchParams.get('num_pages')) || 1;
    const numPages = Math.min(Math.max(requestedNumPages, 1), 5); // allow up to 5 pages per request

    // Build search parameters object
    const searchParamsObj = {
      query,
      location,
      employment_types: employmentTypes,
      remote_jobs_only: remoteJobsOnly,
      date_posted: datePosted,
      page,
      num_pages: numPages
    };

    console.log('🔍 Job search request:', searchParamsObj);

    // Get admin jobs first (these are always fresh from our database)
    const [adminJobsMatching, adminJobsFeatured] = await Promise.all([
      searchAdminJobs({ query, location, limit: 50 }),
      listAdminJobs({ status: 'active', featured: true, limit: 50 })
    ]);

    // Combine and deduplicate admin jobs
    const seenIds = new Set();
    const adminJobs = [...adminJobsFeatured, ...adminJobsMatching].filter(job => {
      if (seenIds.has(job.id)) return false;
      seenIds.add(job.id);
      return true;
    });

    // Get external jobs from cache manager
    const externalJobsResult = await jobCacheManager.getJobs(searchParamsObj);
    
    if (!externalJobsResult.success) {
      console.error('❌ Failed to get external jobs:', externalJobsResult.error);
      
      // Return only admin jobs if external API fails
      return NextResponse.json({
        success: true,
        data: adminJobs,
        total: adminJobs.length,
        page: 1,
        hasMore: false,
        query_info: {
          source: 'admin_only',
          external_api_error: externalJobsResult.error,
          timestamp: new Date().toISOString()
        },
        cache: { hit: false, externalApiFailed: true }
      });
    }

    // Combine admin jobs with external jobs
    const externalJobs = externalJobsResult.data || [];
    const combinedJobs = [...adminJobs, ...externalJobs];

    // Add salary estimates to jobs that don't have them
    const jobsWithSalaries = await Promise.all(
      combinedJobs.map(async (job) => {
        if (!job.salary || !job.salary.min || !job.salary.max) {
          try {
            const salaryEstimate = await generateSalaryEstimate(job.title, job.location);
            if (salaryEstimate.success) {
              return {
                ...job,
                salary: {
                  ...job.salary,
                  min: job.salary?.min || salaryEstimate.data.min,
                  max: job.salary?.max || salaryEstimate.data.max,
                  currency: job.salary?.currency || salaryEstimate.data.currency,
                  period: job.salary?.period || salaryEstimate.data.period,
                  estimated: true
                }
              };
            }
          } catch (error) {
            console.log('Salary estimation failed for job:', job.title, error.message);
          }
        }
        return job;
      })
    );

    // Sort jobs: featured admin jobs first, then by date posted
    jobsWithSalaries.sort((a, b) => {
      // Featured admin jobs first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by date posted (newest first)
      const dateA = new Date(a.date_posted || a.createdAt || 0);
      const dateB = new Date(b.date_posted || b.createdAt || 0);
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      data: jobsWithSalaries,
      total: jobsWithSalaries.length,
      page: page,
      hasMore: externalJobsResult.hasMore || false,
      query_info: {
        ...externalJobsResult.query_info,
        admin_jobs_count: adminJobs.length,
        external_jobs_count: externalJobs.length,
        combined_count: jobsWithSalaries.length
      },
      cache: externalJobsResult.cache
    });

  } catch (error) {
    console.error('❌ Job search API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    }, { status: 500 });
  }
}