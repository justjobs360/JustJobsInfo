import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
  try {
    console.log('📊 Fetching job fit statistics...');
    
    // Get the job_fit_analyses collection
    const collection = await getCollection('job_fit_analyses');
    
    // Get current date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    console.log('🔍 Date ranges:', { today, thisWeek, thisMonth });
    
    // Aggregate statistics
    const [
      totalAnalyses,
      todayAnalyses,
      thisWeekAnalyses,
      thisMonthAnalyses,
      averageFitScoreResult,
      recentAnalyses
    ] = await Promise.all([
      // Total analyses count
      collection.countDocuments({}),
      
      // Today's analyses
      collection.countDocuments({
        createdAt: { $gte: today }
      }),
      
      // This week's analyses
      collection.countDocuments({
        createdAt: { $gte: thisWeek }
      }),
      
      // This month's analyses
      collection.countDocuments({
        createdAt: { $gte: thisMonth }
      }),
      
      // Average fit score calculation
      collection.aggregate([
        { $match: { fitScore: { $exists: true, $type: "number" } } },
        { $group: { _id: null, avgScore: { $avg: "$fitScore" } } }
      ]).toArray(),
      
      // Recent analyses for activity feed
      collection.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .project({
          jobTitle: 1,
          companyName: 1,
          fitScore: 1,
          fitLevel: 1,
          createdAt: 1,
          userId: 1,
          userEmail: 1,
          isAuthenticated: 1
        })
        .toArray()
    ]);
    
    // Calculate average fit score
    const averageFitScore = averageFitScoreResult.length > 0 ? 
      Math.round(averageFitScoreResult[0].avgScore) : 0;
    
    // Calculate score distribution
    const scoreDistribution = await collection.aggregate([
      { $match: { fitScore: { $exists: true, $type: "number" } } },
      {
        $bucket: {
          groupBy: "$fitScore",
          boundaries: [0, 20, 40, 60, 80, 100],
          default: "other",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();
    
    // Count users by authentication status
    const userStats = await collection.aggregate([
      {
        $group: {
          _id: "$isAuthenticated",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const authenticatedCount = userStats.find(s => s._id === true)?.count || 0;
    const guestCount = userStats.find(s => s._id === false)?.count || 0;
    
    console.log('👥 User stats:', { authenticatedCount, guestCount });
    
    // Format recent activity
    const recentActivity = recentAnalyses.map(analysis => {
      const timeAgo = getTimeAgo(analysis.createdAt);
      return {
        id: analysis._id.toString(),
        message: `Job fit analysis completed`,
        details: `${analysis.jobTitle || 'Untitled Position'}${analysis.companyName ? ` at ${analysis.companyName}` : ''} - Score: ${analysis.fitScore}/100`,
        timeAgo,
        userEmail: analysis.userEmail || 'Guest',
        score: analysis.fitScore
      };
    });
    
    console.log('✅ Statistics fetched successfully');
    console.log(`📊 Total: ${totalAnalyses}, Today: ${todayAnalyses}, This Week: ${thisWeekAnalyses}, This Month: ${thisMonthAnalyses}`);
    console.log(`⭐ Average Score: ${averageFitScore}/100`);
    
    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses,
        todayAnalyses,
        thisWeekAnalyses,
        thisMonthAnalyses,
        averageFitScore,
        scoreDistribution: scoreDistribution.map(bucket => ({
          range: `${bucket._id}-${bucket._id + 20}`,
          count: bucket.count
        })),
        userStats: {
          authenticated: authenticatedCount,
          guests: guestCount
        },
        recentActivity
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching job fit statistics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics. Please try again later.'
    }, { status: 500 });
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + ' year' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
  
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + ' month' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
  
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + ' day' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
  
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + ' hour' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
  
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '') + ' ago';
  
  return Math.floor(seconds) + ' second' + (Math.floor(seconds) !== 1 ? 's' : '') + ' ago';
}

