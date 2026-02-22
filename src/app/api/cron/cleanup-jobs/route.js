import { NextResponse } from 'next/server';
import { markExpired, purgeOld } from '@/utils/ingestedJobsService';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
