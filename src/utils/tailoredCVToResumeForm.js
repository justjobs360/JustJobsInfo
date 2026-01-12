/**
 * Maps tailored CV data to resume builder form structure
 * @param {Object} tailoredCVData - The tailored CV data from OpenAI
 * @returns {Object} Form data structure compatible with resume builder
 */
export function mapTailoredCVToResumeForm(tailoredCVData) {
    const { personalInfo, summary, experience, education, skills, projects, additionalInfo } = tailoredCVData;

    // Map personal info
    const nameParts = (personalInfo.fullName || `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || '').split(' ');
    const firstName = nameParts[0] || personalInfo.firstName || '';
    const lastName = nameParts.slice(1).join(' ') || personalInfo.lastName || '';

    // Map location
    const locationParts = (personalInfo.location || '').split(',').map(p => p.trim());
    const city = locationParts[0] || '';
    const country = locationParts.slice(1).join(', ') || '';

    // Map employment/experience
    const employment = (experience || []).map(exp => ({
        jobTitle: exp.jobTitle || '',
        company: exp.company || '',
        start: exp.startDate || '',
        end: exp.endDate || 'Present',
        location: exp.location || '',
        desc: typeof exp.description === 'string' 
            ? exp.description 
            : Array.isArray(exp.description) 
                ? exp.description.join('\n')
                : String(exp.description || '')
    }));

    // Map education
    const educationMapped = (education || []).map(edu => ({
        degree: edu.degree || '',
        school: edu.school || '',
        start: edu.startDate || '',
        end: edu.endDate || '',
        location: edu.location || '',
        desc: typeof edu.description === 'string' 
            ? edu.description 
            : Array.isArray(edu.description) 
                ? edu.description.join('\n')
                : String(edu.description || '')
    }));

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

    // Map projects
    const projectsMapped = (projects || []).map(proj => ({
        name: proj.name || '',
        date: proj.date || '',
        desc: typeof proj.description === 'string' 
            ? proj.description 
            : Array.isArray(proj.description) 
                ? proj.description.join('\n')
                : String(proj.description || '')
    }));

    // Map certifications
    const certifications = (skills?.certifications || []).map(cert => 
        typeof cert === 'string' ? cert : String(cert || '')
    );

    // Map languages
    const languages = (skills?.languages || []).map(lang => 
        typeof lang === 'string' ? lang : String(lang || '')
    );

    // Get jobTitle from first employment entry or personalInfo
    const jobTitle = (employment.length > 0 && employment[0]?.jobTitle) 
        ? employment[0].jobTitle 
        : (personalInfo.jobTitle || '');

    return {
        jobTitle: jobTitle,
        firstName,
        lastName,
        tagline: '', // Can be added later if needed
        phone: personalInfo.phone || '',
        email: personalInfo.email || '',
        linkedin: personalInfo.linkedin || '',
        address: '',
        city,
        country,
        moreDetails: false,
        summary: summary || '',
        employment: employment.length > 0 ? employment : [{ jobTitle: '', company: '', start: '', end: '', location: '', desc: '' }],
        education: educationMapped.length > 0 ? educationMapped : [{ degree: '', school: '', start: '', end: '', location: '', desc: '' }],
        skills: skillsMapped.length > 0 ? skillsMapped : [{ name: '', level: 'Intermediate' }],
        certifications: certifications.length > 0 ? certifications : [''],
        languages: languages.length > 0 ? languages : [''],
        projects: projectsMapped.length > 0 ? projectsMapped : [{ name: '', date: '', desc: '' }],
        profileImage: null
    };
}
