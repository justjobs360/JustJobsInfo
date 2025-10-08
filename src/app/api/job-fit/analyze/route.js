import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    try {
        const formData = await request.formData();
        const jobDescription = formData.get('jobDescription');
        const resumeFile = formData.get('resumeFile');

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

        if (jobDescription.length > 5000) {
            return NextResponse.json({
                success: false,
                error: 'Job description cannot exceed 5000 characters.'
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

        // Create the analysis prompt
        const analysisPrompt = `
You are an expert career counselor and HR professional. Analyze the job fit between the provided job description and resume content. Provide an objective, honest, and transparent assessment.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeContent}

Conduct a comprehensive analysis across multiple dimensions:

1. HARD SKILLS: Technical abilities, tools, software, programming languages, etc.
2. SOFT SKILLS: Communication, leadership, teamwork, problem-solving, etc.
3. EXPERIENCE LEVEL: Years of experience, seniority, career progression
4. EDUCATION: Degrees, certifications, specialized training
5. KEYWORDS MATCH: Industry-specific terms and requirements
6. TRANSFERABLE SKILLS: Skills from different contexts that apply to this role

SCORING CRITERIA (0-100):
- 80-100: Excellent/Strong Fit - Candidate meets or exceeds most requirements
- 60-79: Good/Partial Fit - Candidate has transferable skills and some gaps
- 40-59: Moderate Fit - Significant gaps but potential with development
- 0-39: Weak Fit - Major misalignment with role requirements

Provide your analysis in JSON format with this EXACT structure:
{
    "fitScore": [number 0-100],
    "scoreBreakdown": {
        "hardSkills": [percentage 0-100],
        "softSkills": [percentage 0-100],
        "experience": [percentage 0-100],
        "education": [percentage 0-100],
        "keywordMatch": [percentage 0-100],
        "transferableSkills": [percentage 0-100]
    },
    "fitLevel": "[Excellent Fit|Good Fit|Moderate Fit|Weak Fit]",
    "strengths": [
        "Specific strength 1 with evidence from resume",
        "Specific strength 2 with evidence from resume",
        "Specific strength 3 with evidence from resume",
        "Specific strength 4 with evidence from resume",
        "Specific strength 5 with evidence from resume"
    ],
    "gaps": [
        "Specific gap 1 explaining what's missing",
        "Specific gap 2 explaining what's missing",
        "Specific gap 3 explaining what's missing",
        "Specific gap 4 explaining what's missing",
        "Specific gap 5 explaining what's missing"
    ],
    "recommendations": [
        "Actionable recommendation 1 to bridge gaps",
        "Actionable recommendation 2 to bridge gaps",
        "Actionable recommendation 3 to bridge gaps",
        "Actionable recommendation 4 to bridge gaps",
        "Actionable recommendation 5 to bridge gaps"
    ],
    "scoringRationale": "Clear explanation of how the score was calculated, mentioning percentage matches and key factors",
    "jobTitle": "[Extract job title from description]",
    "companyName": "[Extract company name if available, otherwise 'Not specified']",
    "industrySector": "[Identify industry: IT, Finance, Healthcare, Marketing, etc.]"
}

IMPORTANT INSTRUCTIONS:
- Be completely honest and transparent - do NOT sugarcoat results
- Provide specific evidence from the resume for each strength
- Clearly explain what's missing for each gap
- Give practical, actionable recommendations
- Consider transferable skills intelligently (e.g., project management in different industries)
- Include industry-specific context in your evaluation
- Explain the scoring rationale with specific percentages and reasons
- Use concrete examples rather than vague statements
        `;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert career counselor and HR professional specializing in job fit analysis. Provide objective, constructive feedback to help candidates improve their job applications."
                },
                {
                    role: "user",
                    content: analysisPrompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.3
        });

        const analysisText = completion.choices[0].message.content;

        // Parse the JSON response
        let analysisData;
        try {
            // Extract JSON from the response (in case there's extra text)
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysisData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Error parsing OpenAI response:', parseError);
            console.error('Raw response:', analysisText);
            return NextResponse.json({
                success: false,
                error: 'Failed to parse analysis results. Please try again.'
            }, { status: 500 });
        }

        // Validate the response structure
        if (!analysisData.fitScore || 
            !analysisData.strengths || 
            !analysisData.gaps || 
            !analysisData.recommendations) {
            return NextResponse.json({
                success: false,
                error: 'Invalid analysis format received. Please try again.'
            }, { status: 500 });
        }

        // Ensure fitScore is a number between 0-100
        analysisData.fitScore = Math.max(0, Math.min(100, parseInt(analysisData.fitScore)));

        // Validate score breakdown if present
        if (analysisData.scoreBreakdown) {
            Object.keys(analysisData.scoreBreakdown).forEach(key => {
                analysisData.scoreBreakdown[key] = Math.max(0, Math.min(100, parseInt(analysisData.scoreBreakdown[key] || 0)));
            });
        }

        // Ensure arrays have the right number of items
        analysisData.strengths = analysisData.strengths.slice(0, 5);
        analysisData.gaps = analysisData.gaps.slice(0, 5);
        analysisData.recommendations = analysisData.recommendations.slice(0, 5);

        // Add fit level if not provided
        if (!analysisData.fitLevel) {
            if (analysisData.fitScore >= 80) analysisData.fitLevel = 'Excellent Fit';
            else if (analysisData.fitScore >= 60) analysisData.fitLevel = 'Good Fit';
            else if (analysisData.fitScore >= 40) analysisData.fitLevel = 'Moderate Fit';
            else analysisData.fitLevel = 'Weak Fit';
        }

        // Add scoring rationale if not provided
        if (!analysisData.scoringRationale) {
            analysisData.scoringRationale = `Based on the analysis, the candidate achieved a fit score of ${analysisData.fitScore}/100, indicating a ${analysisData.fitLevel.toLowerCase()}.`;
        }

        return NextResponse.json({
            success: true,
            data: analysisData
        });

    } catch (error) {
        console.error('Job fit analysis error:', error);
        
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
            error: 'Failed to analyze job fit. Please try again.'
        }, { status: 500 });
    }
}
