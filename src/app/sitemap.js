import { getCollection } from '@/utils/mongodb';

/**
 * Next.js 13+ Sitemap Generation
 * This file automatically generates sitemap.xml at /sitemap.xml
 * Documentation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap() {
    try {
        console.log('🗺️ Generating sitemap...');
        
        const siteUrl = 'https://justjobs.info';
        const today = new Date();
        
        // Initialize sitemap array
        let sitemapEntries = [];
        
        try {
            // Fetch static pages from database
            const sitemapCollection = await getCollection('sitemap_config');
            const staticPages = await sitemapCollection.find({}).sort({ priority: -1 }).toArray();
            
            if (staticPages.length > 0) {
                console.log(`📄 Adding ${staticPages.length} static pages from database`);
                sitemapEntries = staticPages.map(page => ({
                    url: `${siteUrl}${page.url}`,
                    lastModified: page.lastmod ? new Date(page.lastmod) : today,
                    changeFrequency: page.changefreq || 'monthly',
                    priority: parseFloat(page.priority) || 0.5,
                }));
            } else {
                console.log('⚠️ No sitemap configuration found, using default pages');
                // Default static pages
                sitemapEntries = [
                    {
                        url: `${siteUrl}/`,
                        lastModified: today,
                        changeFrequency: 'weekly',
                        priority: 1.0,
                    },
                    {
                        url: `${siteUrl}/about`,
                        lastModified: today,
                        changeFrequency: 'monthly',
                        priority: 0.8,
                    },
                    {
                        url: `${siteUrl}/contact`,
                        lastModified: today,
                        changeFrequency: 'monthly',
                        priority: 0.8,
                    },
                    {
                        url: `${siteUrl}/resume-audit`,
                        lastModified: today,
                        changeFrequency: 'weekly',
                        priority: 0.9,
                    },
                    {
                        url: `${siteUrl}/resume-builder`,
                        lastModified: today,
                        changeFrequency: 'weekly',
                        priority: 0.9,
                    },
                    {
                        url: `${siteUrl}/job-listing`,
                        lastModified: today,
                        changeFrequency: 'daily',
                        priority: 0.8,
                    },
                    {
                        url: `${siteUrl}/job-fit`,
                        lastModified: today,
                        changeFrequency: 'weekly',
                        priority: 0.8,
                    },
                    {
                        url: `${siteUrl}/job-alerts`,
                        lastModified: today,
                        changeFrequency: 'weekly',
                        priority: 0.7,
                    },
                    {
                        url: `${siteUrl}/blogs`,
                        lastModified: today,
                        changeFrequency: 'daily',
                        priority: 0.7,
                    },
                    {
                        url: `${siteUrl}/service`,
                        lastModified: today,
                        changeFrequency: 'monthly',
                        priority: 0.8,
                    },
                    {
                        url: `${siteUrl}/faq`,
                        lastModified: today,
                        changeFrequency: 'monthly',
                        priority: 0.6,
                    },
                    {
                        url: `${siteUrl}/privacy-policy`,
                        lastModified: today,
                        changeFrequency: 'yearly',
                        priority: 0.5,
                    },
                    {
                        url: `${siteUrl}/terms-of-use`,
                        lastModified: today,
                        changeFrequency: 'yearly',
                        priority: 0.5,
                    },
                ];
            }
            
            // Fetch published blog posts
            const blogsCollection = await getCollection('blogs');
            const blogs = await blogsCollection
                .find({ status: 'published' })
                .sort({ publishedDate: -1 })
                .limit(1000)
                .toArray();
            
            if (blogs && blogs.length > 0) {
                console.log(`📝 Adding ${blogs.length} blog posts to sitemap`);
                const blogEntries = blogs.map(blog => ({
                    url: `${siteUrl}/blogs/${blog.slug}`,
                    lastModified: blog.publishedDate ? new Date(blog.publishedDate) : today,
                    changeFrequency: 'monthly',
                    priority: 0.6,
                }));
                
                sitemapEntries = [...sitemapEntries, ...blogEntries];
            }
            
        } catch (dbError) {
            console.error('⚠️ Database error, using default sitemap:', dbError);
            // Fallback to basic sitemap if database fails
            sitemapEntries = [
                {
                    url: `${siteUrl}/`,
                    lastModified: today,
                    changeFrequency: 'weekly',
                    priority: 1.0,
                },
                {
                    url: `${siteUrl}/resume-audit`,
                    lastModified: today,
                    changeFrequency: 'weekly',
                    priority: 0.9,
                },
                {
                    url: `${siteUrl}/job-listing`,
                    lastModified: today,
                    changeFrequency: 'daily',
                    priority: 0.8,
                },
            ];
        }
        
        console.log(`✅ Sitemap generated with ${sitemapEntries.length} URLs`);
        
        return sitemapEntries;
        
    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        
        // Return minimal sitemap on critical error
        const siteUrl = 'https://justjobs.info';
        const today = new Date();
        
        return [
            {
                url: `${siteUrl}/`,
                lastModified: today,
                changeFrequency: 'weekly',
                priority: 1.0,
            },
            {
                url: `${siteUrl}/resume-audit`,
                lastModified: today,
                changeFrequency: 'weekly',
                priority: 0.9,
            },
        ];
    }
}

