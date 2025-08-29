import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
  try {
    console.log('📊 Fetching resume audit statistics...');
    
    // Get the cv_audits collection
    const collection = await getCollection('cv_audits');
    
    // Get current date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log('🔍 Date ranges:', { today, thisWeek, thisMonth });
    
    // Aggregate statistics
    const [
      totalAudits,
      todayAudits,
      thisWeekAudits,
      thisMonthAudits,
      averageScoreResult,
      recentAudits
    ] = await Promise.all([
      // Total audits count
      collection.countDocuments({}),
      
      // Today's audits
      collection.countDocuments({
        createdAt: { $gte: today }
      }),
      
      // This week's audits
      collection.countDocuments({
        createdAt: { $gte: thisWeek }
      }),
      
      // This month's audits
      collection.countDocuments({
        createdAt: { $gte: thisMonth }
      }),
      
      // Average score calculation
      collection.aggregate([
        { $match: { score: { $exists: true, $type: "number" } } },
        { $group: { _id: null, avgScore: { $avg: "$score" } } }
      ]).toArray(),
      
      // Recent audits for activity feed
      collection.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({
          fileName: 1,
          score: 1,
          createdAt: 1,
          userId: 1,
          userEmail: 1,
          isAuthenticated: 1
        })
        .toArray()
    ]);
    
    // Calculate average score
    const averageScore = averageScoreResult.length > 0 ? 
      Math.round(averageScoreResult[0].avgScore) : 0;
    
    // Calculate score distribution
    const scoreDistribution = await collection.aggregate([
      { $match: { score: { $exists: true, $type: "number" } } },
      {
        $bucket: {
          groupBy: "$score",
          boundaries: [0, 20, 40, 60, 80, 100],
          default: "other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();
    
    // Get user type breakdown
    const userTypeStats = await collection.aggregate([
      {
        $group: {
          _id: "$isAuthenticated",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const authenticatedUsers = userTypeStats.find(stat => stat._id === true)?.count || 0;
    const guestUsers = userTypeStats.find(stat => stat._id === false)?.count || 0;
    
    // Process recent audits for activity feed
    const recentActivity = recentAudits.map(audit => {
      const timeAgo = getTimeAgo(audit.createdAt);
      const userDisplay = audit.isAuthenticated ? 
        (audit.userEmail || 'Registered User') : 
        'Guest User';
      
      return {
        id: audit._id,
        type: 'audit',
        message: `Resume audit completed by ${userDisplay}`,
        details: `Score: ${audit.score || 'N/A'}/100 • ${audit.fileName}`,
        timeAgo: timeAgo,
        timestamp: audit.createdAt
      };
    });
    
    const stats = {
      totalAudits,
      todayAudits,
      thisWeekAudits,
      thisMonthAudits,
      averageScore,
      scoreDistribution,
      userStats: {
        authenticated: authenticatedUsers,
        guests: guestUsers
      },
      recentActivity
    };
    
    console.log('✅ Resume audit statistics calculated:', {
      totalAudits,
      todayAudits,
      thisWeekAudits,
      thisMonthAudits,
      averageScore,
      recentActivityCount: recentActivity.length
    });
    
    return NextResponse.json({
      success: true,
      data: stats
    });
    
  } catch (error) {
    console.error('❌ Error fetching resume audit statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch audit statistics',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString();
}
