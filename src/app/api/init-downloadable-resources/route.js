import { NextResponse } from 'next/server';
import { initializeDownloadableResources } from '@/utils/downloadableResourcesService';

// POST /api/init-downloadable-resources - Initialize downloadable resources collection
export async function POST() {
    try {
        console.log('📡 POST /api/init-downloadable-resources - Initializing downloadable resources collection');
        
        const result = await initializeDownloadableResources();
        
        console.log('✅ Successfully initialized downloadable resources collection');
        
        return NextResponse.json({
            success: true,
            data: result,
            message: 'Downloadable resources collection initialized successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in POST /api/init-downloadable-resources:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to initialize downloadable resources',
            message: error.message
        }, { status: 500 });
    }
}

// GET /api/init-downloadable-resources - Initialize downloadable resources collection (for browser access)
export async function GET() {
    try {
        console.log('📡 GET /api/init-downloadable-resources - Initializing downloadable resources collection');
        
        const result = await initializeDownloadableResources();
        
        console.log('✅ Successfully initialized downloadable resources collection');
        
        return NextResponse.json({
            success: true,
            data: result,
            message: 'Downloadable resources collection initialized successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in GET /api/init-downloadable-resources:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to initialize downloadable resources',
            message: error.message
        }, { status: 500 });
    }
} 