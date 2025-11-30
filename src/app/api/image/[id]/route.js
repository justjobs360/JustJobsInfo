import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

// GET /api/image/[id] - Serve image from MongoDB
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image from MongoDB
    const collection = await getCollection('uploaded_images');
    const image = await collection.findOne({ _id: id });

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Return image with proper headers
    return new NextResponse(image.data, {
      status: 200,
      headers: {
        'Content-Type': image.type || 'image/jpeg',
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.filename || image.originalName || id}"`
      }
    });

  } catch (error) {
    console.error('❌ Error serving image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to serve image',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// DELETE /api/image/[id] - Delete image from MongoDB
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Delete image from MongoDB
    const collection = await getCollection('uploaded_images');
    const result = await collection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Image deleted from MongoDB: ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete image',
        details: error.message
      },
      { status: 500 }
    );
  }
}

