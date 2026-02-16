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

        if (jobDescription.trim().length < 50) {
            return NextResponse.json({
                success: false,
                error: 'Job description must be at least 50 characters. Please provide more details about the position.'
            }, { status: 400 });
        }

        // Allow up to 50,000 characters with a warning (but still process)
        if (jobDescription.length > 50000) {
            return NextResponse.json({
                success: false,
                error: 'Job description cannot exceed 50,000 characters. Please provide a more concise version.'
            }, { status: 400 });
        }
        
        // Log warning if exceeds recommended limit
        if (jobDescription.length > 10000) {
            console.warn(`⚠️ Job description exceeds recommended limit: ${jobDescription.length} characters (recommended: 10,000)`);
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

        // Step 1: Parse resume to extract structured data (with fallback if parsing fails)
        let resumeData;
        try {
            console.log('📄 Parsing resume...');
            resumeData = await parseResume(resumeContent);
            console.log('✅ Resume parsed successfully');
        } catch (parseError) {
            // Analysis already used this same content successfully, so use it for tailoring
            console.warn('⚠️ Resume parser failed, using raw content for tailoring:', parseError?.message);
            resumeData = {
                personalInfo: {},
                summary: resumeContent.trim().substring(0, 500) || '',
                education: [],
                experience: [{ jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: resumeContent }],
                skills: { technical: [], soft: [], languages: [], certifications: [] },
                projects: [],
                additionalInfo: {}
            };
        }

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
   - CRITICAL: You MUST include ALL experiences from the original resume. Count them carefully - if the original has 8 experiences, your response MUST have 8 experiences. Do NOT omit any experiences, including volunteer work, internships, part-time jobs, or older positions. You may REORDER them, but you must include EVERY single one.
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
   - CRITICAL FORMATTING: (1) Each achievement/responsibility MUST be on its own separate line with a bullet point. (2) Use newlines (\n) between EVERY bullet point. (3) DO NOT put multiple achievements in one bullet point separated by periods. (4) Each sentence/achievement gets its own bullet. Format as: "• First achievement\n• Second achievement\n• Third achievement" NOT "• First achievement. Second achievement. Third achievement."

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
            "description": "COMPLETELY REWRITTEN description using bullet points. CRITICAL FORMATTING RULES: (1) Each achievement/responsibility MUST be on its own separate line with a bullet point. (2) Use newlines (\\n) between EVERY bullet point. (3) DO NOT put multiple achievements in one bullet point separated by periods. (4) Each sentence/achievement gets its own bullet. Example CORRECT format: \"• First achievement with keywords and metrics\\n• Second achievement with different keywords\\n• Third achievement relevant to job\". Example WRONG format: \"• First achievement. Second achievement. Third achievement.\" Each bullet should: (1) Use keywords from job description, (2) Emphasize ONE achievement/skill relevant to the job, (3) Include metrics when possible, (4) Frame experience in terms of the target role. Prioritize most relevant responsibilities first."
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
- CRITICAL: You MUST return ALL experiences from the original resume. Do NOT omit any experiences, including volunteer work, internships, or older positions. Every single experience entry must be included in your response, even if you reorder them.
- Make every word count toward showing job fit
- The resume should read like it was written specifically for THIS job
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
                        content: "You are an expert resume writer and ATS optimization specialist. Your expertise is in transforming generic resumes into job-specific, keyword-optimized documents that perfectly match job descriptions. You excel at identifying transferable skills, reordering content for relevance, and using exact terminology from job postings. You NEVER fabricate information - only reframe and reorder existing content to maximize job fit. You MUST return ONLY valid JSON without any additional text, explanations, or markdown formatting."
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
                            content: "You are an expert resume writer and ATS optimization specialist. Your expertise is in transforming generic resumes into job-specific, keyword-optimized documents that perfectly match job descriptions. You excel at identifying transferable skills, reordering content for relevance, and using exact terminology from job postings. You NEVER fabricate information - only reframe and reorder existing content to maximize job fit. You MUST return ONLY valid JSON without any additional text, explanations, or markdown formatting. Your response must start with { and end with }."
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
        
        console.log('✅ CV tailored successfully');

        // Helper function to normalize bullet point formatting
        // This function is idempotent - can be called multiple times safely
        const normalizeBulletPoints = (text) => {
            if (!text || typeof text !== 'string') return text;
            
            const bulletChars = ['•', '·', '▪', '▫', '◦', '‣', '⁃'];
            const defaultBullet = '•';
            
            // Helper function to remove all leading bullets and optional " - " dash, return clean content
            const removeLeadingBullets = (str) => {
                let cleaned = str.trim();
                while (bulletChars.some(char => cleaned.startsWith(char))) {
                    cleaned = cleaned.substring(1).trim();
                }
                // Remove extra " - " or " -" or "- " after bullet (e.g. "• - Lead a team" -> "Lead a team")
                cleaned = cleaned.replace(/^\s*-\s*/, '').trim();
                return cleaned;
            };
            
            // NOTE: We DON'T add bullets here because templates add their own bullets
            // We just ensure proper line breaks for splitting
            
            // Process text line by line
            const lines = text.split('\n');
            const processedLines = [];
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) {
                    processedLines.push(line);
                    continue;
                }
                
                // First, remove ALL leading bullets to get clean content
                const cleanContent = removeLeadingBullets(trimmedLine);
                
                if (!cleanContent) {
                    processedLines.push(line);
                    continue;
                }
                
                // Check if content has multiple sentences that should be split
                const sentenceCount = cleanContent.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim()).length;
                const shouldSplit = sentenceCount > 1 && cleanContent.length > 100;
                
                if (shouldSplit) {
                    // Split into multiple bullets
                    let sentences = cleanContent.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(s => s.trim());
                    
                    // If that didn't work, try more aggressive splitting
                    if (sentences.length <= 1 && cleanContent.length > 80) {
                        sentences = cleanContent.split(/(?<=[.!?])\s+/).filter(s => s.trim() && s.length > 20);
                    }
                    
                    if (sentences.length <= 1 && cleanContent.length > 150) {
                        const parts = cleanContent.split(/\.\s+/);
                        if (parts.length > 1) {
                            sentences = parts
                                .map((part, index) => {
                                    const trimmed = part.trim();
                                    if (index < parts.length - 1 && !trimmed.match(/[.!?]$/)) {
                                        return trimmed + '.';
                                    }
                                    return trimmed;
                                })
                                .filter(s => s.trim().length > 20);
                        }
                    }
                    
                    // Filter sentences - don't add bullets, templates will add them
                    sentences = sentences
                        .filter(s => s.trim().length > 15)
                        .map(s => removeLeadingBullets(s.trim()));
                    
                    if (sentences.length > 1) {
                        // Join with newlines - templates will add bullets to each line
                        processedLines.push(sentences.join('\n'));
                    } else if (sentences.length === 1) {
                        processedLines.push(sentences[0]);
                    } else {
                        processedLines.push(removeLeadingBullets(cleanContent));
                    }
                } else {
                    // Single sentence or short content - just clean, don't add bullet
                    processedLines.push(removeLeadingBullets(cleanContent));
                }
            }
            
            return processedLines.join('\n');
        };

        // Step 3: Merge tailored content with original personal info
        // Ensure we use tailored data, but fallback to original if tailoring didn't provide it
        // Also ensure all description fields are strings
        const normalizeExperience = (exp) => {
            if (!exp) return null;
            let description = typeof exp.description === 'string' 
                ? exp.description 
                : Array.isArray(exp.description) 
                    ? exp.description.join('\n')
                    : String(exp.description || '');
            
            // Normalize bullet points
            description = normalizeBulletPoints(description);
            
            return {
                ...exp,
                description
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

        // Merge tailored experiences with original ones to ensure ALL experiences are preserved
        // Create a map of tailored experiences by jobTitle+company+startDate for matching
        const tailoredExpMap = new Map();
        if (tailoredData.experience && tailoredData.experience.length > 0) {
            tailoredData.experience.forEach(exp => {
                const key = `${(exp.jobTitle || '').toLowerCase().trim()}_${(exp.company || '').toLowerCase().trim()}_${(exp.startDate || '').toLowerCase().trim()}`;
                tailoredExpMap.set(key, exp);
            });
        }
        
        // Merge: use tailored version if available, otherwise use original
        const originalExperiences = (resumeData.experience || []).map(normalizeExperience).filter(Boolean);
        const mergedExperiences = originalExperiences.map(origExp => {
            const key = `${(origExp.jobTitle || '').toLowerCase().trim()}_${(origExp.company || '').toLowerCase().trim()}_${(origExp.startDate || '').toLowerCase().trim()}`;
            const tailoredExp = tailoredExpMap.get(key);
            if (tailoredExp) {
                // Use tailored version (with improved description)
                return normalizeExperience(tailoredExp);
            }
            // Keep original if not in tailored data
            return origExp;
        });
        
        // Also add any new experiences from tailored data that weren't in original (shouldn't happen, but safety check)
        const originalKeys = new Set(originalExperiences.map(exp => 
            `${(exp.jobTitle || '').toLowerCase().trim()}_${(exp.company || '').toLowerCase().trim()}_${(exp.startDate || '').toLowerCase().trim()}`
        ));
        tailoredData.experience?.forEach(exp => {
            const key = `${(exp.jobTitle || '').toLowerCase().trim()}_${(exp.company || '').toLowerCase().trim()}_${(exp.startDate || '').toLowerCase().trim()}`;
            if (!originalKeys.has(key)) {
                mergedExperiences.push(normalizeExperience(exp));
            }
        });
        
        // Convert volunteer work from additionalInfo to experience entries if not already included
        if (resumeData.additionalInfo?.volunteerWork && Array.isArray(resumeData.additionalInfo.volunteerWork)) {
            resumeData.additionalInfo.volunteerWork.forEach(volunteer => {
                // Check if this volunteer work is already in experiences
                const volunteerLower = (volunteer || '').toLowerCase();
                const isAlreadyIncluded = mergedExperiences.some(exp => {
                    const expText = `${exp.jobTitle || ''} ${exp.company || ''} ${exp.description || ''}`.toLowerCase();
                    return expText.includes(volunteerLower) || volunteerLower.includes(exp.jobTitle?.toLowerCase() || '');
                });
                
                if (!isAlreadyIncluded && volunteer && volunteer.trim()) {
                    // Add as a new experience entry
                    mergedExperiences.push(normalizeExperience({
                        jobTitle: volunteer.includes('Volunteer') ? volunteer : `Volunteer - ${volunteer}`,
                        company: 'Volunteer Organization',
                        location: '',
                        startDate: '',
                        endDate: '',
                        description: volunteer
                    }));
                }
            });
        }

        const finalCVData = {
            personalInfo: resumeData.personalInfo || {},
            summary: typeof tailoredData.summary === 'string' 
                ? tailoredData.summary 
                : (resumeData.summary || ''),
            // Use merged experiences (tailored where available, original otherwise)
            experience: mergedExperiences,
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
        console.log(`   - Original experiences: ${(resumeData.experience || []).length}`);
        console.log(`   - Tailored experiences returned: ${(tailoredData.experience || []).length}`);
        console.log(`   - Final merged experiences: ${finalCVData.experience.length}`);
        console.log(`   - Summary tailored: ${!!tailoredData.summary}`);
        console.log(`   - Skills reordered: ${!!tailoredData.skills}`);
        console.log(`   - Projects filtered: ${finalCVData.projects.length}`);
        
        // Warn if experiences were lost
        if (finalCVData.experience.length < (resumeData.experience || []).length) {
            console.warn(`⚠️ WARNING: Some experiences may have been lost. Original: ${(resumeData.experience || []).length}, Final: ${finalCVData.experience.length}`);
        }

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
