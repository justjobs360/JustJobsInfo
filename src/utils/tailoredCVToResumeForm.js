/**
 * Normalizes bullet point formatting - splits sentences within bullet points into separate bullets
 * This function is idempotent - can be called multiple times safely
 */
function normalizeBulletPoints(text) {
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
    
    // Helper function to ensure exactly one bullet at the start
    // NOTE: We DON'T add bullets here because templates add their own bullets
    // We just ensure proper line breaks for splitting
    const ensureSingleBullet = (str) => {
        if (!str || !str.trim()) return str;
        // Just return cleaned content without adding bullet - templates will add it
        return removeLeadingBullets(str);
    };
    
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
}

/**
 * Maps tailored CV data to resume builder form structure
 * @param {Object} tailoredCVData - The tailored CV data from OpenAI
 * @returns {Object} Form data structure compatible with resume builder
 */
function safeStr(v) {
    if (v == null || typeof v !== 'string') return '';
    return v;
}

export function mapTailoredCVToResumeForm(tailoredCVData) {
    const raw = tailoredCVData || {};
    const personalInfo = raw.personalInfo || {};
    const summary = raw.summary;
    const experience = raw.experience;
    const education = raw.education;
    const skills = raw.skills;
    const projects = raw.projects;
    const additionalInfo = raw.additionalInfo;

    // Map personal info - never output undefined
    const fullName = safeStr(personalInfo.fullName || personalInfo.name) || `${safeStr(personalInfo.firstName)} ${safeStr(personalInfo.lastName)}`.trim();
    const nameParts = fullName ? fullName.split(/\s+/).filter(Boolean) : [];
    const firstName = safeStr(nameParts[0] || personalInfo.firstName);
    const lastName = safeStr(nameParts.length > 1 ? nameParts.slice(1).join(' ') : personalInfo.lastName);

    // Map location
    const locationParts = safeStr(personalInfo.location).split(',').map(p => p.trim()).filter(Boolean);
    const city = locationParts[0] || '';
    const country = locationParts.slice(1).join(', ') || '';

    // Map employment/experience - accept alternate keys (title, organization) and apply bullet normalization
    const employment = (Array.isArray(experience) ? experience : []).map(exp => {
        let description = typeof exp.description === 'string'
            ? exp.description
            : Array.isArray(exp.description)
                ? exp.description.join('\n')
                : safeStr(exp.description);
        description = normalizeBulletPoints(description);
        return {
            jobTitle: safeStr(exp.jobTitle ?? exp.title ?? exp.role),
            company: safeStr(exp.company ?? exp.organization ?? exp.employer),
            start: safeStr(exp.startDate ?? exp.start),
            end: safeStr(exp.endDate ?? exp.end) || 'Present',
            location: safeStr(exp.location),
            desc: description
        };
    });

    // Map education - apply bullet point normalization
    const educationMapped = (education || []).map(edu => {
        let description = typeof edu.description === 'string' 
            ? edu.description 
            : Array.isArray(edu.description) 
                ? edu.description.join('\n')
                : String(edu.description || '');
        
        // Normalize bullet points
        description = normalizeBulletPoints(description);
        
        return {
            degree: edu.degree || '',
            school: edu.school || '',
            start: edu.startDate || '',
            end: edu.endDate || '',
            location: edu.location || '',
            desc: description
        };
    });

    // Map skills - combine technical and soft skills
    const skillsMapped = [];
    if (skills) {
        if (skills.technical && Array.isArray(skills.technical)) {
            skills.technical.forEach(skill => {
                skillsMapped.push({
                    name: typeof skill === 'string' ? skill : skill.name || '',
                    level: typeof skill === 'object' && skill.level ? skill.level : 'Intermediate'
                });
            });
        }
        if (skills.soft && Array.isArray(skills.soft)) {
            skills.soft.forEach(skill => {
                skillsMapped.push({
                    name: typeof skill === 'string' ? skill : skill.name || '',
                    level: typeof skill === 'object' && skill.level ? skill.level : 'Intermediate'
                });
            });
        }
    }

    // Map projects - apply bullet point normalization
    const projectsMapped = (projects || []).map(proj => {
        let description = typeof proj.description === 'string' 
            ? proj.description 
            : Array.isArray(proj.description) 
                ? proj.description.join('\n')
                : String(proj.description || '');
        
        // Normalize bullet points
        description = normalizeBulletPoints(description);
        
        return {
            name: proj.name || '',
            date: proj.date || '',
            desc: description
        };
    });

    // Map certifications
    const certifications = (skills?.certifications || []).map(cert => 
        typeof cert === 'string' ? cert : String(cert || '')
    );

    // Map languages
    const languages = (skills?.languages || []).map(lang => 
        typeof lang === 'string' ? lang : String(lang || '')
    );

    // Get jobTitle from first employment entry with a title, or personalInfo
    const firstJobWithTitle = employment.find(j => j && (j.jobTitle || j.company));
    const jobTitle = firstJobWithTitle?.jobTitle || safeStr(personalInfo.jobTitle);

    return {
        jobTitle: safeStr(jobTitle),
        firstName,
        lastName,
        tagline: '',
        phone: safeStr(personalInfo.phone),
        email: safeStr(personalInfo.email),
        linkedin: safeStr(personalInfo.linkedin),
        address: '',
        city,
        country,
        moreDetails: false,
        summary: safeStr(summary),
        employment: employment.length > 0 ? employment : [{ jobTitle: '', company: '', start: '', end: '', location: '', desc: '' }],
        education: educationMapped.length > 0 ? educationMapped : [{ degree: '', school: '', start: '', end: '', location: '', desc: '' }],
        skills: skillsMapped.length > 0 ? skillsMapped : [{ name: '', level: 'Intermediate' }],
        certifications: certifications.length > 0 ? certifications : [''],
        languages: languages.length > 0 ? languages : [''],
        projects: projectsMapped.length > 0 ? projectsMapped : [{ name: '', date: '', desc: '' }],
        profileImage: null
    };
}
