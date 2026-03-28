import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-static';

/**
 * Serves the build-generated sitemap at the canonical URL /sitemap.xml.
 * Next.js 15 metadata sitemap files use /sitemap, not /sitemap.xml; a route
 * handler keeps the standard path reliable for Google Search Console.
 */
export async function GET() {
  const filePath = path.join(process.cwd(), 'public', 'sitemap.xml');
  const xml = await readFile(filePath, 'utf8');
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
