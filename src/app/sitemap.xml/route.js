import { getDatabase } from '@/utils/mongodb';
import {
  buildAndCacheSitemap,
  getCachedSitemap,
  SITEMAP_RESPONSE_HEADERS,
} from '@/utils/sitemapGenerator';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase();
    let cached = await getCachedSitemap(db);
    if (!cached?.xml) {
      await buildAndCacheSitemap(db);
      cached = await getCachedSitemap(db);
    }
    if (!cached?.xml) {
      return new Response('Sitemap temporarily unavailable', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new Response(cached.xml, {
      status: 200,
      headers: SITEMAP_RESPONSE_HEADERS,
    });
  } catch (error) {
    console.error('GET /sitemap.xml error:', error);
    return new Response('Sitemap error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
