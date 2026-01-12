import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Parse resume text to extract structured data using OpenAI
 * @param {string} resumeText - The raw text extracted from the resume
 * @returns {Promise<Object>} Structured resume data
 */
export async function parseResume(resumeText) {
    try {
        const prompt = `
You are an expert resume parser. Extract structured information from the following resume text.

RESUME TEXT:
${resumeText}

Extract the following information and return it as a JSON object with this EXACT structure:
{
    "personalInfo": {
        "fullName": "Full name of the candidate",
        "firstName": "First name",
        "lastName": "Last name",
        "email": "Email address if found",
        "phone": "Phone number if found",
        "location": "City, State/Country if found",
        "linkedin": "LinkedIn URL if found",
        "website": "Personal website if found"
    },
    "summary": "Professional summary or objective if present",
    "education": [
        {
            "degree": "Degree name (e.g., Bachelor of Science in Computer Science)",
            "school": "School/University name",
            "location": "Location of school",
            "startDate": "Start date (YYYY or MM/YYYY)",
            "endDate": "End date (YYYY or MM/YYYY or 'Present')",
            "gpa": "GPA if mentioned",
            "description": "Additional details or honors"
        }
    ],
    "experience": [
        {
            "jobTitle": "Job title",
            "company": "Company name",
            "location": "Job location",
            "startDate": "Start date (YYYY or MM/YYYY)",
            "endDate": "End date (YYYY or MM/YYYY or 'Present')",
            "description": "Job description, responsibilities, and achievements"
        }
    ],
    "skills": {
        "technical": ["Technical skill 1", "Technical skill 2"],
        "soft": ["Soft skill 1", "Soft skill 2"],
        "languages": ["Language 1", "Language 2"],
        "certifications": ["Certification 1", "Certification 2"]
    },
    "projects": [
        {
            "name": "Project name",
            "description": "Project description",
            "technologies": ["Tech 1", "Tech 2"],
            "date": "Project date if mentioned"
        }
    ],
    "additionalInfo": {
        "awards": ["Award 1", "Award 2"],
        "publications": ["Publication 1"],
        "volunteerWork": ["Volunteer work description"],
        "interests": ["Interest 1", "Interest 2"]
    }
}

IMPORTANT:
- If a field is not found, use an empty string for strings, empty array for arrays, or empty object for objects
- Extract dates in a consistent format (prefer YYYY or MM/YYYY)
- For skills, categorize them appropriately (technical vs soft skills)
- Preserve all important details from the resume
- Return ONLY valid JSON, no additional text before or after
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert resume parser. Extract structured information from resumes accurately and return only valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.1
        });

        const responseText = completion.choices[0].message.content.trim();
        
        // Extract JSON from response (handle cases where there might be markdown code blocks)
        let jsonText = responseText;
        const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        } else {
            // Try to find JSON object directly
            const directMatch = responseText.match(/\{[\s\S]*\}/);
            if (directMatch) {
                jsonText = directMatch[0];
            }
        }

        const parsedData = JSON.parse(jsonText);
        
        // Validate and clean the data
        return validateResumeData(parsedData);
    } catch (error) {
        console.error('Error parsing resume:', error);
        throw new Error('Failed to parse resume. Please ensure your resume contains readable text.');
    }
}

/**
 * Validate and clean parsed resume data
 */
function validateResumeData(data) {
    const validated = {
        personalInfo: {
            fullName: data.personalInfo?.fullName || '',
            firstName: data.personalInfo?.firstName || '',
            lastName: data.personalInfo?.lastName || '',
            email: data.personalInfo?.email || '',
            phone: data.personalInfo?.phone || '',
            location: data.personalInfo?.location || '',
            linkedin: data.personalInfo?.linkedin || '',
            website: data.personalInfo?.website || ''
        },
        summary: data.summary || '',
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        skills: {
            technical: Array.isArray(data.skills?.technical) ? data.skills.technical : [],
            soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
            languages: Array.isArray(data.skills?.languages) ? data.skills.languages : [],
            certifications: Array.isArray(data.skills?.certifications) ? data.skills.certifications : []
        },
        projects: Array.isArray(data.projects) ? data.projects : [],
        additionalInfo: {
            awards: Array.isArray(data.additionalInfo?.awards) ? data.additionalInfo.awards : [],
            publications: Array.isArray(data.additionalInfo?.publications) ? data.additionalInfo.publications : [],
            volunteerWork: Array.isArray(data.additionalInfo?.volunteerWork) ? data.additionalInfo.volunteerWork : [],
            interests: Array.isArray(data.additionalInfo?.interests) ? data.additionalInfo.interests : []
        }
    };

    return validated;
}
