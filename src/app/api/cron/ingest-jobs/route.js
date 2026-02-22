import { NextResponse } from 'next/server';
import { upsertJob } from '@/utils/ingestedJobsService';
import { normalizeJSearchJob } from '@/utils/jobNormalizer';
import { isNearMonthlyLimit, recordUpstreamCall } from '@/utils/usageService';

export const maxDuration = 300;

const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY;
const JSEARCH_API_HOST = 'jsearch.p.rapidapi.com';

const DEFAULT_SEED_QUERIES = ['developer', 'software engineer', 'marketing', 'sales', 'remote'];

function getSeedQueries() {
  try {
    const raw = process.env.JOB_INGEST_SEED_QUERIES;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('JOB_INGEST_SEED_QUERIES parse error, using defaults:', e.message);
  }
  return DEFAULT_SEED_QUERIES;
}

async function fetchJSearchPage(query, location, page = 1, numPages = 5) {
  const searchQuery = location ? `${query} in ${location}` : query;
  const params = new URLSearchParams({
    query: searchQuery,
    page: page.toString(),
    num_pages: numPages.toString()
  });
  const url = `https://${JSEARCH_API_HOST}/search?${params.toString()}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': JSEARCH_API_KEY,
      'X-RapidAPI-Host': JSEARCH_API_HOST,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) throw new Error(`JSearch API ${res.status}`);
  const data = await res.json();
  if (data?.status !== 'OK' || !Array.isArray(data.data)) return [];
  return data.data;
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent') || '';
    const isValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isVercelCron = userAgent.includes('vercel-cron');
    if (!isValidToken && !isVercelCron) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (!JSEARCH_API_KEY) {
      return NextResponse.json({ ok: false, error: 'JSEARCH_API_KEY not configured' }, { status: 500 });
    }

    const seedQueries = getSeedQueries();
    const seedLocations = ['', 'United Kingdom'];
    let ingested = 0;
    let updated = 0;
    const errors = [];
    let hitLimit = false;

    for (const query of seedQueries) {
      if (hitLimit) break;
      for (const location of seedLocations) {
        const { near } = await isNearMonthlyLimit(0.9);
        if (near) {
          console.log('Ingest: near monthly limit, stopping');
          hitLimit = true;
          break;
        }

        try {
          const jobs = await fetchJSearchPage(query, location || undefined, 1, 5);
          await recordUpstreamCall('ingest:bulk').catch(() => {});

          for (let i = 0; i < jobs.length; i++) {
            const normalized = normalizeJSearchJob(jobs[i], 1, i);
            const { inserted } = await upsertJob(normalized);
            if (inserted) ingested++;
            else updated++;
          }
        } catch (e) {
          errors.push({ query, location: location || '(none)', error: e.message });
          console.error('Ingest error:', query, location, e);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      ingested,
      updated,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    console.error('Ingest cron failed:', e);
    return NextResponse.json({ ok: false, error: 'Ingest failed' }, { status: 500 });
  }
}
