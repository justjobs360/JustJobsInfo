import { NextResponse } from 'next/server';
import { getBlogBySlug, updateBlog, deleteBlog, addComment } from '@/utils/blogService';

// GET /api/blogs/[slug] - Get blog by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    
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

    return NextResponse.json({
      success: true,
      data: blog
    });

  } catch (error) {
    console.error('❌ Error fetching blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog' 
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs/[slug] - Add comment to blog
export async function POST(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
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

    const success = await addComment(blog._id, body);

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to add comment' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding comment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add comment' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[slug] - Update blog by slug
export async function PUT(request, { params }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
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

    const success = await updateBlog(blog._id, body);

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update blog' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update blog' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug] - Delete blog by slug
export async function DELETE(request, { params }) {
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

    const success = await deleteBlog(blog._id);

    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete blog' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting blog:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete blog' 
      },
      { status: 500 }
    );
  }
} 