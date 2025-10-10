import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    console.log('📋 Fetching job fit analyses list...', { page, limit, search, sortBy, sortOrder });

    const collection = await getCollection('job_fit_analyses');
    
    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { industrySector: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const totalCount = await collection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    // Fetch analyses with pagination
    const analyses = await collection
      .find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .project({
        jobTitle: 1,
        companyName: 1,
        industrySector: 1,
        fitScore: 1,
        fitLevel: 1,
        resumeFileName: 1,
        resumeFileSize: 1,
        userId: 1,
        userEmail: 1,
        isAuthenticated: 1,
        userType: 1,
        createdAt: 1
      })
      .toArray();

    // Format the results
    const formattedAnalyses = analyses.map(analysis => ({
      id: analysis._id.toString(),
      jobTitle: analysis.jobTitle || 'Untitled Position',
      companyName: analysis.companyName || 'Company not specified',
      industrySector: analysis.industrySector || null,
      fitScore: analysis.fitScore,
      fitLevel: analysis.fitLevel,
      resumeFileName: analysis.resumeFileName,
      resumeFileSize: analysis.resumeFileSize,
      userType: analysis.userType || (analysis.isAuthenticated ? 'Registered' : 'Guest'),
      userEmail: analysis.userEmail || 'Unknown',
      timeAgo: getTimeAgo(analysis.createdAt),
      createdAt: analysis.createdAt
    }));

    console.log(`✅ Fetched ${formattedAnalyses.length} analyses (page ${page}/${totalPages})`);

    return NextResponse.json({
      success: true,
      data: {
        analyses: formattedAnalyses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching job fit analyses list:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analyses. Please try again later.'
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

