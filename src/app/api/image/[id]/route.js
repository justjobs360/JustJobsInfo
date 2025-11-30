import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { Binary } from 'mongodb';

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
    console.log('📦 Image data type:', image.data?.constructor?.name, 'Is Buffer:', Buffer.isBuffer(image.data));

    // Ensure data is a Buffer - MongoDB Binary type needs special handling
    let imageBuffer;
    try {
      // Check what type of data we have
      const dataType = image.data?.constructor?.name;
      console.log('📦 Processing image data type:', dataType);
      
      if (Buffer.isBuffer(image.data)) {
        // Already a Buffer
        imageBuffer = image.data;
        console.log('✅ Using Buffer directly');
      } else if (image.data instanceof Binary) {
        // MongoDB Binary type
        imageBuffer = Buffer.from(image.data.buffer);
        console.log('✅ Converted Binary to Buffer');
      } else if (image.data && image.data._bsontype === 'Binary') {
        // MongoDB Binary type (alternative check)
        imageBuffer = Buffer.from(image.data.buffer);
        console.log('✅ Converted Binary (_bsontype) to Buffer');
      } else if (image.data && image.data.buffer && Buffer.isBuffer(image.data.buffer)) {
        // Has buffer property that's a Buffer
        imageBuffer = image.data.buffer;
        console.log('✅ Using buffer property');
      } else if (image.data && image.data.buffer instanceof ArrayBuffer) {
        // Has buffer property that's an ArrayBuffer
        imageBuffer = Buffer.from(image.data.buffer);
        console.log('✅ Converted ArrayBuffer to Buffer');
      } else if (image.data instanceof Uint8Array) {
        imageBuffer = Buffer.from(image.data);
        console.log('✅ Converted Uint8Array to Buffer');
      } else if (typeof image.data === 'string') {
        // If stored as base64 string
        imageBuffer = Buffer.from(image.data, 'base64');
        console.log('✅ Converted base64 string to Buffer');
      } else if (image.data && Array.isArray(image.data)) {
        // If stored as array
        imageBuffer = Buffer.from(image.data);
        console.log('✅ Converted array to Buffer');
      } else {
        // Last resort - try to convert
        console.log('⚠️ Attempting last resort conversion');
        imageBuffer = Buffer.from(image.data);
      }
      
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error('Image buffer is empty or invalid');
      }
      
      console.log('✅ Image buffer created successfully:', imageBuffer.length, 'bytes');
    } catch (bufferError) {
      console.error('❌ Error creating image buffer:', bufferError);
      console.error('Image data sample:', image.data ? (typeof image.data === 'object' ? Object.keys(image.data) : 'not an object') : 'null/undefined');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to process image data',
          details: bufferError.message
        },
        { status: 500 }
      );
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

    // Validate buffer before returning
    if (!imageBuffer || imageBuffer.length === 0) {
      console.error('❌ Image buffer is empty');
      return NextResponse.json(
        { success: false, error: 'Image data is empty' },
        { status: 500 }
      );
    }

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${image.filename || image.originalName || id}"`,
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET'
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

