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

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    'https://www.justjobs.info'
  );
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

    { loc: `${base}/job-alerts`, lastmod: t, changefreq: 'weekly', priority: 0.9 },
    { loc: `${base}/job-fit`, lastmod: t, changefreq: 'weekly', priority: 0.9 },
    { loc: `${base}/job-listing`, lastmod: t, changefreq: 'weekly', priority: 0.9 },
    { loc: `${base}/resume-audit`, lastmod: t, changefreq: 'weekly', priority: 0.9 },
    { loc: `${base}/resume-builder`, lastmod: t, changefreq: 'weekly', priority: 0.9 },

    ...Array.from({ length: 15 }, (_, i) => i + 1).map((n) => ({
      loc: `${base}/resume-builder/template/${n}`,
      lastmod: t,
      changefreq: 'weekly',
      priority: 0.9,
    })),

    { loc: `${base}/service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/service-single`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/ai-learning-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/cyber-security-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/development-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/it-consulting-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/management-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },
    { loc: `${base}/technologies-service`, lastmod: t, changefreq: 'monthly', priority: 0.8 },

    { loc: `${base}/blogs`, lastmod: t, changefreq: 'daily', priority: 0.7 },
    { loc: `${base}/blog-list`, lastmod: t, changefreq: 'daily', priority: 0.7 },
    { loc: `${base}/blog-grid-two`, lastmod: t, changefreq: 'daily', priority: 0.7 },
    { loc: `${base}/blog-grid-four`, lastmod: t, changefreq: 'daily', priority: 0.7 },
    { loc: `${base}/blog-masonry`, lastmod: t, changefreq: 'daily', priority: 0.7 },

    { loc: `${base}/about`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/contact`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/privacy-policy`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/terms-of-use`, lastmod: t, changefreq: 'yearly', priority: 0.5 },
    { loc: `${base}/cookies-policy`, lastmod: t, changefreq: 'yearly', priority: 0.5 },

    { loc: `${base}/faq`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/important-links`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/downloadable-resources`, lastmod: t, changefreq: 'monthly', priority: 0.5 },

    { loc: `${base}/apply`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/askgenie`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/award`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/career`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/career-single`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/case-studies`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/case-studies-single`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/free-consultation`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/partner`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/team`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/team-single`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/travel-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/logistic-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/construction-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/ecommerce-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/fintech-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/healthcare-industry`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/it-innovations`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/it-strategies`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
    { loc: `${base}/why-choose-us`, lastmod: t, changefreq: 'monthly', priority: 0.5 },
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

  try {
    const blogsCollection = db.collection(BLOG_COLLECTION);
    const blogs = await blogsCollection
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(1000)
      .toArray();

    if (blogs?.length > 0) {
      const blogEntries = blogs.map((blog) => {
        const raw =
          blog.publishedDate ?? blog.updatedAt ?? blog.createdAt ?? today;
        const lastmod = new Date(raw).toISOString();
        return {
          loc: `${base}/blogs/${blog.slug}`,
          lastmod,
          changefreq: 'monthly',
          priority: 0.6,
        };
      });
      entries = [...entries, ...blogEntries];
    }
  } catch (err) {
    console.warn('Sitemap: error fetching blogs:', err.message);
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
