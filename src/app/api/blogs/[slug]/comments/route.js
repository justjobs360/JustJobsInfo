import { NextResponse } from 'next/server';
import { getBlogBySlug, getBlogComments } from '@/utils/blogService';

// GET /api/blogs/[slug]/comments - Get comments for a specific blog
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
    // First get the blog to get its ID
    const blog = await getBlogBySlug(slug);
    
    if (!blog) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Blog not found' 
        },
        { status: 404 }
      );
    }

    const comments = await getBlogComments(blog._id);

    return NextResponse.json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('❌ Error fetching blog comments:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch comments' 
      },
      { status: 500 }
    );
  }
}
