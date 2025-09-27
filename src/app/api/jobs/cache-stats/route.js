import { NextResponse } from 'next/server';
import { jobCacheManager } from '@/utils/jobCacheManager';

export async function GET(request) {
  try {
    const stats = await jobCacheManager.getCacheStats();
    
    if (!stats) {
      return NextResponse.json({
        success: false,
        error: 'Unable to retrieve cache statistics'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        remainingCalls: stats.monthlyLimit - stats.monthlyUsage,
        cacheStatus: stats.nearLimit ? 'LIMIT_WARNING' : 'HEALTHY',
        lastPrewarmAgo: stats.lastPrewarmTime ? 
          Math.round((Date.now() - stats.lastPrewarmTime) / (1000 * 60 * 60)) : null // hours ago
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cache stats error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
