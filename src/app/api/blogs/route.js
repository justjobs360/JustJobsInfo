import { NextResponse } from 'next/server';
import { getBlogs, createBlog, initializeBlogs } from '@/utils/blogService';

// GET /api/blogs - Get all blogs with pagination and search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'published';

    console.log('📝 Fetching blogs with params:', { page, limit, search, category, status });

    const result = await getBlogs(page, limit, search, category, status);

    console.log('✅ Blogs fetched successfully:', { 
      count: result.blogs.length, 
      totalCount: result.pagination.totalCount 
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error in GET /api/blogs:', error);
    
    // Check if it's a MongoDB connection error
    if (error.message && error.message.includes('MongoNetworkError')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed. Please check your MongoDB connection.' 
        },
        { status: 503 }
      );
    }
    
    // Check if it's a collection not found error
    if (error.message && error.message.includes('NamespaceNotFound')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Blog collection not found. Please initialize the blogs first.' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blogs',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog post
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'slug', 'description', 'content'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} is required` 
          },
          { status: 400 }
        );
      }
    }

    // Check if slug already exists
    const existingBlogs = await getBlogs(1, 1, '', '', '');
    const slugExists = existingBlogs.blogs.some(blog => blog.slug === body.slug);
    
    if (slugExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Blog with this slug already exists' 
        },
        { status: 400 }
      );
    }

    const blogId = await createBlog(body);

    return NextResponse.json({
      success: true,
      data: { id: blogId },
      message: 'Blog created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create blog',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
