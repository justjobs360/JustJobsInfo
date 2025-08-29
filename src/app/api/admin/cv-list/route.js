import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET(request) {
  try {
    console.log('📋 Fetching CV list...');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    console.log('🔍 Query parameters:', { page, limit, search, sortBy, sortOrder });
    
    // Get the cv_audits collection
    const collection = await getCollection('cv_audits');
    
    // Build search query
    let query = {};
    if (search) {
      query = {
        $or: [
          { fileName: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { userId: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    console.log('📊 Query:', query);
    console.log('📄 Pagination:', { skip, limit });
    console.log('🔄 Sort:', sort);
    
    // Execute queries in parallel
    const [cvs, totalCount] = await Promise.all([
      collection
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .project({
          fileName: 1,
          fileSize: 1,
          fileType: 1,
          extractedTextLength: 1,
          textPreview: 1,
          userId: 1,
          userEmail: 1,
          isAuthenticated: 1,
          clientIP: 1,
          cvDetectionReason: 1,
          processedAt: 1,
          createdAt: 1,
          score: 1
          // Note: We exclude fileData from the list to avoid large transfers
        })
        .toArray(),
      
      collection.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    // Process CVs for display
    const processedCvs = cvs.map(cv => ({
      id: cv._id.toString(),
      fileName: cv.fileName,
      fileSize: cv.fileSize,
      fileSizeFormatted: formatFileSize(cv.fileSize),
      fileType: cv.fileType,
      extractedTextLength: cv.extractedTextLength,
      textPreview: cv.textPreview || 'No preview available',
      userId: cv.userId,
      userEmail: cv.userEmail || 'N/A',
      isAuthenticated: cv.isAuthenticated,
      clientIP: cv.clientIP,
      cvDetectionReason: cv.cvDetectionReason,
      processedAt: cv.processedAt,
      createdAt: cv.createdAt,
      uploadedAt: cv.createdAt,
      score: cv.score || 0,
      userType: cv.isAuthenticated ? 'Registered' : 'Guest',
      timeAgo: getTimeAgo(cv.createdAt)
    }));
    
    const result = {
      success: true,
      data: {
        cvs: processedCvs,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        },
        query: {
          search,
          sortBy,
          sortOrder
        }
      }
    };
    
    console.log('✅ CV list fetched successfully:', {
      count: processedCvs.length,
      totalCount,
      page,
      totalPages
    });
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error fetching CV list:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch CV list',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
