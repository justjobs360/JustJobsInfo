import { NextResponse } from 'next/server';
import { markExpired, purgeOld } from '@/utils/ingestedJobsService';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent') || '';
    const isValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isVercelCron = userAgent.includes('vercel-cron');
    if (!isValidToken && !isVercelCron) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const markedCount = await markExpired();
    const purgedCount = await purgeOld();

    return NextResponse.json({
      ok: true,
      markedExpired: markedCount,
      purged: purgedCount
    });
  } catch (e) {
    console.error('Cleanup cron failed:', e);
    return NextResponse.json({ ok: false, error: 'Cleanup failed' }, { status: 500 });
  }
}
