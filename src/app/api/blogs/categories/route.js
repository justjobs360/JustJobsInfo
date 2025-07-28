import { NextResponse } from 'next/server';
import { getBlogCategories } from '@/utils/blogService';

// GET /api/blogs/categories - Get all blog categories
export async function GET() {
  try {
    const categories = await getBlogCategories();

    return NextResponse.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('❌ Error fetching blog categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch blog categories' 
      },
      { status: 500 }
    );
  }
} 