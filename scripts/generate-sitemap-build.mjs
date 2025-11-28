import { MongoClient } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'resumeCollection';
const SITE_URL = 'https://justjobs.info';

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

async function writeSitemap(entries) {
    // Build XML
    console.log('🔨 Building sitemap XML...');
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

    // Write to public directory
    const publicDir = path.join(__dirname, '..', 'public');
    const outPath = path.join(publicDir, 'sitemap.xml');

    console.log('💾 Writing sitemap to:', outPath);
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(outPath, xml, 'utf8');

    console.log(`✅ Sitemap generated successfully with ${entries.length} URLs`);
    console.log(`📍 Location: ${outPath}`);
}

async function generateSitemap() {
    console.log('🗺️  Starting sitemap generation...');

    if (!MONGODB_URI) {
        console.warn('⚠️  MONGODB_URI environment variable is not set');
        console.warn('⚠️  Generating sitemap with default pages only');

        // Generate a basic sitemap without database connection
        const today = new Date();
        const entries = [
            { loc: `${SITE_URL}/`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 1.0 },
            { loc: `${SITE_URL}/about`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/contact`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
        ];

        await writeSitemap(entries);
        return;
    }

    let client;

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);

        const today = new Date();
        let entries = [];

        // Fetch static pages from sitemap_config collection
        try {
            console.log('📄 Fetching static pages...');
            const sitemapCollection = db.collection('sitemap_config');
            const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();

            if (staticPages.length > 0) {
                entries = staticPages.map(page => ({
                    loc: `${SITE_URL}${page.url}`,
                    lastmod: page.lastmod ? new Date(page.lastmod).toISOString() : today.toISOString(),
                    changefreq: page.changefreq || 'monthly',
                    priority: parseFloat(page.priority) || 0.5
                }));
                console.log(`✅ Found ${staticPages.length} static pages`);
            } else {
                // Fallback to default pages if collection is empty
                console.log('⚠️  No static pages found, using defaults');
                entries = [
                    { loc: `${SITE_URL}/`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 1.0 },
                    { loc: `${SITE_URL}/about`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
                    { loc: `${SITE_URL}/contact`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
                ];
            }
        } catch (err) {
            console.warn('⚠️  Error fetching static pages:', err.message);
            // Continue with empty entries
        }

        // Fetch blog posts
        try {
            console.log('📝 Fetching blog posts...');
            const blogsCollection = db.collection('blogs');
            const blogs = await blogsCollection
                .find({ status: 'published' })
                .sort({ publishedDate: -1 })
                .limit(1000)
                .toArray();

            if (blogs && blogs.length > 0) {
                const blogEntries = blogs.map(blog => ({
                    loc: `${SITE_URL}/blogs/${blog.slug}`,
                    lastmod: blog.publishedDate ? new Date(blog.publishedDate).toISOString() : today.toISOString(),
                    changefreq: 'monthly',
                    priority: 0.6
                }));
                entries = [...entries, ...blogEntries];
                console.log(`✅ Found ${blogs.length} blog posts`);
            }
        } catch (err) {
            console.warn('⚠️  Error fetching blogs:', err.message);
            // Continue without blog entries
        }

        await writeSitemap(entries);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 MongoDB connection closed');
        }
    }
}

// Run the script
generateSitemap();
