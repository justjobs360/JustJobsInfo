import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Validate ID format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid analysis ID'
            }, { status: 400 });
        }

        // Get the analysis from database
        const collection = await getCollection('job_fit_analyses');
        const analysis = await collection.findOne({ _id: new ObjectId(id) });

        if (!analysis) {
            return NextResponse.json({
                success: false,
                error: 'Analysis not found'
            }, { status: 404 });
        }

        // Check if resume file data exists
        if (!analysis.resumeFileData || !analysis.resumeFileData.buffer) {
            return NextResponse.json({
                success: false,
                error: 'Resume file not available for this analysis'
            }, { status: 404 });
        }

        // Get the file buffer
        const fileBuffer = Buffer.from(analysis.resumeFileData.buffer);
        const fileName = analysis.resumeFileName || 'resume.docx';
        const fileType = analysis.resumeFileType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Return the file
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': fileType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('Error downloading resume file:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to download resume file'
        }, { status: 500 });
    }
}

