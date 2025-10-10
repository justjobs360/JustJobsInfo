import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
    try {
        // Get user ID from headers (sent by authenticated client)
        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        // Get the job fit analyses collection
        const collection = await getCollection('job_fit_analyses');

        // Fetch all analyses for this user, sorted by most recent first
        const analyses = await collection
            .find({ userId, isAuthenticated: true })
            .sort({ createdAt: -1 })
            .project({
                _id: 1,
                fitScore: 1,
                fitLevel: 1,
                jobTitle: 1,
                companyName: 1,
                industrySector: 1,
                resumeFileName: 1,
                createdAt: 1
            })
            .toArray();

        // Format the response
        const formattedAnalyses = analyses.map(analysis => ({
            id: analysis._id.toString(),
            fitScore: analysis.fitScore,
            fitLevel: analysis.fitLevel,
            jobTitle: analysis.jobTitle || 'Untitled Position',
            companyName: analysis.companyName || 'Company not specified',
            industrySector: analysis.industrySector,
            resumeFileName: analysis.resumeFileName,
            createdAt: analysis.createdAt,
            timeAgo: getTimeAgo(analysis.createdAt)
        }));

        return NextResponse.json({
            success: true,
            data: formattedAnalyses,
            count: formattedAnalyses.length
        });

    } catch (error) {
        console.error('Error fetching user job fit history:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch job fit history'
        }, { status: 500 });
    }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

