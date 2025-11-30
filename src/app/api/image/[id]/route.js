import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

// GET /api/image/[id] - Serve image from MongoDB
export async function GET(request, { params }) {
  try {
    let { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image from MongoDB - try exact match first
    const collection = await getCollection('uploaded_images');
    let image = await collection.findOne({ _id: id });
    
    // If not found and no extension, try to find by ID without extension
    if (!image && !id.includes('.')) {
      // Try to find image that starts with this ID
      const images = await collection.find({ _id: { $regex: `^${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` } }).toArray();
      if (images.length > 0) {
        image = images[0];
        id = image._id; // Update id to match found image
      }
    }

    if (!image) {
      console.error('❌ Image not found in MongoDB:', id);
      return NextResponse.json(
        { success: false, error: 'Image not found', id: id },
        { status: 404 }
      );
    }

    console.log('✅ Image found:', id, 'Type:', image.type, 'Size:', image.size);

    // Ensure data is a Buffer
    let imageBuffer;
    if (Buffer.isBuffer(image.data)) {
      imageBuffer = image.data;
    } else if (image.data instanceof Uint8Array) {
      imageBuffer = Buffer.from(image.data);
    } else if (typeof image.data === 'string') {
      // If stored as base64 string
      imageBuffer = Buffer.from(image.data, 'base64');
    } else {
      // Try to convert to buffer
      imageBuffer = Buffer.from(image.data);
    }

    // Determine Content-Type from extension if not in image.type
    let contentType = image.type;
    if (!contentType && image.extension) {
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
      };
      contentType = mimeTypes[image.extension.toLowerCase()] || 'image/jpeg';
    }
    if (!contentType) {
      // Try to get from filename
      const ext = id.split('.').pop()?.toLowerCase();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml'
      };
      contentType = mimeTypes[ext] || 'image/jpeg';
    }

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.filename || image.originalName || id}"`,
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff'
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

