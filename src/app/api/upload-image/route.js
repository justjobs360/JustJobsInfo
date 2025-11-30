import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

// POST /api/upload-image - Upload image file to MongoDB
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');
    const type = formData.get('type') || 'blog'; // 'blog', 'banner', or 'author'

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No image file provided' 
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'File size too large. Maximum size is 5MB.' 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique ID with extension
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop().toLowerCase();
    const imageId = `${type}_${timestamp}_${randomString}.${extension}`;

    // Store image in MongoDB
    const collection = await getCollection('uploaded_images');
    
    const imageDocument = {
      _id: imageId,
      filename: file.name,
      originalName: file.name,
      type: file.type,
      size: file.size,
      category: type, // 'blog', 'banner', 'author', etc.
      extension: extension,
      data: buffer, // Store binary data
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await collection.insertOne(imageDocument);

    // Return the API URL to serve the image (with extension for better compatibility)
    const publicUrl = `/api/image/${imageId}`;

    console.log(`✅ Image uploaded successfully to MongoDB: ${imageId}`);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        id: imageId,
        filename: file.name,
        size: file.size,
        type: file.type
      },
      message: 'Image uploaded successfully to database'
    });

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload image',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
