import { NextResponse } from 'next/server';

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

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
    const numPages = 1; // Keep it to 1 page per request for performance

    // Build JSearch API URL
    const baseUrl = `https://${JSEARCH_API_HOST}/search`;
    const params = new URLSearchParams({
      query: location ? `${query} in ${location}` : query,
      page: page.toString(),
      num_pages: numPages.toString(),
    });
    // Add employment types filter if specified
    if (employmentTypes) {
      params.append('employment_types', employmentTypes);
    }
    // Add remote jobs filter if specified
    if (remoteJobsOnly) {
      params.append('remote_jobs_only', 'true');
    }
    // Add date posted filter if specified
    if (datePosted && datePosted !== 'all') {
      params.append('date_posted', datePosted);
    }
    const apiUrl = `${baseUrl}?${params.toString()}`;
    console.log('Fetching jobs from:', apiUrl);
    // Make request to JSearch API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': JSEARCH_API_HOST,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('JSearch API error:', response.status, response.statusText);
      throw new Error(`JSearch API error: ${response.status}`);
    }
    const data = await response.json();
    console.log('JSearch API response status:', data.status);
    console.log('Jobs found:', data.data?.length || 0);
    if (!data.data || !Array.isArray(data.data)) {
      console.warn('No jobs data received from API');
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        page: page,
        hasMore: false
      });
    }
    // Normalize the job data to match our expected structure
    const normalizedJobs = data.data.map((job, index) => ({
      id: job.job_id || `job_${page}_${index}`,
      job_title: job.job_title || 'No title available',
      company_name: job.employer_name || 'Company not specified',
      location: formatLocation(job),
      employment_type: normalizeEmploymentType(job.job_employment_type),
      job_description: job.job_description || job.job_excerpt || 'No description available',
      posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      is_remote: isRemoteJob(job),
      company_logo: job.employer_logo,
      apply_link: job.job_apply_link || '#',
      benefits: extractBenefits(job),
      experience_level: determineExperienceLevel(job),
      quality_score: calculateQualityScore(job),
      source: 'JSearch',
      job_country: job.job_country,
      job_state: job.job_state,
      job_city: job.job_city,
      job_highlights: job.job_highlights || {},
      estimated_salaries: job.estimated_salaries || []
    }));
    // Sort jobs by posted_at (most recent first)
    normalizedJobs.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
    // Calculate if there are more pages
    const hasMore = data.data.length > 0 && page < 10; // Limit to 10 pages max
    return NextResponse.json({
      success: true,
      data: normalizedJobs,
      total: normalizedJobs.length,
      page: page,
      hasMore: hasMore,
      query_info: {
        original_query: query,
        location: location,
        filters_applied: {
          employment_types: employmentTypes,
          remote_only: remoteJobsOnly,
          date_posted: datePosted
        }
      }
    });
  } catch (error) {
    console.error('Job search API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unable to fetch jobs at this time. Please try again later.',
      debug_info: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

// Helper functions

function formatLocation(job) {
  const parts = [];
  
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country && job.job_country !== 'US') parts.push(job.job_country);
  
  if (parts.length === 0) {
    return job.job_location || 'Location not specified';
  }
  
  return parts.join(', ');
}

function normalizeEmploymentType(type) {
  if (!type) return 'Full-time';
  
  const normalized = type.toLowerCase();
  if (normalized.includes('full')) return 'Full-time';
  if (normalized.includes('part')) return 'Part-time';
  if (normalized.includes('contract') || normalized.includes('freelance')) return 'Contract';
  if (normalized.includes('intern')) return 'Internship';
  if (normalized.includes('temporary') || normalized.includes('temp')) return 'Temporary';
  
  return type; // Return original if no match
}

function isRemoteJob(job) {
  const title = (job.job_title || '').toLowerCase();
  const description = (job.job_description || '').toLowerCase();
  const location = (job.job_location || '').toLowerCase();
  
  const remoteKeywords = ['remote', 'work from home', 'telecommute', 'anywhere'];
  
  return remoteKeywords.some(keyword => 
    title.includes(keyword) || 
    description.includes(keyword) || 
    location.includes(keyword)
  ) || job.job_is_remote === true;
}

function extractBenefits(job) {
  const benefits = [];
  
  // Check job highlights for benefits
  if (job.job_highlights) {
    if (job.job_highlights.Benefits) {
      benefits.push(...job.job_highlights.Benefits);
    }
    if (job.job_highlights.Qualifications) {
      // Sometimes benefits are listed in qualifications
      const qualifications = job.job_highlights.Qualifications;
      qualifications.forEach(qual => {
        if (qual.toLowerCase().includes('health') || 
            qual.toLowerCase().includes('insurance') ||
            qual.toLowerCase().includes('401k') ||
            qual.toLowerCase().includes('pension') ||
            qual.toLowerCase().includes('vacation') ||
            qual.toLowerCase().includes('pto')) {
          benefits.push(qual);
        }
      });
    }
  }
  
  // Default benefits if none found
  if (benefits.length === 0) {
    const defaultBenefits = ['Competitive Salary'];
    if (job.job_employment_type === 'FULLTIME') {
      defaultBenefits.push('Health Insurance', 'Paid Time Off');
    }
    return defaultBenefits;
  }
  
  return benefits.slice(0, 5); // Limit to 5 benefits
}

function determineExperienceLevel(job) {
  const title = (job.job_title || '').toLowerCase();
  const description = (job.job_description || '').toLowerCase();
  
  if (title.includes('senior') || title.includes('lead') || title.includes('principal') || 
      description.includes('5+ years') || description.includes('senior level')) {
    return 'Senior';
  }
  
  if (title.includes('junior') || title.includes('entry') || title.includes('intern') ||
      description.includes('entry level') || description.includes('0-2 years')) {
    return 'Entry-level';
  }
  
  return 'Mid-level';
}

function calculateQualityScore(job) {
  let score = 0;
  
  // Check for complete information
  if (job.job_description && job.job_description.length > 100) score += 2;
  if (job.employer_logo) score += 1;
  if (job.job_min_salary || job.job_max_salary) score += 2;
  if (job.job_benefits && job.job_benefits.length > 0) score += 1;
  if (job.job_highlights && Object.keys(job.job_highlights).length > 0) score += 1;
  if (job.employer_name && job.employer_name !== 'Not specified') score += 1;
  
  // Score based on posting date (newer = better)
  const postedDate = new Date(job.job_posted_at_datetime_utc);
  const now = new Date();
  const daysSincePosted = (now - postedDate) / (1000 * 60 * 60 * 24);
  
  if (daysSincePosted <= 7) score += 2;
  else if (daysSincePosted <= 30) score += 1;
  
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
} 