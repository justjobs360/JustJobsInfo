import { NextResponse } from 'next/server';
import { getCachedValue, setCachedValue } from '@/utils/cacheService';
import { generateSalaryEstimate } from '@/utils/salaryEstimate';
import { isNearMonthlyLimit, recordUpstreamCall, getQueryCount } from '@/utils/usageService';
import { searchAdminJobs, listAdminJobs } from '@/utils/adminJobsService';

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
    const requestedNumPages = parseInt(searchParams.get('num_pages')) || 1;
    const numPages = Math.min(Math.max(requestedNumPages, 1), 5); // allow up to 5 pages per request

    // Build cache key
    const cacheKey = `jobs:v1:query=${(query || '').toLowerCase().trim()}|location=${(location || '').toLowerCase().trim()}|employment_types=${employmentTypes}|remote=${remoteJobsOnly}|date_posted=${datePosted}|page=${page}|num_pages=${numPages}`;

    // Cache policy: 12h fresh window
    // Variable TTL: popular queries get shorter TTL to refresh more often
    const baseTtlSeconds = 12 * 60 * 60; // 12h
    const queryPopularity = await getQueryCount(cacheKey);
    const isHot = queryPopularity >= 5; // heuristic threshold
    const CACHE_MAX_AGE_SECONDS = isHot ? 3 * 60 * 60 : baseTtlSeconds; // 3h for hot queries

    // Try cache first
    const cached = await getCachedValue(cacheKey, CACHE_MAX_AGE_SECONDS);
    if (cached.hit && cached.fresh) {
      // Always overlay current admin jobs so new admin listings appear immediately
      const [adminJobsMatchingCached, adminJobsFeaturedCached] = await Promise.all([
        searchAdminJobs({ query, location, limit: 50 }),
        listAdminJobs({ status: 'active', featured: true, limit: 50 })
      ]);
      const seenIdsCached = new Set();
      const adminJobsCached = [...adminJobsFeaturedCached, ...adminJobsMatchingCached].filter(j => {
        if (seenIdsCached.has(j.id)) return false;
        seenIdsCached.add(j.id);
        return true;
      });

      const normalizedAdminCached = adminJobsCached.map((j) => ({
        id: `admin_${j.id}`,
        job_title: j.title,
        company_name: j.company,
        location: j.location,
        employment_type: j.type,
        job_description: j.description,
        posted_at: j.posted_at || j.createdAt,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        is_remote: (j.location || '').toLowerCase().includes('remote'),
        company_logo: j.logo || null,
        apply_link: j.apply_link || '#',
        benefits: [],
        experience_level: 'Mid-level',
        quality_score: 'high',
        source: 'Admin',
        job_country: undefined,
        job_state: undefined,
        job_city: undefined,
        job_highlights: {},
        estimated_salaries: [],
        featured: !!j.featured
      }));

      const featuredAdminCached = normalizedAdminCached.filter(j => j.featured);
      const nonFeaturedAdminCached = normalizedAdminCached.filter(j => !j.featured);
      const externalFromCache = (cached.value.data || []).filter(item => !String(item.id).startsWith('admin_'));
      const combined = [...featuredAdminCached, ...nonFeaturedAdminCached, ...externalFromCache];

      return NextResponse.json({
        success: true,
        data: combined,
        total: combined.length,
        page: cached.value.page,
        hasMore: cached.value.hasMore,
        query_info: cached.value.query_info,
        cache: { hit: true, fresh: true }
      });
    }

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

    // Budget guard: if near monthly limit, serve cache-only when available
    const { near, count, limit } = await isNearMonthlyLimit(0.9);
    if (near && cached.hit) {
      return NextResponse.json({
        success: true,
        data: cached.value.data,
        total: cached.value.total,
        page: cached.value.page,
        hasMore: cached.value.hasMore,
        query_info: { ...cached.value.query_info, budget_guard: { count, limit, servedFromCache: true } },
        cache: { hit: true, fresh: cached.fresh }
      });
    }
    // Make request to JSearch API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': JSEARCH_API_HOST,
        'Content-Type': 'application/json',
      },
    });
    const rlLimit = response.headers.get('x-ratelimit-requests-limit');
    const rlRemaining = response.headers.get('x-ratelimit-requests-remaining');
    const rlReset = response.headers.get('x-ratelimit-requests-reset');

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = undefined;
    }

    if (!response.ok) {
      // Serve cached (fresh or stale) data if available to avoid user-facing errors
      if (cached.hit) {
        return NextResponse.json({
          success: true,
          data: cached.value.data,
          total: cached.value.total,
          page: cached.value.page,
          hasMore: cached.value.hasMore,
          query_info: { ...cached.value.query_info, rate_limit: { limit: rlLimit, remaining: rlRemaining, reset: rlReset }, upstream_error: response.status },
          cache: { hit: true, fresh: cached.fresh }
        });
      }
      console.error('JSearch API error:', response.status, response.statusText);
      throw new Error(`JSearch API error: ${response.status}`);
    }

    // Handle JSearch backend error structure per docs (status: ERROR)
    if (data && data.status && data.status !== 'OK') {
      if (cached.hit) {
        return NextResponse.json({
          success: true,
          data: cached.value.data,
          total: cached.value.total,
          page: cached.value.page,
          hasMore: cached.value.hasMore,
          query_info: { ...cached.value.query_info, rate_limit: { limit: rlLimit, remaining: rlRemaining, reset: rlReset }, upstream_error: data?.error?.code || 'ERROR', request_id: data?.request_id },
          cache: { hit: true, fresh: cached.fresh }
        });
      }
      console.error('JSearch API returned ERROR status:', data?.error?.message || 'Unknown error');
      throw new Error(`JSearch ERROR: ${data?.error?.message || 'Unknown error'}`);
    }
    // Record usage only for real upstream calls
    recordUpstreamCall(cacheKey).catch(() => {});
    console.log('JSearch API response status:', data?.status);
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
    // Normalize the job data to match our expected structure (external sources)
    const normalizedExternal = data.data.map((job, index) => {
      const normalized = {
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
      };

      // If no salary provided and no API estimated salaries, compute a local estimate
      const hasSalary = normalized.salary_min || normalized.salary_max;
      const hasApiEstimate = Array.isArray(normalized.estimated_salaries) && normalized.estimated_salaries.length > 0;
      if (!hasSalary) {
        // Prefer API estimate if available; otherwise generate local estimate
        if (hasApiEstimate) {
          const first = Array.isArray(normalized.estimated_salaries) ? normalized.estimated_salaries[0] : null;
          // Try common shapes; fallback to local estimate if unknown
          if (first && (first.min || first.max)) {
            if (first.min && !normalized.salary_min) normalized.salary_min = Math.round(first.min);
            if (first.max && !normalized.salary_max) normalized.salary_max = Math.round(first.max);
          } else {
            const est = generateSalaryEstimate(normalized.job_title, normalized.location);
            normalized.salary_estimate = est;
            normalized.salary_min = est.min_base_salary;
            normalized.salary_max = est.max_base_salary;
          }
        } else {
          const est = generateSalaryEstimate(normalized.job_title, normalized.location);
          normalized.salary_estimate = est;
          normalized.salary_min = est.min_base_salary;
          normalized.salary_max = est.max_base_salary;
        }
      }
      return normalized;
    });

    // Fetch admin jobs matching query/location (active only). Limit a reasonable amount
    // Include featured admin jobs globally plus matching admin jobs by location/query
    const [adminJobsMatching, adminJobsFeatured] = await Promise.all([
      searchAdminJobs({ query, location, limit: 50 }),
      listAdminJobs({ status: 'active', featured: true, limit: 50 })
    ]);
    const seenIds = new Set();
    const adminJobs = [...adminJobsFeatured, ...adminJobsMatching].filter(j => {
      if (seenIds.has(j.id)) return false;
      seenIds.add(j.id);
      return true;
    });
    const normalizedAdmin = adminJobs.map((j, idx) => ({
      id: `admin_${j.id}`,
      job_title: j.title,
      company_name: j.company,
      location: j.location,
      employment_type: j.type,
      job_description: j.description,
      posted_at: j.posted_at || j.createdAt,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      is_remote: (j.location || '').toLowerCase().includes('remote'),
      company_logo: j.logo || null,
      apply_link: j.apply_link || '#',
      benefits: [],
      experience_level: 'Mid-level',
      quality_score: 'high',
      source: 'Admin',
      job_country: undefined,
      job_state: undefined,
      job_city: undefined,
      job_highlights: {},
      estimated_salaries: [],
      featured: !!j.featured
    }));

    // Merge: featured admin first, then other admin, then external
    const featuredAdmin = normalizedAdmin.filter(j => j.featured);
    const nonFeaturedAdmin = normalizedAdmin.filter(j => !j.featured);
    const normalizedJobs = [...featuredAdmin, ...nonFeaturedAdmin, ...normalizedExternal];
    // Sort jobs by posted_at (most recent first)
    normalizedJobs.sort((a, b) => new Date(b.posted_at) - new Date(a.posted_at));
    // Calculate if there are more pages
    const hasMore = data.data.length > 0 && page < 10; // Limit to 10 pages max
    const payload = {
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
    };

    // Save to cache (best-effort)
    setCachedValue(cacheKey, payload).catch((e) => console.error('Cache write failed:', e));

    // If we had a stale cache, we already fetched fresh data; just return payload
    return NextResponse.json({ ...payload, cache: { hit: !!cached.hit, fresh: true } });
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