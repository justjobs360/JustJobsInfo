import fs from 'fs/promises';
import path from 'path';
import { getCollection } from './mongodb.js';

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'\"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}

export async function generateStaticSitemap({ writeToDisk = true } = {}) {
  const siteUrl = 'https://justjobs.info';
  const today = new Date();

  try {
    const sitemapCollection = await getCollection('sitemap_config');
    const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();

    let entries = [];

    if (staticPages.length > 0) {
      entries = staticPages.map(page => ({
        loc: `${siteUrl}${page.url}`,
        lastmod: page.lastmod ? new Date(page.lastmod).toISOString() : today.toISOString(),
        changefreq: page.changefreq || 'monthly',
        priority: parseFloat(page.priority) || 0.5
      }));
    } else {
      entries = [
        { loc: `${siteUrl}/`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 1.0 },
        { loc: `${siteUrl}/about`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
        { loc: `${siteUrl}/contact`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
      ];
    }

    // Add blog posts
    try {
      const blogsCollection = await getCollection('blogs');
      const blogs = await blogsCollection.find({ status: 'published' }).sort({ publishedDate: -1 }).limit(1000).toArray();
      if (blogs && blogs.length > 0) {
        const blogEntries = blogs.map(blog => ({
          loc: `${siteUrl}/blogs/${blog.slug}`,
          lastmod: blog.publishedDate ? new Date(blog.publishedDate).toISOString() : today.toISOString(),
          changefreq: 'monthly',
          priority: 0.6
        }));
        entries = [...entries, ...blogEntries];
      }
    } catch (e) {
      // ignore blog collection errors and continue with static entries
      console.warn('generateStaticSitemap: failed to add blogs', e);
    }

    // Build XML
    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

    for (const e of entries) {
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(e.loc)}</loc>`);
      if (e.lastmod) lines.push(`    <lastmod>${escapeXml(new Date(e.lastmod).toISOString())}</lastmod>`);
      if (e.changefreq) lines.push(`    <changefreq>${escapeXml(e.changefreq)}</changefreq>`);
      if (typeof e.priority !== 'undefined') lines.push(`    <priority>${Number(e.priority).toFixed(1)}</priority>`);
      lines.push('  </url>');
    }

    lines.push('</urlset>');

    const xml = lines.join('\n');

    if (writeToDisk) {
      // Check if we're in a serverless/read-only environment
      const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;
      
      if (isServerless) {
        // In serverless, we can't write to disk during runtime
        // Return XML for API response instead
        console.log('⚠️ Serverless environment detected - cannot write to disk at runtime');
        return { 
          success: true, 
          xml, 
          count: entries.length, 
          warning: 'Serverless environment - sitemap must be generated at build time'
        };
      }
      
      const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');
      try {
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, xml, 'utf8');
        console.log('✅ Sitemap written to disk:', outPath);
        return { success: true, path: outPath, count: entries.length };
      } catch (writeErr) {
        // Writing may fail in some hosts (e.g., serverless readonly). Return XML instead.
        console.warn('⚠️ Failed to write sitemap to disk:', writeErr.message);
        return { success: true, xml, count: entries.length, warning: writeErr.message };
      }
    }

    return { success: true, xml, count: entries.length };
  } catch (err) {
    console.error('generateStaticSitemap error:', err);
    return { success: false, error: err.message };
  }
}

export default generateStaticSitemap;
