import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const userAgent = request.headers.get('user-agent') || '';
    const isValidToken = authHeader === `Bearer ${process.env.CRON_SECRET}`;
    const isVercelCron = userAgent.includes('vercel-cron');
    if (!isValidToken && !isVercelCron) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch(`${request.nextUrl.origin}/api/job-alerts/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testMode: false, dryRun: false, maxUsers: 100 })
    });

    const data = await res.json();
    return NextResponse.json({ ok: true, result: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Cron job failed' }, { status: 500 });
  }
}
