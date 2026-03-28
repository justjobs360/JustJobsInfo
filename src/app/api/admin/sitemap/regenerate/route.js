import { NextResponse } from 'next/server';
import { requireAdmin } from '@/utils/adminAuth';

export const dynamic = 'force-dynamic';
import { getDatabase } from '@/utils/mongodb';
import { buildAndCacheSitemap } from '@/utils/sitemapGenerator';
import { ADMIN_PERMISSIONS, USER_ROLES } from '@/utils/userRoleService';

function canRegenerateSitemap(auth) {
  if (auth.role === USER_ROLES.SUPER_ADMIN) return true;
  return (auth.permissions || []).includes(ADMIN_PERMISSIONS.MANAGE_SEO);
}

export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
    }
    if (!canRegenerateSitemap(auth)) {
      return NextResponse.json(
        { success: false, error: 'Permission denied: manage SEO required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const { xml, urlCount, updatedAt } = await buildAndCacheSitemap(db, {
      updatedBy: auth.uid,
    });

    return NextResponse.json({
      success: true,
      urlCount,
      updatedAt: updatedAt.toISOString(),
      xmlLength: xml.length,
    });
  } catch (error) {
    console.error('Sitemap regenerate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
}
