import { NextResponse } from 'next/server';
import { getImportantLinkById, updateImportantLink, deleteImportantLink } from '@/utils/importantLinksService';

// GET /api/important-links/[id] - Get important link by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 GET /api/important-links/[id] - Fetching important link:', id);
        
        const link = await getImportantLinkById(id);
        
        if (!link) {
            return NextResponse.json({
                success: false,
                error: 'Important link not found',
                message: 'The requested important link does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully fetched important link by ID');
        
        return NextResponse.json({
            success: true,
            data: link,
            message: 'Important link fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in GET /api/important-links/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch important link',
            message: error.message
        }, { status: 500 });
    }
}

// PUT /api/important-links/[id] - Update important link
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 PUT /api/important-links/[id] - Updating important link:', id);
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.subtitle || !body.category || !body.links) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'Title, subtitle, category, and links are required'
            }, { status: 400 });
        }
        
        const success = await updateImportantLink(id, body);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Important link not found',
                message: 'The requested important link does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully updated important link');
        
        return NextResponse.json({
            success: true,
            message: 'Important link updated successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in PUT /api/important-links/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to update important link',
            message: error.message
        }, { status: 500 });
    }
}

// DELETE /api/important-links/[id] - Delete important link
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        console.log('📡 DELETE /api/important-links/[id] - Deleting important link:', id);
        
        const success = await deleteImportantLink(id);
        
        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Important link not found',
                message: 'The requested important link does not exist'
            }, { status: 404 });
        }
        
        console.log('✅ Successfully deleted important link');
        
        return NextResponse.json({
            success: true,
            message: 'Important link deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in DELETE /api/important-links/[id]:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to delete important link',
            message: error.message
        }, { status: 500 });
    }
} 