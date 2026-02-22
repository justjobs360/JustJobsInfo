import { NextResponse } from 'next/server';
import { getPopularQueries } from '@/utils/usageService';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent') || '';
    const isValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isVercelCron = userAgent.includes('vercel-cron');
    if (!isValidToken && !isVercelCron) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const popularKeys = await getPopularQueries(5, 1);
    let warmed = 0;

    for (const key of popularKeys) {
      try {
        // Keys look like: jobs:v1:query=...|location=...|employment_types=...|remote=...|date_posted=...|page=...|num_pages=...
        const params = new URLSearchParams();
        const parts = key.split('|');
        for (const part of parts) {
          const [k, v] = part.split('=');
          if (!k || v === undefined) continue;
          switch (k) {
            case 'jobs:v1:query':
            case 'query':
              params.set('query', decodeURIComponent(v));
              break;
            case 'location':
              params.set('location', decodeURIComponent(v));
              break;
            case 'employment_types':
              if (v) params.set('employment_types', v);
              break;
            case 'remote':
              if (v) params.set('remote_jobs_only', v);
              break;
            case 'date_posted':
              if (v) params.set('date_posted', v);
              break;
            case 'page':
              params.set('page', v);
              break;
            case 'num_pages':
              params.set('num_pages', v);
              break;
          }
        }

        const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/jobs/search?${params.toString()}`;
        await fetch(url, { method: 'GET' });
        warmed++;
      } catch (e) {
        // Continue warming other keys
      }
    }

    return NextResponse.json({ ok: true, warmed, total: popularKeys.length });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Prewarm failed' }, { status: 500 });
  }
}
