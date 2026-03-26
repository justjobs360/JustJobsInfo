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
const SITE_URL = 'https://www.justjobs.info';

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
        // Static sitemap pages (single source of truth; no DB-managed sitemap config).
        // This avoids intermittent runtime errors and keeps /sitemap.xml stable on Vercel.
        let entries = [
            { loc: `${SITE_URL}/`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 1.0 },

            // Core product pages
            { loc: `${SITE_URL}/job-alerts`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/job-fit`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/job-listing`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/resume-audit`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },
            { loc: `${SITE_URL}/resume-builder`, lastmod: today.toISOString(), changefreq: 'weekly', priority: 0.9 },

            // Resume templates (static routes)
            ...Array.from({ length: 15 }, (_, i) => i + 1).map((n) => ({
                loc: `${SITE_URL}/resume-builder/template/${n}`,
                lastmod: today.toISOString(),
                changefreq: 'weekly',
                priority: 0.9
            })),

            // Services
            { loc: `${SITE_URL}/service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/service-single`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/ai-learning-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/cyber-security-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/development-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/it-consulting-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/management-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },
            { loc: `${SITE_URL}/technologies-service`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.8 },

            // Blog hubs
            { loc: `${SITE_URL}/blogs`, lastmod: today.toISOString(), changefreq: 'daily', priority: 0.7 },
            { loc: `${SITE_URL}/blog-list`, lastmod: today.toISOString(), changefreq: 'daily', priority: 0.7 },
            { loc: `${SITE_URL}/blog-grid-two`, lastmod: today.toISOString(), changefreq: 'daily', priority: 0.7 },
            { loc: `${SITE_URL}/blog-grid-four`, lastmod: today.toISOString(), changefreq: 'daily', priority: 0.7 },
            { loc: `${SITE_URL}/blog-masonry`, lastmod: today.toISOString(), changefreq: 'daily', priority: 0.7 },

            // Company & legal
            { loc: `${SITE_URL}/about`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/contact`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/privacy-policy`, lastmod: today.toISOString(), changefreq: 'yearly', priority: 0.5 },
            { loc: `${SITE_URL}/terms-of-use`, lastmod: today.toISOString(), changefreq: 'yearly', priority: 0.5 },
            { loc: `${SITE_URL}/cookies-policy`, lastmod: today.toISOString(), changefreq: 'yearly', priority: 0.5 },

            // Other content pages
            { loc: `${SITE_URL}/faq`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/important-links`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/downloadable-resources`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },

            // Misc marketing pages
            { loc: `${SITE_URL}/apply`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/askgenie`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/award`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/career`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/career-single`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/case-studies`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/case-studies-single`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/free-consultation`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/partner`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/team`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/team-single`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/travel-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/logistic-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/construction-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/ecommerce-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/fintech-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/healthcare-industry`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/it-innovations`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/it-strategies`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
            { loc: `${SITE_URL}/why-choose-us`, lastmod: today.toISOString(), changefreq: 'monthly', priority: 0.5 },
        ];

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
