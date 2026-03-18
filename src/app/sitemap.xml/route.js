const SITE_URL = 'https://justjobs.info';

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

function toIsoDate(value, fallbackDate) {
  try {
    if (!value) return fallbackDate.toISOString();
    const d = value instanceof Date ? value : new Date(value);
    // If invalid date, fallback
    if (Number.isNaN(d.getTime())) return fallbackDate.toISOString();
    return d.toISOString();
  } catch {
    return fallbackDate.toISOString();
  }
}

function getDefaultEntries(today) {
  return [
    { loc: `${SITE_URL}/`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 1.0 },
    { loc: `${SITE_URL}/job-listing`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },
    { loc: `${SITE_URL}/about`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
    { loc: `${SITE_URL}/contact`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
  ];
}

function buildSitemapXml(entries) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const e of entries) {
    if (!e?.loc) continue;
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) lines.push(`    <lastmod>${escapeXml(e.lastmod)}</lastmod>`);
    if (e.changefreq) lines.push(`    <changefreq>${escapeXml(e.changefreq)}</changefreq>`);
    if (typeof e.priority !== 'undefined') {
      const p = Math.min(1, Math.max(0, Number(e.priority)));
      lines.push(`    <priority>${p.toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

export async function GET() {
  const today = new Date();
  let entries = [];

  try {
    const { getCollection } = await import('@/utils/mongodb');

    const sitemapCollection = await getCollection('sitemap_config');
    const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();

    if (staticPages?.length) {
      entries = staticPages.map((page) => ({
        loc: `${SITE_URL}${page.url}`,
        lastmod: toIsoDate(page.lastmod ?? page.lastmod, today),
        changefreq: page.changefreq || 'monthly',
        priority: page.priority ?? 0.5,
      }));
    } else {
      entries = getDefaultEntries(today);
    }

    // Add blogs (best-effort)
    try {
      const blogsCollection = await getCollection('blogs');
      const blogs = await blogsCollection
        .find({ status: 'published' })
        .sort({ publishedDate: -1 })
        .limit(1000)
        .toArray();

      if (blogs?.length) {
        entries.push(
          ...blogs.map((blog) => ({
            loc: `${SITE_URL}/blogs/${blog.slug}`,
            lastmod: toIsoDate(blog.publishedDate, today),
            changefreq: 'monthly',
            priority: 0.6,
          })),
        );
      }
    } catch {
      // ignore blog errors
    }
  } catch {
    entries = getDefaultEntries(today);
  }

  // Guarantee non-empty sitemap (Google dislikes empty sitemaps)
  if (!entries.length) entries = getDefaultEntries(today);

  const xml = buildSitemapXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Avoid long-lived caching so updates are picked up quickly, but allow CDN caching.
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

