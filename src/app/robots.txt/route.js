import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        console.log('🤖 Serving robots.txt from database...');
        
        const collection = await getCollection('robots_txt');
        
        // Fetch the robots.txt content from database
        const robotsTxt = await collection.findOne({});
        
        let content;
        
        if (!robotsTxt) {
            // Return default robots.txt content if none exists in database
            console.log('⚠️ No robots.txt found in database, using default');
            content = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/blogs/
Allow: /api/jobs/

# Sitemap
Sitemap: https://justjobs.info/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
        } else {
            content = robotsTxt.content;
            console.log('✅ Serving robots.txt from database');
        }
        
        // Return as plain text with proper content type
        return new NextResponse(content, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
        
    } catch (error) {
        console.error('❌ Error serving robots.txt:', error);
        
        // Return default robots.txt on error
        const defaultContent = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow specific paths
Allow: /api/blogs/
Allow: /api/jobs/

# Sitemap
Sitemap: https://justjobs.info/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
        
        return new NextResponse(defaultContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600',
            },
        });
    }
}

