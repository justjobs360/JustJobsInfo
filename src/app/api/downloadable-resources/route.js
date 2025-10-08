import { NextResponse } from 'next/server';
import { getDownloadableResources, createDownloadableResource } from '@/utils/downloadableResourcesService';

// GET /api/downloadable-resources - Get all downloadable resources
export async function GET() {
    try {
        console.log('📡 GET /api/downloadable-resources - Fetching downloadable resources');
        
        const resources = await getDownloadableResources();
        
        console.log(`✅ Successfully fetched ${resources.length} downloadable resources`);
        
        return NextResponse.json({
            success: true,
            data: resources,
            message: 'Downloadable resources fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in GET /api/downloadable-resources:', error);
        
        // Handle specific MongoDB errors
        if (error.name === 'MongoNetworkError') {
            return NextResponse.json({
                success: false,
                error: 'Database connection error',
                message: 'Unable to connect to database'
            }, { status: 503 });
        }
        
        if (error.name === 'NamespaceNotFound') {
            return NextResponse.json({
                success: false,
                error: 'Collection not found',
                message: 'Downloadable resources collection does not exist'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch downloadable resources',
            message: error.message
        }, { status: 500 });
    }
}

// POST /api/downloadable-resources - Create a new downloadable resource
export async function POST(request) {
    try {
        console.log('📡 POST /api/downloadable-resources - Creating new downloadable resource');
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.subtitle || !body.category || !body.resources) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'Title, subtitle, category, and resources are required'
            }, { status: 400 });
        }
        
        const newResourceId = await createDownloadableResource(body);
        
        console.log('✅ Successfully created downloadable resource:', newResourceId);
        
        return NextResponse.json({
            success: true,
            data: { id: newResourceId },
            message: 'Downloadable resource created successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in POST /api/downloadable-resources:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to create downloadable resource',
            message: error.message
        }, { status: 500 });
    }
} 
