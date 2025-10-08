import { NextResponse } from 'next/server';
import { getImportantLinks, createImportantLink } from '@/utils/importantLinksService';

// GET /api/important-links - Get all important links
export async function GET() {
    try {
        console.log('📡 GET /api/important-links - Fetching important links');
        
        const links = await getImportantLinks();
        
        console.log(`✅ Successfully fetched ${links.length} important links`);
        
        return NextResponse.json({
            success: true,
            data: links,
            message: 'Important links fetched successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in GET /api/important-links:', error);
        
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
                message: 'Important links collection does not exist'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch important links',
            message: error.message
        }, { status: 500 });
    }
}

// POST /api/important-links - Create a new important link
export async function POST(request) {
    try {
        console.log('📡 POST /api/important-links - Creating new important link');
        
        const body = await request.json();
        
        // Validate required fields
        if (!body.title || !body.subtitle || !body.category || !body.links) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
                message: 'Title, subtitle, category, and links are required'
            }, { status: 400 });
        }
        
        const newLinkId = await createImportantLink(body);
        
        console.log('✅ Successfully created important link:', newLinkId);
        
        return NextResponse.json({
            success: true,
            data: { id: newLinkId },
            message: 'Important link created successfully'
        });
        
    } catch (error) {
        console.error('❌ Error in POST /api/important-links:', error);
        
        return NextResponse.json({
            success: false,
            error: 'Failed to create important link',
            message: error.message
        }, { status: 500 });
    }
} 
