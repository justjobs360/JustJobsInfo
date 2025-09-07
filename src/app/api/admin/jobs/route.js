import { NextResponse } from 'next/server';
import { createAdminJob, listAdminJobs } from '@/utils/adminJobsService';
import { requireAdmin } from '@/utils/adminAuth';
import { deleteCacheByPrefix } from '@/utils/cacheService';

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    const jobs = await listAdminJobs({ status, featured: featured === null ? undefined : featured === 'true', limit, skip });
    return NextResponse.json({ success: true, jobs });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to list jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const body = await request.json();
    const job = await createAdminJob(body);
    // Invalidate cached job searches so new admin jobs appear immediately
    deleteCacheByPrefix('jobs:v1:').catch(()=>{});
    return NextResponse.json({ success: true, job });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to create job' }, { status: 500 });
  }
}
