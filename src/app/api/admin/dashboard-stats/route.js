import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
    try {
        console.log('📊 Fetching dashboard statistics...');
        
        // Get collections using the correct utility function
        const cvAuditsCollection = await getCollection('cv_audits');
        const blogsCollection = await getCollection('Blogs');
        const importantLinksCollection = await getCollection('importantLinks');
        const downloadableResourcesCollection = await getCollection('downloadableResources');
        
        // Calculate time ranges for recent activity
        const now = new Date();
        const last24Hours = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        // Fetch comprehensive statistics
        const [
            totalCVs,
            recentCVs,
            totalBlogs,
            publishedBlogs,
            totalImportantLinks,
            totalDownloadableResources,
            recentBlogs,
            recentCVAudits
        ] = await Promise.all([
            cvAuditsCollection.countDocuments(),
            cvAuditsCollection.countDocuments({ createdAt: { $gte: last24Hours } }),
            blogsCollection.countDocuments(),
            blogsCollection.countDocuments({ status: 'published' }),
            importantLinksCollection.countDocuments(),
            downloadableResourcesCollection.countDocuments(),
            blogsCollection.find({}, { 
                sort: { createdAt: -1 }, 
                limit: 5,
                projection: { title: 1, createdAt: 1, author: 1, status: 1 }
            }).toArray(),
            cvAuditsCollection.find({}, {
                sort: { createdAt: -1 },
                limit: 5,
                projection: { fileName: 1, userEmail: 1, score: 1, createdAt: 1, isAuthenticated: 1 }
            }).toArray()
        ]);
        
        console.log('📈 Statistics fetched:', {
            totalCVs,
            recentCVs,
            totalBlogs,
            publishedBlogs
        });

        // Calculate improved SEO score based on real metrics
        const contentScore = Math.min(25, publishedBlogs * 2); // Up to 25 points for published blogs
        const linkScore = Math.min(15, totalImportantLinks * 3); // Up to 15 points for links
        const resourceScore = Math.min(15, totalDownloadableResources * 5); // Up to 15 points for resources
        const auditScore = Math.min(25, totalCVs / 10); // Up to 25 points for CV audits
        const activityScore = Math.min(20, recentCVs * 4); // Up to 20 points for recent activity
        
        const seoScore = Math.round(contentScore + linkScore + resourceScore + auditScore + activityScore);

        // Generate real-time recent activity based on actual data
        const recentActivity = [];
        
        // Helper function to calculate time ago
        const getTimeAgo = (date) => {
            const seconds = Math.floor((now - new Date(date)) / 1000);
            if (seconds < 60) return 'Just now';
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            const days = Math.floor(hours / 24);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        };
        
        // Add recent CV audits
        recentCVAudits.forEach((audit) => {
            const userType = audit.isAuthenticated ? 'User' : 'Guest';
            recentActivity.push({
                id: `cv-${audit._id}`,
                action: `CV audit completed for ${audit.fileName}`,
                user: audit.userEmail || `${userType} User`,
                time: getTimeAgo(audit.createdAt),
                type: 'cv-audit',
                score: audit.score,
                timestamp: new Date(audit.createdAt)
            });
        });
        
        // Add recent blog posts
        recentBlogs.forEach((blog) => {
            recentActivity.push({
                id: `blog-${blog._id}`,
                action: `Blog post ${blog.status}: ${blog.title}`,
                user: blog.author || 'Admin',
                time: getTimeAgo(blog.createdAt),
                type: 'blog',
                status: blog.status,
                timestamp: new Date(blog.createdAt)
            });
        });

        // Sort activities by actual timestamp (most recent first)
        recentActivity.sort((a, b) => b.timestamp - a.timestamp);
        
        // Remove timestamp from final output and limit to 8 most recent
        const finalRecentActivity = recentActivity.slice(0, 8).map(({ timestamp, ...activity }) => activity);

        const stats = {
            totalCVs,
            recentCVs,
            totalBlogs,
            publishedBlogs,
            totalImportantLinks,
            totalDownloadableResources,
            seoScore,
            recentActivity: finalRecentActivity,
            // Additional metrics for enhanced dashboard
            metrics: {
                contentScore,
                linkScore,
                resourceScore,
                auditScore,
                activityScore
            }
        };

        console.log('✅ Dashboard stats compiled successfully:', {
            totalCVs: stats.totalCVs,
            recentCVs: stats.recentCVs,
            seoScore: stats.seoScore,
            activityCount: stats.recentActivity.length
        });

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        }, { status: 500 });
    }
} 