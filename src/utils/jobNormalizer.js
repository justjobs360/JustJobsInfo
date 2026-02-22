import { generateSalaryEstimate } from '@/utils/salaryEstimate';

export function formatLocation(job) {
  const parts = [];
  if (job.job_city) parts.push(job.job_city);
  if (job.job_state) parts.push(job.job_state);
  if (job.job_country && job.job_country !== 'US') parts.push(job.job_country);
  if (parts.length === 0) return job.job_location || 'Location not specified';
  return parts.join(', ');
}

export function normalizeEmploymentType(type) {
  if (!type) return 'Full-time';
  const normalized = String(type).toLowerCase();
  if (normalized.includes('full')) return 'Full-time';
  if (normalized.includes('part')) return 'Part-time';
  if (normalized.includes('contract') || normalized.includes('freelance')) return 'Contract';
  if (normalized.includes('intern')) return 'Internship';
  if (normalized.includes('temporary') || normalized.includes('temp')) return 'Temporary';
  return type;
}

export function isRemoteJob(job) {
  const title = (job.job_title || '').toLowerCase();
  const description = (job.job_description || '').toLowerCase();
  const location = (job.job_location || '').toLowerCase();
  const remoteKeywords = ['remote', 'work from home', 'telecommute', 'anywhere'];
  return remoteKeywords.some(kw => title.includes(kw) || description.includes(kw) || location.includes(kw)) || job.job_is_remote === true;
}

function extractBenefits(job) {
  const benefits = [];
  if (job.job_highlights) {
    if (job.job_highlights.Benefits) benefits.push(...job.job_highlights.Benefits);
    if (job.job_highlights.Qualifications) {
      job.job_highlights.Qualifications.forEach(qual => {
        const q = (qual || '').toLowerCase();
        if (q.includes('health') || q.includes('insurance') || q.includes('401k') || q.includes('pension') || q.includes('vacation') || q.includes('pto')) benefits.push(qual);
      });
    }
  }
  if (benefits.length === 0) {
    const d = ['Competitive Salary'];
    if (job.job_employment_type === 'FULLTIME') d.push('Health Insurance', 'Paid Time Off');
    return d;
  }
  return benefits.slice(0, 5);
}

function determineExperienceLevel(job) {
  const title = (job.job_title || '').toLowerCase();
  const desc = (job.job_description || '').toLowerCase();
  if (title.includes('senior') || title.includes('lead') || title.includes('principal') || desc.includes('5+ years') || desc.includes('senior level')) return 'Senior';
  if (title.includes('junior') || title.includes('entry') || title.includes('intern') || desc.includes('entry level') || desc.includes('0-2 years')) return 'Entry-level';
  return 'Mid-level';
}

function calculateQualityScore(job) {
  let score = 0;
  if (job.job_description && job.job_description.length > 100) score += 2;
  if (job.employer_logo) score += 1;
  if (job.job_min_salary || job.job_max_salary) score += 2;
  if (job.job_benefits && job.job_benefits.length > 0) score += 1;
  if (job.job_highlights && Object.keys(job.job_highlights).length > 0) score += 1;
  if (job.employer_name && job.employer_name !== 'Not specified') score += 1;
  const postedDate = new Date(job.job_posted_at_datetime_utc || Date.now());
  const daysSincePosted = (Date.now() - postedDate) / (1000 * 60 * 60 * 24);
  if (daysSincePosted <= 7) score += 2;
  else if (daysSincePosted <= 30) score += 1;
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

/**
 * Normalize a JSearch API job object to our standard format (for ingest and display)
 */
export function normalizeJSearchJob(job, page = 1, index = 0) {
  const normalized = {
    job_id: job.job_id || `job_${page}_${index}`,
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
    job_country: job.job_country,
    job_state: job.job_state,
    job_city: job.job_city,
    job_highlights: job.job_highlights || {},
    estimated_salaries: job.estimated_salaries || []
  };

  const hasSalary = normalized.salary_min || normalized.salary_max;
  const hasApiEstimate = Array.isArray(normalized.estimated_salaries) && normalized.estimated_salaries.length > 0;
  if (!hasSalary) {
    if (hasApiEstimate) {
      const first = normalized.estimated_salaries[0];
      if (first && (first.min || first.max)) {
        if (first.min && !normalized.salary_min) normalized.salary_min = Math.round(first.min);
        if (first.max && !normalized.salary_max) normalized.salary_max = Math.round(first.max);
      } else {
        const est = generateSalaryEstimate(normalized.job_title, normalized.location);
        normalized.salary_min = est.min_base_salary;
        normalized.salary_max = est.max_base_salary;
      }
    } else {
      const est = generateSalaryEstimate(normalized.job_title, normalized.location);
      normalized.salary_min = est.min_base_salary;
      normalized.salary_max = est.max_base_salary;
    }
  }
  return normalized;
}
