import { NextResponse } from 'next/server';
import { jobCacheManager } from '@/utils/jobCacheManager';

export async function GET(request) {
  try {
    // Verify this is a Vercel cron request
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');
    
    // Check if it's a Vercel cron request or has proper auth
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron');
    
    if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Vercel cron job triggered: Cache prewarming');
    
    // Run the prewarm process
    const result = await jobCacheManager.prewarmCache();
    
    if (result.success) {
      console.log(`✅ Prewarm completed successfully: ${result.cached} searches cached`);
      return NextResponse.json({
        success: true,
        message: 'Cache prewarming completed',
        cached: result.cached,
        searches: result.searches,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`⚠️ Prewarm completed with issues: ${result.reason || result.error}`);
      return NextResponse.json({
        success: false,
        message: result.reason || result.error,
        timestamp: new Date().toISOString()
      }, { status: 200 }); // Still return 200 as this might be expected
    }

  } catch (error) {
    console.error('❌ Cron job failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Allow POST for manual triggers
export async function POST(request) {
  try {
    const body = await request.json();
    const { force } = body;
    
    console.log('🔧 Manual cache prewarming triggered');
    
    // Force prewarm if requested
    if (force) {
      jobCacheManager.lastPrewarmTime = null; // Reset last prewarm time
    }
    
    const result = await jobCacheManager.prewarmCache();
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Cache prewarming completed' : (result.reason || result.error),
      cached: result.cached || 0,
      searches: result.searches || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Manual prewarm failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}