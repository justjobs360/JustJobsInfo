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
            "jobTitle": "Job title (include volunteer roles, internships, and all work experiences)",
            "company": "Company name or organization name",
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

CRITICAL – NAME MUST STAY IN PERSONAL DETAILS:
- The candidate's name is ALWAYS the first substantial line at the very top of the resume (e.g. "ADEDIBU OMOLOLA YETUNDE" or "John Smith"). It is typically 2–4 words, often in capitals or title case, with no numbers or job titles.
- This name line belongs ONLY in personalInfo (fullName, and derived firstName/lastName). Do NOT put the candidate's name in the experience array—not as jobTitle, not as company, not as description. Do NOT put it in summary or education.
- Each experience entry must be a real job: it has a job title (e.g. "Customer Support Officer"), a company/organization name (e.g. "Conwy Council"), and usually dates and bullet points. A single line that is clearly a person's name at the top is NOT a job—do not create an experience entry from it.

IMPORTANT:
- If a field is not found, use an empty string for strings, empty array for arrays, or empty object for objects. Never use null or omit keys.
- personalInfo – NAME: The first non-empty line at the top that looks like a person's name (2–4 words, no digits, not "Professional Summary" or "Work history") is the candidate's full name. Set it as fullName; set firstName to the first word and lastName to the remaining words (or lastName = first word, firstName = rest if surname-first). Never leave fullName empty when such a line exists.
- personalInfo – PHONE and EMAIL: Often on one line with bullet symbols (◆ • |). Extract phone (digits, with spaces/dashes/brackets if present) and email (full address with @). Strip decorative characters.
- experience: Only include real work/volunteer roles. Each entry must have jobTitle and company (employer name). Do not create an experience entry from the candidate's name line at the top. For each job's "description", keep it concise: combine bullet points into 2-4 sentences or a short paragraph (do NOT copy every bullet verbatim — summarise them). This keeps the output within token limits.
- Extract dates in a consistent format (prefer YYYY or MM/YYYY)
- For skills, categorize appropriately (technical vs soft)
- Include ALL actual work experiences in the experience array. Do NOT omit real jobs.
- Return ONLY valid JSON, no additional text before or after. Make sure the JSON is COMPLETE (ends with closing brace).
        `;

        const messages = [
            {
                role: "system",
                content: "You are an expert resume parser. Extract structured information from resumes accurately and return only valid JSON. The candidate's name is always the first line at the top of the resume—put it ONLY in personalInfo (fullName, firstName, lastName). Never put the candidate's name in experience, summary, or education."
            },
            {
                role: "user",
                content: prompt
            }
        ];

        let parsedData;

        // First attempt: strict JSON mode to prevent malformed output.
        // Use 4096 tokens – long CVs with many jobs can easily exceed 2000.
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages,
                max_tokens: 4096,
                temperature: 0.1,
                response_format: { type: "json_object" }
            });
            parsedData = safeParseModelJson(completion?.choices?.[0]?.message?.content || '');
        } catch (jsonModeError) {
            console.warn('⚠️ JSON mode failed, falling back to gpt-4:', jsonModeError?.message);
            // Fallback for models/providers that do not support response_format.
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages,
                max_tokens: 4096,
                temperature: 0.1
            });
            parsedData = safeParseModelJson(completion?.choices?.[0]?.message?.content || '');
        }

        // If still malformed, do one strict retry asking for compact valid JSON only.
        if (!parsedData) {
            console.warn('⚠️ First parse attempt failed, retrying with strict instructions...');
            const retryCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    ...messages,
                    {
                        role: "user",
                        content: "Your previous output was invalid JSON. Return ONLY a valid JSON object. No markdown fences, no comments, no trailing commas. Keep experience descriptions concise (max 2-3 sentences per job). Ensure the output is complete and ends with a closing }."
                    }
                ],
                max_tokens: 4096,
                temperature: 0,
                response_format: { type: "json_object" }
            });
            parsedData = safeParseModelJson(retryCompletion?.choices?.[0]?.message?.content || '');
        }

        // Validate and clean the data; merge hard fallback extraction from raw text.
        if (parsedData) {
            console.log('✅ Resume JSON parsed successfully. Experience entries:', parsedData.experience?.length || 0, ', Skills keys:', Object.keys(parsedData.skills || {}).join(','));
        } else {
            console.warn('⚠️ All JSON parse attempts failed. Using raw-text extraction only.');
        }
        return validateResumeData(parsedData || {}, resumeText);
    } catch (error) {
        console.error('Error parsing resume:', error);
        throw new Error('Failed to parse resume. Please ensure your resume contains readable text.');
    }
}

/** Ensure a value is a non-null string (no undefined in output). */
function str(v) {
    if (v == null || typeof v !== 'string') return '';
    return v;
}

/**
 * Safely parse model output into JSON.
 * Attempts direct parse, markdown-fence extraction, object-slice extraction,
 * and trailing-comma cleanup.
 */
function safeParseModelJson(responseText) {
    const text = str(responseText).trim();
    if (!text) return null;

    const candidates = [];
    candidates.push(text);

    const fenced = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/i);
    if (fenced?.[1]) candidates.push(fenced[1]);

    const direct = text.match(/\{[\s\S]*\}/);
    if (direct?.[0]) candidates.push(direct[0]);

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch {
            // Try one cleanup pass for common trailing comma issues.
            try {
                const cleaned = candidate.replace(/,\s*([}\]])/g, '$1');
                return JSON.parse(cleaned);
            } catch {
                // Continue trying next candidate.
            }
        }
    }

    return null;
}

/** Basic heading detector used when extracting likely name line. */
function isCommonSectionHeading(line) {
    const normalized = line.toLowerCase();
    return (
        normalized.includes('professional summary') ||
        normalized.includes('work history') ||
        normalized.includes('employment history') ||
        normalized.includes('education') ||
        normalized.includes('skills') ||
        normalized.includes('references') ||
        normalized.includes('projects')
    );
}

/**
 * Extract personal info directly from raw resume text as fallback.
 * This protects against LLM misclassification and malformed JSON cases.
 */
function extractPersonalInfoFromText(rawText) {
    const text = str(rawText).replace(/\u00a0/g, ' ');
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    // Find likely top name line (2-5 words, letters-only words, no digits/@).
    let fullName = '';
    for (const line of lines.slice(0, 12)) {
        if (line.length < 5 || line.length > 80) continue;
        if (/\d/.test(line) || line.includes('@') || isCommonSectionHeading(line)) continue;
        const cleaned = line.replace(/[^\p{L}\s.'-]/gu, ' ').replace(/\s+/g, ' ').trim();
        const words = cleaned.split(' ').filter(Boolean);
        if (words.length >= 2 && words.length <= 5) {
            fullName = cleaned;
            break;
        }
    }

    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const email = emailMatch ? emailMatch[0].trim() : '';

    // Pick first phone-like token with at least 10 digits.
    const phoneCandidates = text.match(/\+?\d[\d\s().-]{7,}\d/g) || [];
    const phone = phoneCandidates.find(candidate => (candidate.replace(/\D/g, '').length >= 10)) || '';

    const nameParts = fullName ? fullName.split(/\s+/) : [];
    return {
        fullName,
        firstName: nameParts[0] || '',
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
        email,
        phone: phone.trim()
    };
}

function normalizeWhitespace(value) {
    return str(value).replace(/\s+/g, ' ').trim().toLowerCase();
}

function isNameLeakInExperience(exp, fullName) {
    const normalizedFullName = normalizeWhitespace(fullName);
    if (!normalizedFullName) return false;

    const title = normalizeWhitespace(exp.jobTitle);
    const company = normalizeWhitespace(exp.company);
    const description = normalizeWhitespace(exp.description);
    const hasDates = Boolean(str(exp.startDate) || str(exp.endDate));

    // Name line accidentally placed as description/title with no true job metadata.
    const titleIsName = title === normalizedFullName;
    const descIsName = description === normalizedFullName;
    const noRealJobSignals = !company && !hasDates;

    return (titleIsName || descIsName) && noRealJobSignals;
}

/** Normalize one experience entry: accept alternate keys (title, organization) and ensure all fields are strings. */
function normalizeExperienceEntry(exp) {
    if (!exp || typeof exp !== 'object') return { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' };
    return {
        jobTitle: str(exp.jobTitle ?? exp.title ?? exp.role),
        company: str(exp.company ?? exp.organization ?? exp.employer),
        location: str(exp.location),
        startDate: str(exp.startDate ?? exp.start),
        endDate: str(exp.endDate ?? exp.end ?? ''),
        description: typeof exp.description === 'string' ? exp.description : Array.isArray(exp.description) ? (exp.description.join('\n')) : str(exp.description)
    };
}

/**
 * Validate and clean parsed resume data
 */
function validateResumeData(data, rawResumeText = '') {
    const pi = data.personalInfo || {};
    const extractedPersonal = extractPersonalInfoFromText(rawResumeText);

    const fullName = str(pi.fullName ?? pi.name) || extractedPersonal.fullName;
    const nameParts = fullName ? fullName.trim().split(/\s+/) : [];
    const firstName = str(pi.firstName || nameParts[0] || extractedPersonal.firstName);
    const lastName = str(pi.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '') || extractedPersonal.lastName);

    const normalizedExperience = Array.isArray(data.experience)
        ? data.experience.map(normalizeExperienceEntry).filter(exp => !isNameLeakInExperience(exp, fullName))
        : [];

    const validated = {
        personalInfo: {
            fullName: fullName || `${firstName} ${lastName}`.trim(),
            firstName,
            lastName,
            email: str(pi.email) || extractedPersonal.email,
            phone: str(pi.phone) || extractedPersonal.phone,
            location: str(pi.location),
            linkedin: str(pi.linkedin),
            website: str(pi.website)
        },
        summary: str(data.summary),
        education: Array.isArray(data.education) ? data.education : [],
        experience: normalizedExperience,
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
