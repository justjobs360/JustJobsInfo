import { NextResponse } from 'next/server';
import { getBlogTags } from '@/utils/blogService';

// GET /api/blogs/tags - Get popular blog tags
export async function GET() {
  try {
    const tags = await getBlogTags();

    return NextResponse.json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('❌ Error fetching blog tags:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog tags' 
      },
      { status: 500 }
    );
  }
}

