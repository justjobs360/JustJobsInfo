import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/upload-image - Upload image file
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${type}_${timestamp}_${randomString}.${extension}`;

    // Create upload directory based on type
    const uploadDir = join(process.cwd(), 'public', 'uploads', type);
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file to disk
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${type}/${filename}`;

    console.log(`✅ Image uploaded successfully: ${publicUrl}`);

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        filename: filename,
        size: file.size,
        type: file.type
      },
      message: 'Image uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload image',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 