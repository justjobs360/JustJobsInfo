import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    try {
        console.log('📋 Fetching meta tags...');
        
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page'); // Optional: filter by specific page
        const status = searchParams.get('status'); // Optional: filter by status
        
        const collection = await getCollection('meta_tags');
        
        // Build query
        let query = {};
        if (page) {
            // Case-insensitive search for page matching
            query.page = { $regex: new RegExp(page, 'i') };
        }
        if (status) {
            query.status = status;
        }
        
        console.log('🔍 Meta tags query:', query);
        
        // Fetch meta tags sorted by page name
        const metaTags = await collection
            .find(query)
            .sort({ page: 1, createdAt: -1 })
            .toArray();
        
        // Format the results
        const formattedMetaTags = metaTags.map(tag => ({
            id: tag._id.toString(),
            page: tag.page,
            title: tag.title,
            description: tag.description,
            keywords: tag.keywords,
            ogImage: tag.ogImage,
            author: tag.author || 'JustJobsInfo Team',
            publishDate: tag.publishDate || tag.createdAt,
            ogType: tag.ogType || 'website',
            status: tag.status,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt
        }));
        
        console.log('✅ Meta tags fetched successfully:', formattedMetaTags.length, 'tags');
        
        return NextResponse.json({
            success: true,
            data: formattedMetaTags
        });
        
    } catch (error) {
        console.error('❌ Error fetching meta tags:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch meta tags',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        console.log('📝 Creating new meta tag...');
        
        const body = await request.json();
        const { page, title, description, keywords, ogImage, author, publishDate, ogType, status } = body;
        
        // Validate required fields
        if (!page || !title || !description) {
            return NextResponse.json({
                success: false,
                error: 'Page, title, and description are required'
            }, { status: 400 });
        }
        
        const collection = await getCollection('meta_tags');
        
        // Check if meta tag for this page already exists
        const existingTag = await collection.findOne({ 
            page: { $regex: new RegExp(`^${page}$`, 'i') } 
        });
        
        if (existingTag) {
            return NextResponse.json({
                success: false,
                error: 'Meta tag for this page already exists. Use PUT to update.'
            }, { status: 400 });
        }
        
        // Create new meta tag
        const newMetaTag = {
            page: page.trim(),
            title: title.trim(),
            description: description.trim(),
            keywords: keywords?.trim() || '',
            ogImage: ogImage?.trim() || '',
            author: author?.trim() || 'JustJobsInfo Team',
            publishDate: publishDate || new Date().toISOString(),
            ogType: ogType || 'website',
            status: status || 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        console.log('💾 Inserting meta tag:', newMetaTag);
        
        const result = await collection.insertOne(newMetaTag);
        
        if (result.acknowledged) {
            const createdTag = {
                id: result.insertedId.toString(),
                ...newMetaTag
            };
            
            console.log('✅ Meta tag created successfully:', createdTag.id);
            
            return NextResponse.json({
                success: true,
                data: createdTag,
                message: 'Meta tag created successfully'
            });
        } else {
            throw new Error('Failed to insert meta tag');
        }
        
    } catch (error) {
        console.error('❌ Error creating meta tag:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create meta tag',
            details: error.message
        }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        console.log('🔄 Updating meta tag...');
        
        const body = await request.json();
        const { id, page, title, description, keywords, ogImage, author, publishDate, ogType, status } = body;
        
        // Validate required fields
        if (!id || !page || !title || !description) {
            return NextResponse.json({
                success: false,
                error: 'ID, page, title, and description are required'
            }, { status: 400 });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid meta tag ID'
            }, { status: 400 });
        }
        
        const collection = await getCollection('meta_tags');
        
        // Check if another meta tag with the same page name exists (excluding current one)
        const existingTag = await collection.findOne({ 
            page: { $regex: new RegExp(`^${page}$`, 'i') },
            _id: { $ne: new ObjectId(id) }
        });
        
        if (existingTag) {
            return NextResponse.json({
                success: false,
                error: 'Another meta tag for this page already exists'
            }, { status: 400 });
        }
        
        // Update meta tag
        const updateData = {
            page: page.trim(),
            title: title.trim(),
            description: description.trim(),
            keywords: keywords?.trim() || '',
            ogImage: ogImage?.trim() || '',
            author: author?.trim() || 'JustJobsInfo Team',
            publishDate: publishDate || new Date().toISOString(),
            ogType: ogType || 'website',
            status: status || 'active',
            updatedAt: new Date()
        };
        
        console.log('💾 Updating meta tag:', id, updateData);
        
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.modifiedCount > 0) {
            // Fetch the updated document
            const updatedTag = await collection.findOne({ _id: new ObjectId(id) });
            
            const formattedTag = {
                id: updatedTag._id.toString(),
                page: updatedTag.page,
                title: updatedTag.title,
                description: updatedTag.description,
                keywords: updatedTag.keywords,
                ogImage: updatedTag.ogImage,
                author: updatedTag.author || 'JustJobsInfo Team',
                publishDate: updatedTag.publishDate || updatedTag.createdAt,
                ogType: updatedTag.ogType || 'website',
                status: updatedTag.status,
                createdAt: updatedTag.createdAt,
                updatedAt: updatedTag.updatedAt
            };
            
            console.log('✅ Meta tag updated successfully:', id);
            
            return NextResponse.json({
                success: true,
                data: formattedTag,
                message: 'Meta tag updated successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Meta tag not found or no changes made'
            }, { status: 404 });
        }
        
    } catch (error) {
        console.error('❌ Error updating meta tag:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to update meta tag',
            details: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        console.log('🗑️ Deleting meta tag...');
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'Meta tag ID is required'
            }, { status: 400 });
        }
        
        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid meta tag ID'
            }, { status: 400 });
        }
        
        const collection = await getCollection('meta_tags');
        
        console.log('💾 Deleting meta tag:', id);
        
        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        
        if (result.deletedCount > 0) {
            console.log('✅ Meta tag deleted successfully:', id);
            
            return NextResponse.json({
                success: true,
                message: 'Meta tag deleted successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                error: 'Meta tag not found'
            }, { status: 404 });
        }
        
    } catch (error) {
        console.error('❌ Error deleting meta tag:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to delete meta tag',
            details: error.message
        }, { status: 500 });
    }
}
