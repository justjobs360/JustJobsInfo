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
        const resumeFile = formData.get('resumeFile');
        const auditData = formData.get('auditData'); // JSON string of audit results
        const templateId = formData.get('templateId') || '1';

        // Validate inputs
        if (!resumeFile || !auditData) {
            return NextResponse.json({
                success: false,
                error: 'Both resume file and audit data are required.'
            }, { status: 400 });
        }

        // Parse audit data
        let audit;
        try {
            audit = JSON.parse(auditData);
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid audit data format.'
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

        // Step 2: Use OpenAI to tailor the CV based on audit recommendations
        console.log('🤖 Tailoring CV based on audit recommendations...');
        
        // Build recommendations summary from audit data
        const recommendationsSummary = `
AUDIT SCORE: ${audit.score}/100

STRENGTHS IDENTIFIED:
${(audit.strengths || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS TO IMPROVE:
${(audit.weaknesses || []).map((w, i) => `${i + 1}. ${w}`).join('\n')}

RECOMMENDATIONS:
${(audit.improvements || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}

ATS COMPATIBILITY ISSUES:
${(audit.atsCompatibility || []).map((ats, i) => `${i + 1}. ${ats}`).join('\n')}

ANNOTATIONS (if available):
${(audit.annotations || []).map((ann, i) => `${i + 1}. [${ann.section}] ${ann.issue} - Suggestion: ${ann.suggestion}`).join('\n')}
        `.trim();

        const tailoringPrompt = `
You are an expert resume writer and career consultant specializing in resume optimization and ATS enhancement. Your task is to improve the provided resume based on the audit recommendations and problems identified.

AUDIT ANALYSIS AND RECOMMENDATIONS:
${recommendationsSummary}

ORIGINAL RESUME INFORMATION:
${JSON.stringify(resumeData, null, 2)}

CRITICAL IMPROVEMENT REQUIREMENTS:

1. ADDRESS ALL WEAKNESSES:
   - Review each "Area to Improve" from the audit
   - Fix formatting issues, missing information, or unclear descriptions
   - Enhance weak sections with more detail and impact
   - Remove or improve problematic content

2. IMPLEMENT RECOMMENDATIONS:
   - Apply each recommendation from the audit
   - Add missing sections if recommended (e.g., summary, skills, certifications)
   - Improve existing sections based on suggestions
   - Enhance ATS compatibility as suggested

3. MAINTAIN STRENGTHS:
   - Keep all identified strengths intact
   - Enhance strong sections further if possible
   - Don't remove content that was identified as a strength

4. FIX ATS COMPATIBILITY ISSUES:
   - Address all ATS compatibility problems identified
   - Use standard section headings
   - Ensure proper formatting for ATS parsing
   - Add relevant keywords naturally
   - Fix any formatting that could confuse ATS systems

5. IMPROVE PROFESSIONAL SUMMARY:
   - If missing or weak, create a compelling 2-3 sentence summary
   - Highlight key qualifications and experience
   - Use industry-standard keywords
   - Make it ATS-friendly

6. ENHANCE WORK EXPERIENCE:
   - Improve descriptions to be more impactful and specific
   - Add quantifiable achievements where possible
   - Use action verbs and industry keywords
   - Ensure proper formatting for ATS
   - Address any issues mentioned in annotations

7. OPTIMIZE SKILLS SECTION:
   - Ensure skills are properly categorized
   - Add missing relevant skills if identified in audit
   - Use standard skill names for ATS compatibility
   - Remove outdated or irrelevant skills if recommended

8. IMPROVE EDUCATION SECTION:
   - Add missing information if recommended
   - Format consistently for ATS
   - Include relevant coursework or achievements if suggested

9. FIX ANNOTATIONS:
   - Address each specific annotation issue
   - Implement the suggested fixes
   - Ensure all sections are properly formatted

10. OVERALL OPTIMIZATION:
    - Ensure consistent formatting throughout
    - Use professional language and terminology
    - Make the resume more ATS-friendly
    - Improve readability and visual hierarchy
    - Fix any grammar or spelling issues

Return a JSON object with this EXACT structure:
{
    "summary": "Improved professional summary (2-3 sentences) that addresses audit recommendations. If original was good, enhance it. If missing or weak, create a new one.",
    "experience": [
        {
            "jobTitle": "Original job title (keep exact)",
            "company": "Original company name (keep exact)",
            "location": "Original location (keep exact)",
            "startDate": "Original start date (keep exact)",
            "endDate": "Original end date (keep exact)",
            "description": "IMPROVED description addressing audit recommendations. Fix formatting issues, add quantifiable achievements, use action verbs, ensure ATS compatibility, and address any specific issues mentioned in annotations."
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
            "description": "If education section needs improvement per audit, add description. Otherwise, leave empty string."
        }
    ],
    "skills": {
        "technical": ["IMPROVED list - address audit recommendations, add missing skills, use standard names for ATS"],
        "soft": ["IMPROVED list - address audit recommendations, add missing skills"],
        "languages": ["Keep if relevant, improve if needed"],
        "certifications": ["Add if recommended in audit, improve formatting if needed"]
    },
    "projects": [
        {
            "name": "Original project name (keep exact)",
            "description": "IMPROVED description addressing audit recommendations",
            "technologies": ["Filter and improve based on audit"],
            "date": "Original date (keep exact)"
        }
    ]
}

CRITICAL RULES:
- NEVER fabricate experience, skills, or achievements - only improve what exists
- ADDRESS every weakness and recommendation from the audit
- FIX all ATS compatibility issues identified
- IMPLEMENT all suggestions from annotations
- MAINTAIN all strengths identified in the audit
- IMPROVE formatting, clarity, and impact throughout
- The resume should be significantly better after these improvements
- Return ONLY valid JSON, no additional text or explanations
        `;

        // Try with JSON mode first (gpt-4o supports it), fallback to regular mode
        let completion;
        let tailoringResponse;
        
        try {
            // Try with gpt-4o and JSON mode first
            completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert resume writer and ATS optimization specialist. Your expertise is in improving resumes based on audit feedback. You address weaknesses, implement recommendations, fix ATS issues, and enhance overall quality. You NEVER fabricate information - only improve and optimize existing content."
                    },
                    {
                        role: "user",
                        content: tailoringPrompt
                    }
                ],
                max_tokens: 4000,
                temperature: 0.2,
                response_format: { type: "json_object" }
            });
            tailoringResponse = completion.choices[0].message.content.trim();
        } catch (jsonModeError) {
            // Fallback to gpt-4 without JSON mode
            console.log('⚠️ JSON mode not supported, falling back to regular mode');
            try {
                completion = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert resume writer and ATS optimization specialist. Your expertise is in improving resumes based on audit feedback. You address weaknesses, implement recommendations, fix ATS issues, and enhance overall quality. You NEVER fabricate information - only improve and optimize existing content. You MUST return ONLY valid JSON without any additional text, explanations, or markdown formatting. Your response must start with { and end with }."
                        },
                        {
                            role: "user",
                            content: tailoringPrompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.2
                });
                tailoringResponse = completion.choices[0].message.content.trim();
            } catch (fallbackError) {
                console.error('OpenAI API error:', fallbackError);
                throw fallbackError;
            }
        }

        // Check if response contains an error message
        if (tailoringResponse.toLowerCase().includes("i'm sorry") || 
            tailoringResponse.toLowerCase().includes("i apologize") ||
            tailoringResponse.toLowerCase().startsWith("sorry") ||
            tailoringResponse.toLowerCase().startsWith("error")) {
            console.error('❌ OpenAI returned an error message:', tailoringResponse);
            return NextResponse.json({
                success: false,
                error: 'OpenAI was unable to process the request. Please try again or contact support if the issue persists.'
            }, { status: 500 });
        }
        
        // Extract JSON from response
        let tailoredJsonText = tailoringResponse;
        
        // Try to extract JSON from markdown code blocks first
        const jsonMatch = tailoringResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            tailoredJsonText = jsonMatch[1];
        } else {
            // Try to find JSON object directly
            const directMatch = tailoringResponse.match(/\{[\s\S]*\}/);
            if (directMatch) {
                tailoredJsonText = directMatch[0];
            } else {
                // If no JSON found, log the response and return error
                console.error('❌ No JSON found in OpenAI response:', tailoringResponse.substring(0, 500));
                return NextResponse.json({
                    success: false,
                    error: 'Invalid response format from AI service. Please try again.'
                }, { status: 500 });
            }
        }

        // Parse JSON with better error handling
        let tailoredData;
        try {
            tailoredData = JSON.parse(tailoredJsonText);
        } catch (parseError) {
            console.error('❌ JSON parsing error:', parseError);
            console.error('❌ Response text (first 500 chars):', tailoringResponse.substring(0, 500));
            console.error('❌ Extracted JSON text (first 500 chars):', tailoredJsonText.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: 'Failed to parse AI response. Please try again or contact support if the issue persists.'
            }, { status: 500 });
        }
        
        console.log('✅ CV tailored successfully based on audit recommendations');

        // Step 3: Merge tailored content with original personal info
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
            experience: (tailoredData.experience && tailoredData.experience.length > 0) 
                ? tailoredData.experience.map(normalizeExperience).filter(Boolean)
                : (resumeData.experience || []).map(normalizeExperience).filter(Boolean),
            education: (tailoredData.education && tailoredData.education.length > 0)
                ? tailoredData.education.map(normalizeEducation).filter(Boolean)
                : (resumeData.education || []).map(normalizeEducation).filter(Boolean),
            skills: tailoredData.skills || resumeData.skills || {
                technical: [],
                soft: [],
                languages: [],
                certifications: []
            },
            projects: (tailoredData.projects && tailoredData.projects.length > 0)
                ? tailoredData.projects.map(normalizeProject).filter(Boolean)
                : (resumeData.projects || []).map(normalizeProject).filter(Boolean),
            additionalInfo: resumeData.additionalInfo || {}
        };

        // Log tailoring summary for debugging
        console.log('📊 Tailoring Summary:');
        console.log(`   - Summary improved: ${!!tailoredData.summary}`);
        console.log(`   - Experience items: ${finalCVData.experience.length}`);
        console.log(`   - Skills improved: ${!!tailoredData.skills}`);
        console.log(`   - Projects improved: ${finalCVData.projects.length}`);

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
        const dataKey = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('✅ CV data mapped successfully, redirecting to resume builder...');

        return NextResponse.json({
            success: true,
            data: {
                cvData: finalCVData,
                resumeForm: resumeForm,
                sections: sectionsToInclude.length > 1 ? sectionsToInclude : ['personal', 'summary', 'employment', 'education', 'skills'],
                templateId: parseInt(templateId),
                redirectUrl: `/resume-builder/template/${templateId}?tailored=true&dataKey=${dataKey}`,
                dataKey: dataKey
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
