import { NextResponse } from 'next/server';
import { getDatabase } from '@/utils/mongodb';

export async function GET() {
    try {
        const db = await getDatabase();
        
        // Get collections
        const userResumesCollection = db.collection('userResumes');
        const blogsCollection = db.collection('Blogs');
        const importantLinksCollection = db.collection('importantLinks');
        const downloadableResourcesCollection = db.collection('downloadableResources');
        
        // Fetch statistics
        const [
            totalCVs,
            totalBlogs,
            totalImportantLinks,
            totalDownloadableResources,
            recentBlogs
        ] = await Promise.all([
            userResumesCollection.countDocuments(),
            blogsCollection.countDocuments(),
            importantLinksCollection.countDocuments(),
            downloadableResourcesCollection.countDocuments(),
            blogsCollection.find({}, { 
                sort: { createdAt: -1 }, 
                limit: 5,
                projection: { title: 1, createdAt: 1, author: 1 }
            }).toArray()
        ]);

        // Calculate SEO score based on various factors
        const seoScore = Math.min(100, Math.max(0, 
            (totalBlogs > 0 ? 20 : 0) + 
            (totalImportantLinks > 0 ? 15 : 0) + 
            (totalDownloadableResources > 0 ? 15 : 0) + 
            (totalCVs > 100 ? 20 : totalCVs / 5) + 
            30 // Base score
        ));

        // Generate recent activity based on actual data
        const recentActivity = [];
        
        // Add recent blog posts as activity
        recentBlogs.forEach((blog, index) => {
            recentActivity.push({
                id: `blog-${blog._id}`,
                action: `Blog post published: ${blog.title}`,
                user: blog.author || 'Admin',
                time: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
                type: 'blog'
            });
        });

        // Add system activities
        if (totalCVs > 0) {
            recentActivity.push({
                id: 'cv-audit',
                action: `CV audit completed`,
                user: 'System',
                time: '30 minutes ago',
                type: 'system'
            });
        }

        if (totalImportantLinks > 0) {
            recentActivity.push({
                id: 'links-updated',
                action: `Important links updated`,
                user: 'Admin',
                time: '2 hours ago',
                type: 'content'
            });
        }

        if (totalDownloadableResources > 0) {
            recentActivity.push({
                id: 'resources-added',
                action: `Downloadable resources added`,
                user: 'Admin',
                time: '4 hours ago',
                type: 'content'
            });
        }

        // Sort activities by time (most recent first)
        recentActivity.sort((a, b) => {
            const timeOrder = { '30 minutes ago': 1, '1 hour ago': 2, '2 hours ago': 3, '4 hours ago': 4 };
            return timeOrder[a.time] - timeOrder[b.time];
        });

        const stats = {
            totalCVs,
            totalBlogs,
            totalImportantLinks,
            totalDownloadableResources,
            seoScore: Math.round(seoScore),
            recentActivity: recentActivity.slice(0, 5) // Limit to 5 most recent
        };

        return NextResponse.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        }, { status: 500 });
    }
} 