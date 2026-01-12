/**
 * API endpoint to generate DOCX files using resume builder template logic
 * This centralizes DOCX generation so both resume builder and CV tailoring can use it
 */

import { NextResponse } from 'next/server';
import { generateResumeDOCX } from '@/utils/resumeTemplateDOCXGenerator';

export async function POST(request) {
    try {
        const body = await request.json();
        const { form, sections = ["personal", "summary", "employment", "education", "skills"], customSections = [], templateId = 1 } = body;

        if (!form) {
            return NextResponse.json(
                { success: false, error: 'Form data is required' },
                { status: 400 }
            );
        }

        // Generate DOCX using the resume template generator
        const docxBlob = await generateResumeDOCX(form, sections, customSections, parseInt(templateId));

        // Convert blob to buffer then to base64 for response
        const arrayBuffer = await docxBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Docx = buffer.toString('base64');

        return NextResponse.json({
            success: true,
            data: {
                docxBase64: base64Docx,
                fileName: `${form?.firstName || 'resume'}_${form?.lastName || ''}.docx`
            }
        });

    } catch (error) {
        console.error('DOCX generation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate DOCX' },
            { status: 500 }
        );
    }
}
