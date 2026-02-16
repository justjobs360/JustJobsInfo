import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import { getCollection } from '@/utils/mongodb';

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

        // Extract text from DOCX/DOC file and store file buffer
        let resumeContent = '';
        let resumeFileBuffer = null;
        try {
            const arrayBuffer = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            resumeFileBuffer = buffer; // Store for database
            const result = await mammoth.extractRawText({ buffer });
            resumeContent = result.value;

            if (!resumeContent || resumeContent.trim().length < 100) {
                return NextResponse.json({
                    success: false,
                    error: 'Could not extract sufficient text from the resume file. Please ensure the file contains readable text and is not corrupted. Minimum 100 characters required.'
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
You are an expert career counselor and HR professional. Analyze the job fit between the provided job description and resume content. Provide an objective, honest, and transparent assessment, but avoid being unrealistically harsh.

JOB DESCRIPTION:
${jobDescription}

RESUME CONTENT:
${resumeContent}

Conduct a comprehensive analysis across multiple dimensions:

1. HARD SKILLS: Technical abilities, tools, software, programming languages, etc.
2. SOFT SKILLS: Communication, leadership, teamwork, problem-solving, etc.
3. EXPERIENCE LEVEL: 
   - Calculate the total years of experience from the resume (sum of all employment durations)
   - Extract the required years of experience from the job description (e.g., "5+ years", "3-5 years", "minimum 2 years")
   - Compare the candidate's actual years of experience with the job requirements
   - Assess seniority level (entry-level, mid-level, senior, executive) and match with job level
   - Evaluate career progression and advancement trajectory
4. EDUCATION: Degrees, certifications, specialized training
5. KEYWORDS MATCH: Industry-specific terms and requirements
6. TRANSFERABLE SKILLS: Skills from different contexts that apply to this role

SCORING CRITERIA (0-100) - USE THE FULL RANGE:
- 85-100: Excellent/Strong Fit - Candidate meets or exceeds most core requirements and is clearly very well aligned.
- 80-84: Good Fit - Candidate has strong alignment with most requirements, with only minor or manageable gaps.
- 60-79: Moderate Fit - Candidate has a reasonable foundation and transferable skills, but noticeable gaps exist.
- 40-59: Weak Fit - Major gaps and misalignment with role requirements. Reserve this band for candidates who clearly do not yet meet several important requirements.
- 0-39: Poor Fit - Severe misalignment with role requirements. Use this only when the resume is largely unrelated to the role.

IMPORTANT SCORING BEHAVIOUR:
- If a candidate meets MOST of the core requirements in the job description (even with some gaps), their overall fitScore should GENERALLY NOT be lower than the high 70s or low 80s.
- Only push scores below 60 when there are clear, significant gaps in multiple critical areas (skills, experience level, and domain fit).
- Use moderate sub-scores (50–80 range) for partial matches instead of defaulting to very low numbers unless the mismatch is obvious.

Provide your analysis in JSON format with this EXACT structure:
{
    "fitScore": [number 0-100],
    "scoreBreakdown": {
        "hardSkills": {
            "score": [percentage 0-100],
            "resumeItems": ["Skill 1 found on resume", "Skill 2 found on resume"],
            "jobItems": ["Required skill 1 from job", "Required skill 2 from job"]
        },
        "softSkills": {
            "score": [percentage 0-100],
            "resumeItems": ["Soft skill 1 demonstrated", "Soft skill 2 demonstrated"],
            "jobItems": ["Required soft skill 1", "Required soft skill 2"]
        },
        "experience": {
            "score": [percentage 0-100],
            "resumeItems": ["Experience 1", "Experience 2"],
            "jobItems": ["Required experience 1", "Required experience 2"],
            "yearsOfExperience": {
                "candidateYears": [number - total years calculated from resume],
                "requiredYears": [number or range - extracted from job description, e.g., 5 or "3-5" or null if not specified],
                "match": [boolean - true if candidate meets or exceeds requirement],
                "analysis": "Detailed comparison of candidate's years vs required years"
            }
        },
        "education": {
            "score": [percentage 0-100],
            "resumeItems": ["Qualification 1", "Qualification 2"],
            "jobItems": ["Required qualification 1", "Required qualification 2"]
        },
        "keywordMatch": {
            "score": [percentage 0-100],
            "resumeItems": ["Keyword 1", "Keyword 2"],
            "jobItems": ["Required keyword 1", "Required keyword 2"]
        },
        "transferableSkills": {
            "score": [percentage 0-100],
            "resumeItems": ["Transferable skill 1", "Transferable skill 2"],
            "jobItems": ["Applicable skill 1", "Applicable skill 2"]
        }
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
    "atsOptimization": [
        "ATS tip 1 specific to this resume and job",
        "ATS tip 2 specific to this resume and job",
        "ATS tip 3 specific to this resume and job",
        "ATS tip 4 specific to this resume and job",
        "ATS tip 5 specific to this resume and job"
    ],
    "scoringRationale": "Clear explanation of how the score was calculated, mentioning percentage matches and key factors. Use paragraph breaks (\\n) to separate different points for readability.",
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
            max_tokens: 4000,
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
        const originalFitScore = Math.max(0, Math.min(100, parseInt(analysisData.fitScore)));
        analysisData.fitScore = originalFitScore;

        // Validate score breakdown if present and normalise sub-scores
        if (analysisData.scoreBreakdown) {
            Object.keys(analysisData.scoreBreakdown).forEach(key => {
                // Handle both old format (number) and new format (object with score)
                if (typeof analysisData.scoreBreakdown[key] === 'object') {
                    analysisData.scoreBreakdown[key].score = Math.max(0, Math.min(100, parseInt(analysisData.scoreBreakdown[key].score || 0)));
                    // Ensure arrays exist
                    if (!analysisData.scoreBreakdown[key].resumeItems) analysisData.scoreBreakdown[key].resumeItems = [];
                    if (!analysisData.scoreBreakdown[key].jobItems) analysisData.scoreBreakdown[key].jobItems = [];
                } else {
                    // Old format - just a number
                    analysisData.scoreBreakdown[key] = Math.max(0, Math.min(100, parseInt(analysisData.scoreBreakdown[key] || 0)));
                }
            });

            // Compute a weighted average from sub-scores to smooth extremes
            const breakdown = analysisData.scoreBreakdown;
            const weightConfig = {
                hardSkills: 1.2,
                softSkills: 0.8,
                experience: 1.3,
                education: 0.7,
                keywordMatch: 1.0,
                transferableSkills: 0.8
            };

            let weightedSum = 0;
            let totalWeight = 0;

            Object.keys(weightConfig).forEach(key => {
                const weight = weightConfig[key];
                const value = breakdown[key];
                if (value !== undefined && value !== null) {
                    const score = typeof value === 'object' ? (value.score ?? 0) : value;
                    const numeric = Math.max(0, Math.min(100, parseInt(score || 0)));
                    weightedSum += numeric * weight;
                    totalWeight += weight;
                }
            });

            if (totalWeight > 0) {
                const subScoreAverage = weightedSum / totalWeight;

                // Blend model's original score with sub-score average
                let blendedScore = (0.65 * subScoreAverage) + (0.35 * originalFitScore);

                // Apply a gentle upward bias for mid-range candidates (45–70 band)
                if (blendedScore >= 45 && blendedScore <= 70) {
                    const t = (blendedScore - 45) / (70 - 45); // 0 to 1
                    const boost = 3 + (t * 5); // between 3 and 8 points
                    blendedScore += boost;
                }

                // Never boost clearly poor fits; cap everything into 0–100
                blendedScore = Math.max(0, Math.min(100, blendedScore));
                analysisData.fitScore = Math.round(blendedScore);

                console.log('📊 Job fit score normalisation:', {
                    originalFitScore,
                    subScoreAverage: Math.round(subScoreAverage),
                    finalFitScore: analysisData.fitScore
                });
            }
        }

        // Ensure arrays have the right number of items
        analysisData.strengths = analysisData.strengths.slice(0, 5);
        analysisData.gaps = analysisData.gaps.slice(0, 5);
        analysisData.recommendations = analysisData.recommendations.slice(0, 5);
        if (analysisData.atsOptimization) {
            analysisData.atsOptimization = analysisData.atsOptimization.slice(0, 5);
        }

        // Add fit level if not provided
        if (!analysisData.fitLevel) {
            if (analysisData.fitScore >= 85) analysisData.fitLevel = 'Excellent Fit';
            else if (analysisData.fitScore >= 80) analysisData.fitLevel = 'Good Fit';
            else if (analysisData.fitScore >= 60) analysisData.fitLevel = 'Moderate Fit';
            else if (analysisData.fitScore >= 40) analysisData.fitLevel = 'Weak Fit';
            else analysisData.fitLevel = 'Poor Fit';
        }

        // Add scoring rationale if not provided
        if (!analysisData.scoringRationale) {
            analysisData.scoringRationale = `Based on the analysis, the candidate achieved a fit score of ${analysisData.fitScore}/100, indicating a ${analysisData.fitLevel.toLowerCase()}.`;
        }

        // Save to MongoDB for admin stats
        try {
            const collection = await getCollection('job_fit_analyses');
            
            // Get user info from headers (sent by client)
            const userId = request.headers.get('x-user-id') || null;
            const userEmail = request.headers.get('x-user-email') || 'Guest User';
            const isAuthenticated = !!userId;
            
            await collection.insertOne({
                ...analysisData,
                jobDescription: jobDescription.substring(0, 500), // Store first 500 chars for reference
                resumeFileName: resumeFile.name,
                resumeFileSize: resumeFile.size,
                resumeFileType: resumeFile.type,
                resumeFileData: resumeFileBuffer, // Store actual file for later download
                userId,
                userEmail,
                isAuthenticated,
                userType: isAuthenticated ? 'Registered' : 'Guest',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            console.log('✅ Job fit analysis saved to database');
        } catch (dbError) {
            console.error('❌ Error saving to database:', dbError);
            // Don't fail the request if database save fails
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
