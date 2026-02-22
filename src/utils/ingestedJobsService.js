import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'justjobsdata';
const COLLECTION_NAME = 'ingested_jobs';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._ingestedJobsMongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._ingestedJobsMongoClientPromise = client.connect();
  }
  clientPromise = global._ingestedJobsMongoClientPromise;
} else {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

async function getCollection() {
  const c = await clientPromise;
  const db = c.db(DB_NAME);
  const col = db.collection(COLLECTION_NAME);
  await col.createIndex({ job_id: 1 }, { unique: true });
  await col.createIndex({ status: 1, posted_at: -1 });
  await col.createIndex({ job_title: 'text', company_name: 'text', location: 'text' });
  return col;
}

const EXPIRE_DAYS = parseInt(process.env.JOB_INGEST_EXPIRE_DAYS || '30', 10);
const PURGE_DAYS = parseInt(process.env.JOB_INGEST_PURGE_DAYS || '180', 10);

/**
 * Upsert a job into ingested_jobs by job_id
 * @param {Object} job - Normalized job object (must include job_id)
 * @returns {{ inserted: boolean }} inserted true if new, false if updated
 */
export async function upsertJob(job) {
  const col = await getCollection();
  const now = new Date();
  const postedAt = job.posted_at ? new Date(job.posted_at) : now;
  const expiresAt = new Date(postedAt);
  expiresAt.setDate(expiresAt.getDate() + EXPIRE_DAYS);

  const doc = {
    job_id: job.job_id || job.id,
    job_title: job.job_title,
    company_name: job.company_name,
    location: job.location,
    employment_type: job.employment_type,
    job_description: job.job_description,
    posted_at: postedAt,
    salary_min: job.salary_min ?? null,
    salary_max: job.salary_max ?? null,
    is_remote: !!job.is_remote,
    company_logo: job.company_logo ?? null,
    apply_link: job.apply_link || '#',
    job_highlights: job.job_highlights || {},
    job_country: job.job_country,
    job_state: job.job_state,
    job_city: job.job_city,
    status: 'active',
    source: 'JSearch',
    expires_at: expiresAt,
    ingested_at: now
  };

  const result = await col.updateOne(
    { job_id: doc.job_id },
    {
      $set: { ...doc, ingested_at: now },
      $setOnInsert: { createdAt: now }
    },
    { upsert: true }
  );

  return { inserted: result.upsertedCount === 1 };
}

/**
 * Search ingested jobs with filters
 * @param {Object} opts - query, location, employmentTypes, remoteJobsOnly, datePosted, page, limit
 * @returns {{ jobs: Array, total: number, hasMore: boolean }}
 */
export async function searchIngestedJobs({
  query = '',
  location = '',
  employmentTypes = '',
  remoteJobsOnly = false,
  datePosted = 'all',
  page = 1,
  limit = 20
} = {}) {
  const col = await getCollection();
  const filter = { status: 'active' };

  if (query && query.trim()) {
    filter.$text = { $search: query.trim().replace(/[^\w\s]/g, ' ') };
  }

  if (location && location.trim()) {
    filter.location = { $regex: new RegExp(location.trim(), 'i') };
  }

  if (employmentTypes && String(employmentTypes).trim()) {
    const typeMap = {
      FULLTIME: 'Full-time',
      PARTTIME: 'Part-time',
      CONTRACTOR: 'Contract',
      INTERN: 'Internship',
      TEMPORARY: 'Temporary'
    };
    const normalized = String(employmentTypes).split(',').map(t => typeMap[t?.trim()] || t?.trim()).filter(Boolean);
    if (normalized.length > 0) {
      filter.employment_type = { $in: normalized };
    }
  }

  if (remoteJobsOnly) {
    filter.is_remote = true;
  }

  if (datePosted && datePosted !== 'all') {
    const now = new Date();
    const cutoffs = {
      today: 1,
      '3days': 3,
      week: 7,
      month: 30
    };
    const days = cutoffs[datePosted] || 30;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - days);
    filter.posted_at = { $gte: cutoff };
  }

  const skip = (Math.max(1, page) - 1) * limit;
  const hasTextSearch = !!filter.$text;
  const options = hasTextSearch
    ? { projection: { score: { $meta: 'textScore' } } }
    : {};
  const sort = hasTextSearch
    ? { score: { $meta: 'textScore' }, posted_at: -1 }
    : { posted_at: -1 };
  const cursor = col.find(filter, options).sort(sort);

  const total = await col.countDocuments(filter);
  const items = await cursor.skip(skip).limit(limit + 1).toArray();
  const hasMore = items.length > limit;
  const jobs = items.slice(0, limit).map(d => toSearchResult(d));

  return { jobs, total, hasMore };
}

function toSearchResult(doc) {
  return {
    id: doc.job_id,
    job_id: doc.job_id,
    job_title: doc.job_title,
    company_name: doc.company_name,
    location: doc.location,
    employment_type: doc.employment_type,
    job_description: doc.job_description,
    posted_at: doc.posted_at,
    salary_min: doc.salary_min,
    salary_max: doc.salary_max,
    is_remote: doc.is_remote,
    company_logo: doc.company_logo,
    apply_link: doc.apply_link,
    job_highlights: doc.job_highlights || {},
    job_country: doc.job_country,
    job_state: doc.job_state,
    job_city: doc.job_city,
    benefits: [],
    experience_level: 'Mid-level',
    quality_score: 'medium',
    source: 'JSearch',
    estimated_salaries: []
  };
}

/**
 * Mark jobs older than EXPIRE_DAYS as expired
 */
export async function markExpired() {
  const col = await getCollection();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - EXPIRE_DAYS);
  const result = await col.updateMany(
    { status: 'active', posted_at: { $lt: cutoff } },
    { $set: { status: 'expired', expired_at: new Date() } }
  );
  return result.modifiedCount;
}

/**
 * Hard delete jobs older than PURGE_DAYS
 */
export async function purgeOld() {
  const col = await getCollection();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - PURGE_DAYS);
  const result = await col.deleteMany({ posted_at: { $lt: cutoff } });
  return result.deletedCount;
}
