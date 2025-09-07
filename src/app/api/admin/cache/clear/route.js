import { NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/adminAuth';
import { deleteAllCache } from '@/utils/cacheService';

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    await deleteAllCache();
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to clear cache' }, { status: 500 });
  }
}
