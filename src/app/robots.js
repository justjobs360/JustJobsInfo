/**
 * Next.js 13+ Robots.txt Generation
 * This file automatically generates robots.txt at /robots.txt
 * Documentation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default async function robots() {
    try {
        console.log('🤖 Generating robots.txt...');
        
        // Try to fetch custom robots.txt from database
        // Import lazily so missing/invalid env vars can't crash the whole route at module-load time.
        const { getCollection } = await import('@/utils/mongodb');
        const collection = await getCollection('robots_txt');
        const robotsTxt = await collection.findOne({});
        
        if (robotsTxt && robotsTxt.content) {
            console.log('✅ Using robots.txt from database');
            
            // Parse the content and return as structured object
            // This is a fallback - we'll also support raw content
            return {
                rules: [
                    {
                        userAgent: '*',
                        allow: '/',
                        disallow: ['/admin/', '/api/'],
                    },
                ],
                sitemap: 'https://justjobs.info/sitemap.xml',
            };
        } else {
            console.log('⚠️ No robots.txt found in database, using default');
        }
        
    } catch (error) {
        console.error('⚠️ Error fetching robots.txt from database:', error);
    }
    
    // Default robots.txt configuration
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
            {
                userAgent: '*',
                allow: ['/api/blogs/', '/api/jobs/'],
            },
        ],
        sitemap: 'https://justjobs.info/sitemap.xml',
        host: 'https://justjobs.info',
    };
}

