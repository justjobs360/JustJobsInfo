import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log('📥 CV download requested for ID:', id);
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid CV ID'
      }, { status: 400 });
    }
    
    // Get the cv_audits collection
    const collection = await getCollection('cv_audits');
    
    // Find the CV by ID
    const cv = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!cv) {
      console.log('❌ CV not found:', id);
      return NextResponse.json({
        success: false,
        error: 'CV not found'
      }, { status: 404 });
    }
    
    console.log('✅ CV found:', {
      fileName: cv.fileName,
      fileSize: cv.fileSize,
      fileType: cv.fileType
    });
    
    // Check if file data exists
    if (!cv.fileData) {
      console.log('❌ No file data found for CV:', id);
      return NextResponse.json({
        success: false,
        error: 'File data not available'
      }, { status: 404 });
    }
    
    // Convert Buffer to ArrayBuffer for response
    const fileBuffer = cv.fileData.buffer || cv.fileData;
    
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', cv.fileType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${cv.fileName}"`);
    headers.set('Content-Length', cv.fileSize.toString());
    
    console.log('📤 Sending file:', {
      fileName: cv.fileName,
      contentType: cv.fileType,
      size: cv.fileSize
    });
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('❌ Error downloading CV:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to download CV',
      details: error.message
    }, { status: 500 });
  }
}

// Also support POST method for consistency
export async function POST(request, { params }) {
  return GET(request, { params });
}
