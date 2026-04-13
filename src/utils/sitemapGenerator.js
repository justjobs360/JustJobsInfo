/**
 * Shared sitemap generation: static routes + published blogs, XML build, Mongo cache.
 * Used by prebuild script (dynamic import), admin API, and public /sitemap.xml route.
 */

import { BLOG_COLLECTION } from './blogConstants.js';

export const SITEMAP_CACHE_COLLECTION = 'sitemap_cache';

export const SITEMAP_RESPONSE_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=0, must-revalidate, no-cache',
};

const CANONICAL_SITEMAP_ORIGIN = 'https://www.justjobs.info';

/**
 * Sitemap <loc> values must match the indexed canonical host (HTTPS www).
 * If NEXT_PUBLIC_SITE_URL is apex or http, normalize so Google does not get
 * sitemap URLs that only exist as redirects.
 */
export function getSiteUrl() {
  const fallback = CANONICAL_SITEMAP_ORIGIN;
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '').trim();
  if (!raw) return fallback;
  try {
    const u = new URL(raw);
    if (u.hostname === 'justjobs.info' || u.hostname === 'www.justjobs.info') {
      return CANONICAL_SITEMAP_ORIGIN;
    }
    return raw;
  } catch {
    return fallback;
  }
}

function toValidIsoLastmod(raw, fallbackDate) {
  if (raw == null || raw === '') return fallbackDate.toISOString();
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return fallbackDate.toISOString();
  return d.toISOString();
}

export function escapeXml(unsafe) {
  if (!unsafe) return '';
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

export function entriesToXml(entries) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const e of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(e.loc)}</loc>`);
    if (e.lastmod) {
      lines.push(`    <lastmod>${escapeXml(new Date(e.lastmod).toISOString())}</lastmod>`);
    }
    if (e.changefreq) {
      lines.push(`    <changefreq>${escapeXml(e.changefreq)}</changefreq>`);
    }
    if (typeof e.priority !== 'undefined') {
      lines.push(`    <priority>${Number(e.priority).toFixed(1)}</priority>`);
    }
    lines.push('  </url>');
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

/**
 * @param {string} siteUrl
 * @param {Date} [today]
 * @returns {Array<{loc:string,lastmod?:string,changefreq?:string,priority?:number}>}
 */
export function getStaticSitemapEntries(siteUrl, today = new Date()) {
  const base = siteUrl.replace(/\/$/, '');
  const t = today.toISOString();

  return [
    { loc: `${base}/`, lastmod: t, changefreq: 'weekly', priority: 1.0 },
    { loc: `${base}/job-listing`, lastmod: t, changefreq: 'weekly', priority: 0.9 },
    { loc: `${base}/blogs`, lastmod: t, changefreq: 'daily', priority: 0.7 },

    { loc: `${base}/about`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/career`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/contact`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/faq`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/privacy-policy`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/terms-of-use`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/cookies-policy`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/refund-policy`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/advertising-disclosure`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
  ];
}

/**
 * @param {import('mongodb').Db} db
 * @param {string} [siteUrl]
 */
export async function collectSitemapEntries(db, siteUrl) {
  const base = (siteUrl || getSiteUrl()).replace(/\/$/, '');
  const today = new Date();
  let entries = getStaticSitemapEntries(base, today);

  const collectionName =
    typeof BLOG_COLLECTION === 'string' && BLOG_COLLECTION
      ? BLOG_COLLECTION
      : 'Blogs';

  try {
    const blogsCollection = db.collection(collectionName);
    // Include published and legacy docs with no status; exclude draft/archived only.
    const blogs = await blogsCollection
      .find({
        $or: [
          { status: 'published' },
          { status: { $exists: false } },
          { status: null },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    const blogEntries = [];
    for (const blog of blogs) {
      const slug = blog.slug != null ? String(blog.slug).trim() : '';
      if (!slug) continue;
      const raw = blog.publishedDate ?? blog.updatedAt ?? blog.createdAt ?? today;
      const lastmod = toValidIsoLastmod(raw, today);
      blogEntries.push({
        loc: `${base}/blogs/${slug}`,
        lastmod,
        changefreq: 'monthly',
        priority: 0.6,
      });
    }
    if (blogEntries.length > 0) {
      entries = [...entries, ...blogEntries];
    }
  } catch (err) {
    console.error('Sitemap: error fetching blogs:', err?.message || err, err?.stack);
  }

  return entries;
}

/**
 * @param {import('mongodb').Db} db
 * @param {{ updatedBy?: string }} [opts]
 */
export async function buildAndCacheSitemap(db, opts = {}) {
  const entries = await collectSitemapEntries(db);
  const xml = entriesToXml(entries);
  const urlCount = entries.length;
  const updatedAt = new Date();
  const col = db.collection(SITEMAP_CACHE_COLLECTION);

  await col.updateOne(
    {},
    {
      $set: {
        xml,
        urlCount,
        updatedAt,
        ...(opts.updatedBy ? { updatedBy: opts.updatedBy } : {}),
      },
      $setOnInsert: { createdAt: updatedAt },
    },
    { upsert: true }
  );

  return { xml, urlCount, updatedAt };
}

/**
 * @param {import('mongodb').Db} db
 * @returns {Promise<{ xml: string, urlCount: number, updatedAt: Date, updatedBy?: string } | null>}
 */
export async function getCachedSitemap(db) {
  const doc = await db.collection(SITEMAP_CACHE_COLLECTION).findOne({});
  if (!doc?.xml) return null;
  return {
    xml: doc.xml,
    urlCount: doc.urlCount ?? 0,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
  };
}
