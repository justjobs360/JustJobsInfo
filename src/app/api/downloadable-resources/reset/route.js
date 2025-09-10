import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { initializeDownloadableResources } from '@/utils/downloadableResourcesService';

// POST /api/downloadable-resources/reset - Reset downloadable resources with updated links
export async function POST() {
    try {
        console.log('🔄 Resetting downloadable resources with updated links...');
        
        const collection = await getCollection('downloadableResources');
        
        // Clear existing resources
        await collection.deleteMany({});
        console.log('✅ Cleared existing downloadable resources');
        
        // Initialize with updated resources
        const result = await initializeDownloadableResources();
        
        console.log('✅ Successfully reset downloadable resources with updated links');
        
        return NextResponse.json({
            success: true,
            message: 'Downloadable resources reset successfully with updated links',
            data: {
                insertedIds: result
            }
        });
        
    } catch (error) {
        console.error('❌ Error resetting downloadable resources:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to reset downloadable resources',
            message: error.message
        }, { status: 500 });
    }
}
