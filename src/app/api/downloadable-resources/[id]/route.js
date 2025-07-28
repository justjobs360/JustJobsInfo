import { NextResponse } from 'next/server';
import { getDownloadableResourceById, updateDownloadableResource, deleteDownloadableResource } from '@/utils/downloadableResourcesService';

// GET /api/downloadable-resources/[id] - Get downloadable resource by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 GET /api/downloadable-resources/[id] - Fetching downloadable resource:', id);
        
        const resource = await getDownloadableResourceById(id);
        
        if (!resource) {
            return NextResponse.json({
                success: false,
                error: 'Downloadable resource not found',
                message: 'The requested downloadable resource does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully fetched downloadable resource by ID');
        
        return NextResponse.json({
            success: true,
            data: resource,
            message: 'Downloadable resource fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in GET /api/downloadable-resources/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch downloadable resource',
            message: error.message
        }, { status: 500 });
    }
}

// PUT /api/downloadable-resources/[id] - Update downloadable resource
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 PUT /api/downloadable-resources/[id] - Updating downloadable resource:', id);
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.subtitle || !body.category || !body.resources) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'Title, subtitle, category, and resources are required'
            }, { status: 400 });
        }
        
        const success = await updateDownloadableResource(id, body);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Downloadable resource not found',
                message: 'The requested downloadable resource does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully updated downloadable resource');
        
        return NextResponse.json({
            success: true,
            message: 'Downloadable resource updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in PUT /api/downloadable-resources/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to update downloadable resource',
            message: error.message
        }, { status: 500 });
    }
}

// DELETE /api/downloadable-resources/[id] - Delete downloadable resource
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 DELETE /api/downloadable-resources/[id] - Deleting downloadable resource:', id);
        
        const success = await deleteDownloadableResource(id);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Downloadable resource not found',
                message: 'The requested downloadable resource does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully deleted downloadable resource');
        
        return NextResponse.json({
            success: true,
            message: 'Downloadable resource deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in DELETE /api/downloadable-resources/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to delete downloadable resource',
            message: error.message
        }, { status: 500 });
    }
} 