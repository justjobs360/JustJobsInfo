export async function fetchCombinedJobsForSubscriber(origin, subscriber, limit = 20) {
  const params = new URLSearchParams();
  // Keywords: join by space; use first two to keep query compact
  const query = (subscriber.keywords || []).slice(0, 2).join(' ');
  if (query) params.set('query', query);
  // Location: take first preferred location if provided
  const location = (subscriber.locations || [])[0] || '';
  if (location) params.set('location', location);
  if (subscriber.remoteOnly) params.set('remote_jobs_only', 'true');
  // Employment type map to API values if possible
  const mapType = (t) => {
    const s = (t || '').toLowerCase();
    if (s.includes('full')) return 'FULLTIME';
    if (s.includes('part')) return 'PARTTIME';
    if (s.includes('contract')) return 'CONTRACTOR';
    if (s.includes('intern')) return 'INTERN';
    return '';
  };
  const types = (subscriber.employmentTypes || []).map(mapType).filter(Boolean);
  if (types.length) params.set('employment_types', types.join(','));
  // Use up to 3 pages for more results; caching will minimize upstream calls
  params.set('page', '1');
  params.set('num_pages', '3');

  const url = `${origin}/api/jobs/search?${params.toString()}`;
  const res = await fetch(url, { method: 'GET' });
  const data = await res.json();
  if (!data?.success) return [];
  const jobs = Array.isArray(data.data) ? data.data : [];
  return jobs.slice(0, limit);
}
