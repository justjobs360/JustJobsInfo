import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        console.log('🗺️ Generating dynamic sitemap.xml...');
        
        const sitemapCollection = await getCollection('sitemap_config');
        const blogsCollection = await getCollection('blogs');
        
        // Fetch static pages from sitemap configuration
        const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();
        
        // Fetch published blog posts for dynamic URLs
        const blogs = await blogsCollection
            .find({ status: 'published' })
            .sort({ publishedDate: -1 })
            .limit(1000) // Limit to recent 1000 blogs
            .toArray();
        
        const siteUrl = 'https://justjobs.info';
        const today = new Date().toISOString().split('T')[0];
        
        // Build URL entries for static pages
        let urlEntries = [];
        
        if (staticPages.length > 0) {
            urlEntries = staticPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${page.lastmod || today}</lastmod>
    <changefreq>${page.changefreq || 'monthly'}</changefreq>
    <priority>${page.priority || '0.5'}</priority>
  </url>`);
        } else {
            // Default static pages if no configuration exists
            console.log('⚠️ No sitemap configuration found, using default pages');
            const defaultPages = [
                { url: '/', priority: '1.0', changefreq: 'weekly' },
                { url: '/about', priority: '0.8', changefreq: 'monthly' },
                { url: '/contact', priority: '0.8', changefreq: 'monthly' },
                { url: '/resume-audit', priority: '0.9', changefreq: 'weekly' },
                { url: '/resume-builder', priority: '0.9', changefreq: 'weekly' },
                { url: '/job-listing', priority: '0.8', changefreq: 'daily' },
                { url: '/blogs', priority: '0.7', changefreq: 'daily' },
                { url: '/service', priority: '0.8', changefreq: 'monthly' },
                { url: '/faq', priority: '0.6', changefreq: 'monthly' },
                { url: '/privacy-policy', priority: '0.5', changefreq: 'yearly' },
                { url: '/terms-of-use', priority: '0.5', changefreq: 'yearly' }
            ];
            
            urlEntries = defaultPages.map(page => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
        }
        
        // Add blog post URLs
        if (blogs && blogs.length > 0) {
            console.log(`📝 Adding ${blogs.length} blog posts to sitemap`);
            const blogEntries = blogs.map(blog => {
                const blogDate = blog.publishedDate 
                    ? new Date(blog.publishedDate).toISOString().split('T')[0] 
                    : today;
                    
                return `  <url>
    <loc>${siteUrl}/blogs/${blog.slug}</loc>
    <lastmod>${blogDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
            });
            
            urlEntries = [...urlEntries, ...blogEntries];
        }
        
        // Generate XML sitemap
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urlEntries.join('\n')}
</urlset>`;
        
        console.log(`✅ Sitemap generated with ${urlEntries.length} URLs`);
        
        // Return as XML with proper content type
        return new NextResponse(sitemapXml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
        
    } catch (error) {
        console.error('❌ Error generating sitemap.xml:', error);
        
        // Return minimal sitemap on error
        const siteUrl = 'https://justjobs.info';
        const today = new Date().toISOString().split('T')[0];
        
        const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/resume-audit</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/job-listing</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
        
        return new NextResponse(minimalSitemap, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    }
}

