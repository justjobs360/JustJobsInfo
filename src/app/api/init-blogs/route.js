import { NextResponse } from 'next/server';
import { initializeBlogs } from '@/utils/blogService';

// GET /api/init-blogs - Initialize blogs with default data (for browser access)
export async function GET() {
  try {
    const result = await initializeBlogs();

    return NextResponse.json({
      success: true,
      message: 'Blogs initialized successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error initializing blogs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize blogs' 
      },
      { status: 500 }
    );
  }
}

// POST /api/init-blogs - Initialize blogs with default data
export async function POST() {
  try {
    const result = await initializeBlogs();

    return NextResponse.json({
      success: true,
      message: 'Blogs initialized successfully',
      data: result
    });

  } catch (error) {
    console.error('❌ Error initializing blogs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to initialize blogs' 
      },
      { status: 500 }
    );
  }
} 
