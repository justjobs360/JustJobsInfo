import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType, Table, TableRow, TableCell, BorderStyle } from 'docx';

/**
 * Generate a tailored CV in DOCX format
 * @param {Object} cvData - The tailored CV data
 * @param {number} templateId - Template ID (1-3 for different styles)
 * @returns {Promise<Buffer>} DOCX file buffer
 */
export async function generateTailoredCV(cvData, templateId = 1) {
    try {
        const sections = [];

        // Header Section
        sections.push(...generateHeader(cvData.personalInfo, templateId));

        // Summary Section
        if (cvData.summary) {
            sections.push(...generateSummary(cvData.summary, templateId));
        }

        // Experience Section
        if (cvData.experience && cvData.experience.length > 0) {
            sections.push(...generateExperience(cvData.experience, templateId));
        }

        // Education Section
        if (cvData.education && cvData.education.length > 0) {
            sections.push(...generateEducation(cvData.education, templateId));
        }

        // Skills Section
        if (cvData.skills) {
            sections.push(...generateSkills(cvData.skills, templateId));
        }

        // Projects Section
        if (cvData.projects && cvData.projects.length > 0) {
            sections.push(...generateProjects(cvData.projects, templateId));
        }

        // Certifications Section
        if (cvData.skills?.certifications && cvData.skills.certifications.length > 0) {
            sections.push(...generateCertifications(cvData.skills.certifications, templateId));
        }

        // Additional Info Section
        if (cvData.additionalInfo) {
            sections.push(...generateAdditionalInfo(cvData.additionalInfo, templateId));
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: sections
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    } catch (error) {
        console.error('Error generating tailored CV:', error);
        throw new Error('Failed to generate CV document');
    }
}

function generateHeader(personalInfo, templateId) {
    const paragraphs = [];

    // Name
    paragraphs.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: personalInfo.fullName || `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || 'Your Name',
                    bold: true,
                    size: templateId === 1 ? 32 : 28,
                    color: templateId === 2 ? '0066CC' : '000000'
                })
            ],
            alignment: templateId === 3 ? AlignmentType.LEFT : AlignmentType.CENTER,
            spacing: { after: 200 }
        })
    );

    // Contact Information
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.location) contactInfo.push(personalInfo.location);
    if (personalInfo.linkedin) contactInfo.push(`LinkedIn: ${personalInfo.linkedin}`);

    if (contactInfo.length > 0) {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: contactInfo.join(' | '),
                        size: 22,
                        color: '666666'
                    })
                ],
                alignment: templateId === 3 ? AlignmentType.LEFT : AlignmentType.CENTER,
                spacing: { after: 300 }
            })
        );
    }

    return paragraphs;
}

function generateSummary(summary, templateId) {
    return [
        new Paragraph({
            text: 'Professional Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        }),
        new Paragraph({
            text: summary,
            spacing: { after: 300 }
        })
    ];
}

function generateExperience(experience, templateId) {
    const paragraphs = [
        new Paragraph({
            text: 'Professional Experience',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        })
    ];

    experience.forEach((job, index) => {
        // Job Title and Company
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: job.jobTitle || 'Job Title',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: ` | ${job.company || 'Company Name'}`,
                        size: 24,
                        color: '666666'
                    })
                ],
                spacing: { after: 50 }
            })
        );

        // Dates and Location
        const dateRange = `${job.startDate || ''} - ${job.endDate || 'Present'}`;
        const locationInfo = job.location ? `${dateRange} | ${job.location}` : dateRange;
        
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: locationInfo,
                        italics: true,
                        size: 20,
                        color: '666666'
                    })
                ],
                spacing: { after: 100 }
            })
        );

        // Description - Use tailored description which should already be optimized for the job
        if (job.description) {
            // Ensure description is a string
            let descriptionText = '';
            if (typeof job.description === 'string') {
                descriptionText = job.description;
            } else if (Array.isArray(job.description)) {
                // If it's an array, join it
                descriptionText = job.description.join('\n');
            } else if (typeof job.description === 'object') {
                // If it's an object, try to stringify it or extract text
                descriptionText = JSON.stringify(job.description);
            } else {
                // Convert to string as fallback
                descriptionText = String(job.description || '');
            }

            if (descriptionText.trim().length > 0) {
                // The description should already be tailored with keywords and relevant content
                // Split by bullet points, new lines, or numbered lists
                const descriptionLines = descriptionText
                    .split(/\n|•|-\s*|\d+\.\s*/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                // If no clear bullets found, treat entire description as paragraphs
                if (descriptionLines.length === 1 && descriptionLines[0].length > 100) {
                    // Long paragraph - split into sentences
                    const sentences = descriptionLines[0]
                        .split(/[.!?]+/)
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                    
                    sentences.forEach(sentence => {
                        if (sentence.length > 0) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `• ${sentence}`,
                                            size: 22
                                        })
                                    ],
                                    indent: { left: 360 },
                                    spacing: { after: 50 }
                                })
                            );
                        }
                    });
                } else {
                    // Already formatted with bullets or short lines
                    descriptionLines.forEach(line => {
                        if (line.length > 0) {
                            paragraphs.push(
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: line.startsWith('•') ? line : `• ${line}`,
                                            size: 22
                                        })
                                    ],
                                    indent: { left: 360 },
                                    spacing: { after: 50 }
                                })
                            );
                        }
                    });
                }
            }
        }

        if (index < experience.length - 1) {
            paragraphs.push(
                new Paragraph({
                    text: '',
                    spacing: { after: 200 }
                })
            );
        }
    });

    paragraphs.push(
        new Paragraph({
            text: '',
            spacing: { after: 300 }
        })
    );

    return paragraphs;
}

function generateEducation(education, templateId) {
    const paragraphs = [
        new Paragraph({
            text: 'Education',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        })
    ];

    education.forEach((edu, index) => {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: edu.degree || 'Degree',
                        bold: true,
                        size: 24
                    }),
                    new TextRun({
                        text: ` | ${edu.school || 'School Name'}`,
                        size: 24,
                        color: '666666'
                    })
                ],
                spacing: { after: 50 }
            })
        );

        const dateRange = `${edu.startDate || ''} - ${edu.endDate || ''}`;
        const locationInfo = edu.location ? `${dateRange} | ${edu.location}` : dateRange;
        
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: locationInfo,
                        italics: true,
                        size: 20,
                        color: '666666'
                    })
                ],
                spacing: { after: 50 }
            })
        );

        if (edu.gpa) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `GPA: ${edu.gpa}`,
                            size: 20
                        })
                    ],
                    spacing: { after: 50 }
                })
            );
        }

        if (edu.description) {
            // Ensure description is a string
            let descriptionText = '';
            if (typeof edu.description === 'string') {
                descriptionText = edu.description;
            } else if (Array.isArray(edu.description)) {
                descriptionText = edu.description.join('\n');
            } else {
                descriptionText = String(edu.description || '');
            }

            if (descriptionText.trim().length > 0) {
                paragraphs.push(
                    new Paragraph({
                        text: descriptionText,
                        spacing: { after: 100 }
                    })
                );
            }
        }

        if (index < education.length - 1) {
            paragraphs.push(
                new Paragraph({
                    text: '',
                    spacing: { after: 100 }
                })
            );
        }
    });

    paragraphs.push(
        new Paragraph({
            text: '',
            spacing: { after: 300 }
        })
    );

    return paragraphs;
}

function generateSkills(skills, templateId) {
    const paragraphs = [
        new Paragraph({
            text: 'Skills',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        })
    ];

    // Technical Skills
    if (skills.technical && skills.technical.length > 0) {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Technical Skills: ',
                        bold: true
                    }),
                    new TextRun({
                        text: skills.technical.join(', ')
                    })
                ],
                spacing: { after: 100 }
            })
        );
    }

    // Soft Skills
    if (skills.soft && skills.soft.length > 0) {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Soft Skills: ',
                        bold: true
                    }),
                    new TextRun({
                        text: skills.soft.join(', ')
                    })
                ],
                spacing: { after: 100 }
            })
        );
    }

    // Languages
    if (skills.languages && skills.languages.length > 0) {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Languages: ',
                        bold: true
                    }),
                    new TextRun({
                        text: skills.languages.join(', ')
                    })
                ],
                spacing: { after: 100 }
            })
        );
    }

    paragraphs.push(
        new Paragraph({
            text: '',
            spacing: { after: 300 }
        })
    );

    return paragraphs;
}

function generateProjects(projects, templateId) {
    const paragraphs = [
        new Paragraph({
            text: 'Projects',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        })
    ];

    projects.forEach((project, index) => {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: project.name || 'Project Name',
                        bold: true,
                        size: 24
                    })
                ],
                spacing: { after: 50 }
            })
        );

        if (project.date) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: project.date,
                            italics: true,
                            size: 20,
                            color: '666666'
                        })
                    ],
                    spacing: { after: 50 }
                })
            );
        }

        if (project.description) {
            // Ensure description is a string
            let descriptionText = '';
            if (typeof project.description === 'string') {
                descriptionText = project.description;
            } else if (Array.isArray(project.description)) {
                descriptionText = project.description.join('\n');
            } else {
                descriptionText = String(project.description || '');
            }

            if (descriptionText.trim().length > 0) {
                paragraphs.push(
                    new Paragraph({
                        text: descriptionText,
                        spacing: { after: 50 }
                    })
                );
            }
        }

        if (project.technologies && project.technologies.length > 0) {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Technologies: ${project.technologies.join(', ')}`,
                            italics: true,
                            size: 20,
                            color: '666666'
                        })
                    ],
                    spacing: { after: 100 }
                })
            );
        }

        if (index < projects.length - 1) {
            paragraphs.push(
                new Paragraph({
                    text: '',
                    spacing: { after: 100 }
                })
            );
        }
    });

    paragraphs.push(
        new Paragraph({
            text: '',
            spacing: { after: 300 }
        })
    );

    return paragraphs;
}

function generateCertifications(certifications, templateId) {
    const paragraphs = [
        new Paragraph({
            text: 'Certifications',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
        })
    ];

    certifications.forEach(cert => {
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `• ${cert}`,
                        size: 22
                    })
                ],
                indent: { left: 360 },
                spacing: { after: 50 }
            })
        );
    });

    paragraphs.push(
        new Paragraph({
            text: '',
            spacing: { after: 300 }
        })
    );

    return paragraphs;
}

function generateAdditionalInfo(additionalInfo, templateId) {
    const paragraphs = [];

    if (additionalInfo.awards && additionalInfo.awards.length > 0) {
        paragraphs.push(
            new Paragraph({
                text: 'Awards & Honors',
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 200, after: 150 }
            })
        );

        additionalInfo.awards.forEach(award => {
            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `• ${award}`,
                            size: 22
                        })
                    ],
                    indent: { left: 360 },
                    spacing: { after: 50 }
                })
            );
        });

        paragraphs.push(
            new Paragraph({
                text: '',
                spacing: { after: 300 }
            })
        );
    }

    return paragraphs;
}
