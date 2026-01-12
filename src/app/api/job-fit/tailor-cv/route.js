import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import { parseResume } from '@/utils/resumeParser';
import { mapTailoredCVToResumeForm } from '@/utils/tailoredCVToResumeForm';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const jobDescription = formData.get('jobDescription');
        const resumeFile = formData.get('resumeFile');
        const templateId = formData.get('templateId') || '1';

        // Validate inputs
        if (!jobDescription || !resumeFile) {
            return NextResponse.json({
                success: false,
                error: 'Both job description and resume file are required.'
            }, { status: 400 });
        }

        if (jobDescription.length < 50) {
            return NextResponse.json({
                success: false,
                error: 'Job description must be at least 50 characters.'
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

        // Step 1: Parse resume to extract structured data
        console.log('📄 Parsing resume...');
        const resumeData = await parseResume(resumeContent);
        console.log('✅ Resume parsed successfully');

        // Step 2: Use OpenAI to tailor the CV content based on job description
        console.log('🤖 Tailoring CV with OpenAI...');
        const tailoringPrompt = `
You are an expert resume writer and career consultant specializing in ATS optimization and job-specific resume tailoring. Your task is to transform the provided resume to perfectly match the job description.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME INFORMATION:
${JSON.stringify(resumeData, null, 2)}

CRITICAL TAILORING REQUIREMENTS:

1. ANALYZE THE JOB DESCRIPTION FIRST:
   - Extract all key requirements, skills, qualifications, and responsibilities mentioned
   - Identify the most important keywords and phrases
   - Note the industry, role level, and company culture implied
   - Understand what the employer is really looking for

2. PROFESSIONAL SUMMARY:
   - Rewrite to open with the most relevant experience/qualification for THIS specific job
   - Include 2-3 key job requirements that match the candidate's background
   - Use exact keywords from the job description naturally
   - Make it immediately clear why this candidate is perfect for THIS role
   - Keep it to 2-3 sentences, maximum impact

3. WORK EXPERIENCE (MOST CRITICAL):
   - REORDER experiences to put the most relevant job FIRST (even if not chronologically first)
   - For each position, rewrite descriptions to:
     * Lead with achievements/responsibilities that match job requirements
     * Use the EXACT terminology and keywords from the job description
     * Emphasize transferable skills that apply to the target role
     * Include quantifiable metrics and achievements
     * Frame past experience in terms relevant to the new role
   - If a past job has skills mentioned in the job description, emphasize those heavily
   - If a past job seems unrelated, find and highlight transferable skills
   - Use bullet points with action verbs that match the job description's language
   - Each bullet should connect to something in the job description

4. SKILLS SECTION:
   - REORDER skills to put job-relevant skills FIRST
   - If the job mentions specific skills, ensure they appear prominently
   - Group skills to match how they're categorized in the job description
   - Remove or de-emphasize skills not mentioned in the job description
   - Use the exact skill names/terminology from the job description when possible
   - If the resume has skills that match job requirements, put them at the top

5. EDUCATION:
   - If education is relevant to the job, emphasize relevant coursework, projects, or achievements
   - If the job requires specific degrees/certifications, highlight those prominently
   - Otherwise, keep it concise

6. PROJECTS:
   - Only include projects relevant to the job description
   - Rewrite project descriptions to emphasize skills/technologies mentioned in the job
   - Frame projects in terms of their relevance to the target role
   - Remove projects that don't relate to the job

7. KEYWORD OPTIMIZATION:
   - Use exact keywords from the job description throughout the resume
   - Match the terminology and phrasing used in the job description
   - Ensure ATS systems will recognize the alignment
   - Natural integration - keywords should flow naturally, not feel forced

8. TONE AND LANGUAGE:
   - Match the professional tone of the job description
   - Use industry-standard terminology from the job description
   - Align with the level of formality implied by the job posting

Return a JSON object with this EXACT structure:
{
    "summary": "A compelling 2-3 sentence summary that immediately shows alignment with the job. Must include key job requirements and use keywords from the job description.",
    "experience": [
        {
            "jobTitle": "Original job title (keep exact)",
            "company": "Original company name (keep exact)",
            "location": "Original location (keep exact)",
            "startDate": "Original start date (keep exact)",
            "endDate": "Original end date (keep exact)",
            "description": "COMPLETELY REWRITTEN description using bullet points. Each bullet should: (1) Use keywords from job description, (2) Emphasize achievements/skills relevant to the job, (3) Include metrics, (4) Frame experience in terms of the target role. Prioritize most relevant responsibilities first."
        }
    ],
    "education": [
        {
            "degree": "Original degree (keep exact)",
            "school": "Original school (keep exact)",
            "location": "Original location (keep exact)",
            "startDate": "Original start date (keep exact)",
            "endDate": "Original end date (keep exact)",
            "gpa": "Original GPA if provided (keep exact)",
            "description": "If education is highly relevant to job, add description emphasizing relevance. Otherwise, leave empty string."
        }
    ],
    "skills": {
        "technical": ["REORDERED list - job-relevant skills FIRST. Use exact terminology from job description. Remove skills not mentioned in job if space is limited."],
        "soft": ["REORDERED list - job-relevant soft skills FIRST. Match terminology from job description."],
        "languages": ["Keep only if relevant to job"],
        "certifications": ["Keep only if relevant to job, prioritize job-relevant ones first"]
    },
    "projects": [
        {
            "name": "Original project name (keep exact)",
            "description": "REWRITTEN to emphasize relevance to job. Use keywords from job description. Frame in terms of target role.",
            "technologies": ["Filter to only technologies mentioned in job description or highly relevant"],
            "date": "Original date (keep exact)"
        }
    ]
}

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements - only reframe what exists
- ALWAYS prioritize job-relevant content - put it first
- ALWAYS use keywords from the job description naturally
- REORDER content to match job relevance, not chronology
- Make every word count toward showing job fit
- The resume should read like it was written specifically for THIS job
- Return ONLY valid JSON, no additional text or explanations
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert resume writer and ATS optimization specialist. Your expertise is in transforming generic resumes into job-specific, keyword-optimized documents that perfectly match job descriptions. You excel at identifying transferable skills, reordering content for relevance, and using exact terminology from job postings. You NEVER fabricate information - only reframe and reorder existing content to maximize job fit."
                },
                {
                    role: "user",
                    content: tailoringPrompt
                }
            ],
            max_tokens: 4000,
            temperature: 0.2
        });

        const tailoringResponse = completion.choices[0].message.content.trim();
        
        // Extract JSON from response
        let tailoredJsonText = tailoringResponse;
        const jsonMatch = tailoringResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            tailoredJsonText = jsonMatch[1];
        } else {
            const directMatch = tailoringResponse.match(/\{[\s\S]*\}/);
            if (directMatch) {
                tailoredJsonText = directMatch[0];
            }
        }

        const tailoredData = JSON.parse(tailoredJsonText);
        console.log('✅ CV tailored successfully');

        // Step 3: Merge tailored content with original personal info
        // Ensure we use tailored data, but fallback to original if tailoring didn't provide it
        // Also ensure all description fields are strings
        const normalizeExperience = (exp) => {
            if (!exp) return null;
            return {
                ...exp,
                description: typeof exp.description === 'string' 
                    ? exp.description 
                    : Array.isArray(exp.description) 
                        ? exp.description.join('\n')
                        : String(exp.description || '')
            };
        };

        const normalizeEducation = (edu) => {
            if (!edu) return null;
            return {
                ...edu,
                description: typeof edu.description === 'string' 
                    ? edu.description 
                    : Array.isArray(edu.description) 
                        ? edu.description.join('\n')
                        : String(edu.description || '')
            };
        };

        const normalizeProject = (proj) => {
            if (!proj) return null;
            return {
                ...proj,
                description: typeof proj.description === 'string' 
                    ? proj.description 
                    : Array.isArray(proj.description) 
                        ? proj.description.join('\n')
                        : String(proj.description || '')
            };
        };

        const finalCVData = {
            personalInfo: resumeData.personalInfo || {},
            summary: typeof tailoredData.summary === 'string' 
                ? tailoredData.summary 
                : (resumeData.summary || ''),
            // Reorder experience by relevance if tailored data exists, normalize descriptions
            experience: (tailoredData.experience && tailoredData.experience.length > 0) 
                ? tailoredData.experience.map(normalizeExperience).filter(Boolean)
                : (resumeData.experience || []).map(normalizeExperience).filter(Boolean),
            education: (tailoredData.education && tailoredData.education.length > 0)
                ? tailoredData.education.map(normalizeEducation).filter(Boolean)
                : (resumeData.education || []).map(normalizeEducation).filter(Boolean),
            // Use tailored skills which should be reordered and filtered
            skills: tailoredData.skills || resumeData.skills || {
                technical: [],
                soft: [],
                languages: [],
                certifications: []
            },
            // Filter projects to only relevant ones, normalize descriptions
            projects: (tailoredData.projects && tailoredData.projects.length > 0)
                ? tailoredData.projects.map(normalizeProject).filter(Boolean)
                : (resumeData.projects || []).map(normalizeProject).filter(Boolean),
            additionalInfo: resumeData.additionalInfo || {}
        };

        // Log tailoring summary for debugging
        console.log('📊 Tailoring Summary:');
        console.log(`   - Summary tailored: ${!!tailoredData.summary}`);
        console.log(`   - Experience items: ${finalCVData.experience.length}`);
        console.log(`   - Skills reordered: ${!!tailoredData.skills}`);
        console.log(`   - Projects filtered: ${finalCVData.projects.length}`);

        // Step 4: Map tailored CV data to resume builder form structure
        console.log('📝 Mapping CV data to resume form...');
        const resumeForm = mapTailoredCVToResumeForm(finalCVData);
        
        // Determine sections to include based on available data
        const sectionsToInclude = ['personal']; // Always include personal for header
        if (resumeForm.summary) sectionsToInclude.push('summary');
        if (resumeForm.employment && resumeForm.employment[0]?.jobTitle) sectionsToInclude.push('employment');
        if (resumeForm.education && resumeForm.education[0]?.degree) sectionsToInclude.push('education');
        if (resumeForm.skills && resumeForm.skills.length > 0) sectionsToInclude.push('skills');
        if (resumeForm.projects && resumeForm.projects[0]?.name) sectionsToInclude.push('projects');
        
        // Step 5: Store form data and redirect to resume builder
        // Generate a unique key for storing the data (without prefix, will be added in sessionStorage)
        const dataKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store the form data temporarily (client will read from sessionStorage)
        // We'll return the data in the response and the client will store it
        console.log('✅ CV data mapped successfully, redirecting to resume builder...');

        return NextResponse.json({
            success: true,
            data: {
                cvData: finalCVData,
                resumeForm: resumeForm,
                sections: sectionsToInclude.length > 1 ? sectionsToInclude : ['personal', 'summary', 'employment', 'education', 'skills'],
                templateId: parseInt(templateId),
                redirectUrl: `/resume-builder/template/${templateId}?tailored=true&dataKey=${dataKey}`,
                dataKey: dataKey // Also return the dataKey separately for easier access
            }
        });

    } catch (error) {
        console.error('CV tailoring error:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'insufficient_quota') {
            return NextResponse.json({
                success: false,
                error: 'Service temporarily unavailable. Please try again later.'
            }, { status: 503 });
        }
        
        if (error.code === 'rate_limit_exceeded') {
            return NextResponse.json({
                success: false,
                error: 'Too many requests. Please wait a moment and try again.'
            }, { status: 429 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to tailor CV. Please try again.'
        }, { status: 500 });
    }
}
