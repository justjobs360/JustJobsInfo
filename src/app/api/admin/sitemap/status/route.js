import { NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/adminAuth';

export const dynamic = 'force-dynamic';
import { getDatabase } from '@/utils/mongodb';
import { getCachedSitemap } from '@/utils/sitemapGenerator';
import { ADMIN_PERMISSIONS, USER_ROLES } from '@/utils/userRoleService';

function canViewSitemapStatus(auth) {
  if (auth.role === USER_ROLES.SUPER_ADMIN) return true;
  return (auth.permissions || []).includes(ADMIN_PERMISSIONS.MANAGE_SEO);
}

export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    if (!canViewSitemapStatus(auth)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied: manage SEO required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const cached = await getCachedSitemap(db);

    if (!cached) {
      return NextResponse.json({
        success: true,
        cached: false,
        urlCount: 0,
        updatedAt: null,
      });
    }

    return NextResponse.json({
      success: true,
      cached: true,
      urlCount: cached.urlCount,
      updatedAt: cached.updatedAt ? new Date(cached.updatedAt).toISOString() : null,
      updatedBy: cached.updatedBy || null,
    });
  } catch (error) {
    console.error('Sitemap status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load sitemap status' },
      { status: 500 }
    );
  }
}
