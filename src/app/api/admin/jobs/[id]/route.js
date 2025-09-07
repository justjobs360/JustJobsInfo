import { NextResponse } from 'next/server';
import { getAdminJob, updateAdminJob, deleteAdminJob } from '@/utils/adminJobsService';
import { requireAdmin } from '@/utils/adminAuth';
import { deleteCacheByPrefix } from '@/utils/cacheService';

export async function GET(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const job = await getAdminJob(params.id);
    if (!job) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, job });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to get job' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    const updates = await request.json();
    const job = await updateAdminJob(params.id, updates);
    if (!job) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    // Invalidate cached searches so edits reflect immediately
    deleteCacheByPrefix('jobs:v1:').catch(()=>{});
    return NextResponse.json({ success: true, job });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to update job' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    await deleteAdminJob(params.id);
    // Invalidate cached searches so deletion reflects immediately
    deleteCacheByPrefix('jobs:v1:').catch(()=>{});
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to delete job' }, { status: 500 });
  }
}
