import { NextResponse } from 'next/server';
import { getFooterData } from '@/utils/footerService';

// GET - Get footer data (public endpoint)
export async function GET() {
  try {
    const result = await getFooterData();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Error in GET /api/footer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
