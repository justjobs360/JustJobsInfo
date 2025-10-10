import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';
import { generateJobFitReport } from '@/utils/jobFitReportGenerator';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Get user ID from headers
        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required'
            }, { status: 401 });
        }

        // Validate ID format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid analysis ID'
            }, { status: 400 });
        }

        // Get the analysis from database
        const collection = await getCollection('job_fit_analyses');
        const analysis = await collection.findOne({ 
            _id: new ObjectId(id),
            userId: userId  // Ensure user can only access their own reports
        });

        if (!analysis) {
            return NextResponse.json({
                success: false,
                error: 'Analysis not found or you do not have permission to access it'
            }, { status: 404 });
        }

        // Generate DOCX report
        const reportBuffer = await generateJobFitReport(analysis);

        // Create filename
        const timestamp = new Date().toISOString().split('T')[0];
        const jobTitle = (analysis.jobTitle || 'Job').replace(/[^a-z0-9]/gi, '_');
        const fileName = `JobFit_${jobTitle}_${timestamp}.docx`;

        // Return the file
        return new NextResponse(reportBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': reportBuffer.length.toString(),
            },
        });

    } catch (error) {
        console.error('Error generating job fit report:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate report'
        }, { status: 500 });
    }
}

