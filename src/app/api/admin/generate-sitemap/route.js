import { NextResponse } from 'next/server';
import { generateStaticSitemap } from '@/utils/generateSitemap';

export async function POST(request) {
  try {
    const result = await generateStaticSitemap({ writeToDisk: true });
    if (result.success) {
      return NextResponse.json({ success: true, message: 'Static sitemap generated', path: result.path, count: result.count });
    }

    // If writing failed, return XML so admin can download or inspect
    return NextResponse.json({ success: false, error: result.error || 'write_failed', message: result.message || 'Could not write sitemap to disk', xml: result.xml, count: result.count });
  } catch (err) {
    console.error('Error generating sitemap via admin API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  // Also support GET for convenience
  return await POST(request);
}
