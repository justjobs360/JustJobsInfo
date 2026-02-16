import { NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { parseResume } from '@/utils/resumeParser';
import { mapTailoredCVToResumeForm } from '@/utils/tailoredCVToResumeForm';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const resumeFile = formData.get('resumeFile');
        const templateId = formData.get('templateId') || '1';

        if (!resumeFile) {
            return NextResponse.json({
                success: false,
                error: 'Resume file is required.'
            }, { status: 400 });
        }

        // Validate file
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!allowedTypes.includes(resumeFile.type) && !resumeFile.name.toLowerCase().endsWith('.docx') && !resumeFile.name.toLowerCase().endsWith('.doc')) {
            return NextResponse.json({
                success: false,
                error: 'Please upload a DOCX or DOC file.'
            }, { status: 400 });
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (resumeFile.size > maxSize) {
            return NextResponse.json({
                success: false,
                error: 'File size must be less than 5MB.'
            }, { status: 400 });
        }

        // Extract text from DOCX/DOC file
        let resumeContent = '';
        try {
            const arrayBuffer = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const result = await mammoth.extractRawText({ buffer });
            resumeContent = result.value;

            if (!resumeContent || resumeContent.trim().length < 50) {
                return NextResponse.json({
                    success: false,
                    error: 'Could not extract sufficient text from the resume file. Please ensure the file contains readable text.'
                }, { status: 400 });
            }
        } catch (extractError) {
            console.error('Error extracting text from file:', extractError);
            return NextResponse.json({
                success: false,
                error: 'Failed to process the resume file. Please ensure it is a valid DOCX or DOC file.'
            }, { status: 400 });
        }

        // Parse resume into structured data, with a basic fallback if parsing fails
        let resumeData;
        try {
            console.log('📄 Parsing resume for template import...');
            resumeData = await parseResume(resumeContent);
            console.log('✅ Resume parsed successfully for template import');
        } catch (parseError) {
            console.warn('⚠️ Resume parser failed during template import, using raw content fallback:', parseError?.message);
            resumeData = {
                personalInfo: {},
                summary: '',
                education: [],
                experience: [{
                    jobTitle: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    description: resumeContent
                }],
                skills: {
                    technical: [],
                    soft: [],
                    languages: [],
                    certifications: []
                },
                projects: [],
                additionalInfo: {}
            };
        }

        const finalCVData = {
            personalInfo: resumeData.personalInfo || {},
            summary: resumeData.summary || '',
            experience: resumeData.experience || [],
            education: resumeData.education || [],
            skills: resumeData.skills || {
                technical: [],
                soft: [],
                languages: [],
                certifications: []
            },
            projects: resumeData.projects || [],
            additionalInfo: resumeData.additionalInfo || {}
        };

        // Map to resume builder form structure
        console.log('📝 Mapping imported resume data to resume builder form...');
        const resumeForm = mapTailoredCVToResumeForm(finalCVData);

        // Determine sections to include based on available data
        const sectionsToInclude = ['personal']; // Always include personal for header
        if (resumeForm.summary) sectionsToInclude.push('summary');
        if (resumeForm.employment && resumeForm.employment.some(e => e && (e.jobTitle || e.company || e.desc))) sectionsToInclude.push('employment');
        if (resumeForm.education && resumeForm.education.some(e => e && (e.degree || e.school))) sectionsToInclude.push('education');
        if (resumeForm.skills && resumeForm.skills.length > 0 && resumeForm.skills.some(s => s && (typeof s === 'string' ? s.trim() : s.name))) sectionsToInclude.push('skills');
        if (resumeForm.projects && resumeForm.projects.some(p => p && p.name)) sectionsToInclude.push('projects');

        const dataKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log('✅ Resume imported and mapped successfully, redirecting to resume builder template...');

        return NextResponse.json({
            success: true,
            data: {
                resumeForm,
                sections: sectionsToInclude.length > 1 ? sectionsToInclude : ['personal', 'summary', 'employment', 'education', 'skills'],
                templateId: parseInt(templateId),
                redirectUrl: `/resume-builder/template/${templateId}?import=true&dataKey=${dataKey}`,
                dataKey
            }
        });
    } catch (error) {
        console.error('Resume import error:', error);

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to import resume into template. Please try again.'
        }, { status: 500 });
    }
}

