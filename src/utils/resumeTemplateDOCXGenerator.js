/**
 * DOCX Generator for Resume Builder Templates
 * This utility generates DOCX files using the same logic as the resume builder templates
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, WidthType, Table, TableRow, TableCell, BorderStyle, TabStopType, ImageRun, VerticalAlign, ShadingType, HeightRule } from 'docx';

/**
 * Generate DOCX for a specific template
 * @param {Object} form - Resume form data (mapped from tailored CV)
 * @param {Array} sections - Array of section keys to include
 * @param {Array} customSections - Array of custom sections
 * @param {number} templateId - Template ID (1-15)
 * @returns {Promise<Blob>} DOCX blob
 */
export async function generateResumeDOCX(form, sections = ["personal", "summary", "employment", "education", "skills"], customSections = [], templateId = 1) {
    // Route to template-specific generator
    switch (templateId) {
        case 1:
            return await generateTemplate1(form, sections, customSections);
        case 2:
            return await generateTemplate2(form, sections, customSections);
        case 3:
            return await generateTemplate3(form, sections, customSections);
        case 4:
            return await generateTemplate4(form, sections, customSections);
        case 5:
            return await generateTemplate5(form, sections, customSections);
        case 6:
            return await generateTemplate6(form, sections, customSections);
        case 7:
            return await generateTemplate7(form, sections, customSections);
        case 8:
            return await generateTemplate8(form, sections, customSections);
        case 9:
            return await generateTemplate9(form, sections, customSections);
        case 10:
            return await generateTemplate10(form, sections, customSections);
        case 11:
            return await generateTemplate11(form, sections, customSections);
        case 12:
            return await generateTemplate12(form, sections, customSections);
        case 13:
            return await generateTemplate13(form, sections, customSections);
        case 14:
            return await generateTemplate14(form, sections, customSections);
        case 15:
            return await generateTemplate15(form, sections, customSections);
        default:
            return await generateTemplate1(form, sections, customSections);
    }
}

// Template 1: Harvard Professional
async function generateTemplate1(form, sections, customSections) {
    const children = [];

    // Header section
    if (form.firstName) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${form.firstName} ${form.lastName || ''}`,
                        size: 18 * 2,
                        bold: true,
                        font: 'Times New Roman',
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 240 },
            })
        );

        if (form.tagline) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.tagline,
                            size: 11 * 2,
                            color: '333333',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 240 },
                })
            );
        }

        const contactInfo = [
            form.phone,
            form.email,
            form.linkedin,
            form.city && form.country ? `${form.city}, ${form.country}` : form.city || form.country
        ].filter(Boolean).join(' • ');

        if (contactInfo) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: contactInfo,
                            size: 10 * 2,
                            color: '333333',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 360 },
                })
            );
        }
    }

    // Process sections
    sections.forEach(section => {
        if (section === 'summary' && form.summary) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'SUMMARY',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 240, after: 120 },
                    border: {
                        bottom: {
                            color: '000000',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 1,
                        },
                    },
                })
            );
            
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.summary,
                            size: 11 * 2,
                            font: 'Times New Roman',
                        }),
                    ],
                    spacing: { after: 240 },
                    alignment: AlignmentType.LEFT,
                })
            );
        }

        if (section === 'employment' && form.employment && form.employment[0]?.jobTitle) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EXPERIENCE',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 240, after: 120 },
                    border: {
                        bottom: {
                            color: '000000',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 1,
                        },
                    },
                })
            );

            form.employment.forEach(job => {
                if (!job.jobTitle) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: job.jobTitle,
                                size: 11 * 2,
                                bold: true,
                                font: 'Times New Roman',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 11 * 2,
                            }),
                            new TextRun({
                                text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                                size: 11 * 2,
                                font: 'Times New Roman',
                            }),
                        ],
                        spacing: { before: 120, after: 40 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (job.company || job.location) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: job.company || '',
                                    size: 11 * 2,
                                    italics: true,
                                    font: 'Times New Roman',
                                }),
                                new TextRun({
                                    text: '\t',
                                    size: 11 * 2,
                                }),
                                new TextRun({
                                    text: job.location || '',
                                    size: 11 * 2,
                                    font: 'Times New Roman',
                                }),
                            ],
                            spacing: { after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 400 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'education' && form.education && form.education[0]?.degree) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 240, after: 120 },
                    border: {
                        bottom: {
                            color: '000000',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 1,
                        },
                    },
                })
            );

            form.education.forEach(edu => {
                if (!edu.degree && !edu.school) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: edu.school || '',
                                size: 11 * 2,
                                bold: true,
                                font: 'Times New Roman',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 11 * 2,
                            }),
                            new TextRun({
                                text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                                size: 11 * 2,
                                font: 'Times New Roman',
                            }),
                        ],
                        spacing: { before: 120, after: 40 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (edu.degree || edu.location) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.degree || '',
                                    size: 11 * 2,
                                    italics: true,
                                    font: 'Times New Roman',
                                }),
                                new TextRun({
                                    text: '\t',
                                    size: 11 * 2,
                                }),
                                new TextRun({
                                    text: edu.location || '',
                                    size: 11 * 2,
                                    font: 'Times New Roman',
                                }),
                            ],
                            spacing: { after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                        })
                    );
                }

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 400 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'skills' && form.skills) {
            const skillsArray = Array.isArray(form.skills) 
                ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
                : form.skills.split(',').map(s => s.trim()).filter(s => s);
              
            if (skillsArray.length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'SKILLS',
                                size: 12 * 2,
                                bold: true,
                                font: 'Times New Roman',
                                allCaps: true,
                            }),
                        ],
                        spacing: { before: 240, after: 120 },
                        border: {
                            bottom: {
                                color: '000000',
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 1,
                            },
                        },
                    })
                );

                const skillsPerColumn = Math.ceil(skillsArray.length / 3);
                const tableRows = [];
                
                for (let i = 0; i < skillsPerColumn; i++) {
                    const row = new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: skillsArray[i] ? `• ${typeof skillsArray[i] === 'string' ? skillsArray[i] : skillsArray[i].name}${typeof skillsArray[i] === 'string' ? '' : (skillsArray[i].level ? ` (${skillsArray[i].level})` : '')}` : '',
                                                size: 10 * 2,
                                                font: 'Times New Roman',
                                            }),
                                        ],
                                        spacing: { after: 40 },
                                    }),
                                ],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                                margins: { right: 400 },
                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE }
                                }
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: skillsArray[i + skillsPerColumn] ? `• ${typeof skillsArray[i + skillsPerColumn] === 'string' ? skillsArray[i + skillsPerColumn] : skillsArray[i + skillsPerColumn].name}${typeof skillsArray[i + skillsPerColumn] === 'string' ? '' : (skillsArray[i + skillsPerColumn].level ? ` (${skillsArray[i + skillsPerColumn].level})` : '')}` : '',
                                                size: 10 * 2,
                                                font: 'Times New Roman',
                                            }),
                                        ],
                                        spacing: { after: 40 },
                                    }),
                                ],
                                width: { size: 33, type: WidthType.PERCENTAGE },
                                margins: { right: 400 },
                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE }
                                }
                            }),
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({
                                                text: skillsArray[i + skillsPerColumn * 2] ? `• ${typeof skillsArray[i + skillsPerColumn * 2] === 'string' ? skillsArray[i + skillsPerColumn * 2] : skillsArray[i + skillsPerColumn * 2].name}${typeof skillsArray[i + skillsPerColumn * 2] === 'string' ? '' : (skillsArray[i + skillsPerColumn * 2].level ? ` (${skillsArray[i + skillsPerColumn * 2].level})` : '')}` : '',
                                                size: 10 * 2,
                                                font: 'Times New Roman',
                                            }),
                                        ],
                                        spacing: { after: 40 },
                                    }),
                                ],
                                width: { size: 34, type: WidthType.PERCENTAGE },
                                borders: {
                                    top: { style: BorderStyle.NONE },
                                    bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE },
                                    right: { style: BorderStyle.NONE }
                                }
                            }),
                        ],
                    });
                    tableRows.push(row);
                }

                children.push(
                    new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        margins: { top: 240 },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE },
                            insideHorizontal: { style: BorderStyle.NONE },
                            insideVertical: { style: BorderStyle.NONE }
                        }
                    })
                );
            }
        }

        if (section === 'projects' && form.projects && form.projects[0]?.name) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROJECTS',
                            size: 16 * 2,
                            bold: true,
                            font: 'Arial',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 400, after: 160 },
                    border: {
                        bottom: {
                            color: '000000',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 2,
                        },
                    },
                })
            );

            form.projects.forEach(proj => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: proj.name,
                                size: 13 * 2,
                                bold: true,
                                font: 'Arial',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 13 * 2,
                            }),
                            new TextRun({
                                text: proj.date || '',
                                size: 13 * 2,
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 320, after: 240 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (proj.desc) {
                    const lines = proj.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 12 * 2,
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 12 * 2,
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 400 },
                            })
                        );
                    });
                }
            });
        }
    });

    // Custom sections
    customSections.forEach(custom => {
        const customData = form[custom.key];
        if (!customData || (Array.isArray(customData) && customData.length === 0)) return;

        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: custom.label.toUpperCase(),
                        size: 12 * 2,
                        bold: true,
                        font: 'Times New Roman',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 240, after: 120 },
                border: {
                    bottom: {
                        color: '000000',
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 1,
                    },
                },
            })
        );
        
        if (form[custom.key]) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form[custom.key],
                            size: 11 * 2,
                            font: 'Times New Roman',
                        }),
                    ],
                    spacing: { after: 240 },
                })
            );
        }
    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            children: children,
        }],
    });

    return await Packer.toBlob(doc);
}

// Helper function to get skills array
function getSkillsArray(form) {
    return Array.isArray(form.skills) 
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
        : (form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : []);
}

// Helper function to create skill level dots for Template 12
function createSkillDots(level) {
    const dots = [];
    const numLevel = typeof level === 'number' ? level : 
        (level === 'Expert' ? 5 : level === 'Experienced' ? 4 : level === 'Intermediate' ? 3 : level === 'Skillful' ? 2 : 1);
    for (let i = 1; i <= 5; i++) {
        dots.push(new TextRun({
            text: i <= numLevel ? '●' : '○',
            size: 8 * 2,
            font: 'Arial',
        }));
    }
    return dots;
}

// Template 2: Modern Creative
async function generateTemplate2(form, sections, customSections) {
    const children = [];

    // Header section
    if (form.firstName) {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${form.firstName} ${form.lastName || ''}`.toUpperCase(),
                        size: 20 * 2,
                        bold: true,
                        font: 'Times New Roman',
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
            })
        );

        if (form.tagline) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.tagline,
                            size: 12 * 2,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                })
            );
        }

        if (form.phone) {
            const formattedPhone = form.phone.replace(/[^\d]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: formattedPhone,
                            size: 11 * 2,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 40 },
                })
            );
        }

        if (form.email) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.email,
                            size: 11 * 2,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 40 },
                })
            );
        }

        if (form.city || form.country) {
            const address = [form.city, form.country].filter(Boolean).join(', ');
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: address,
                            size: 11 * 2,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                })
            );
        }

        if (form.linkedin) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.linkedin,
                            size: 11 * 2,
                            color: '000000',
                            font: 'Times New Roman',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                })
            );
        }
    }

    // Process sections
    sections.forEach(section => {
        if (section === 'summary' && form.summary) {
            // Gray separator
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: '', size: 1 })],
                    spacing: { before: 120, after: 0 },
                    border: {
                        bottom: {
                            color: 'CCCCCC',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 4,
                        },
                    },
                })
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROFILE',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 120, after: 120 },
                    alignment: AlignmentType.CENTER,
                })
            );
            
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.summary,
                            size: 11 * 2,
                            font: 'Times New Roman',
                        }),
                    ],
                    spacing: { after: 200 },
                    alignment: AlignmentType.JUSTIFIED,
                })
            );
        }

        if (section === 'employment' && form.employment && form.employment[0]?.jobTitle) {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: '', size: 1 })],
                    spacing: { before: 120, after: 0 },
                    border: {
                        bottom: {
                            color: 'CCCCCC',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 4,
                        },
                    },
                })
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EMPLOYMENT HISTORY',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 120, after: 120 },
                    alignment: AlignmentType.CENTER,
                })
            );

            form.employment.forEach(job => {
                if (!job.jobTitle) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '♦ ' + job.jobTitle,
                                size: 11 * 2,
                                bold: true,
                                font: 'Times New Roman',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 11 * 2,
                            }),
                            new TextRun({
                                text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                                size: 11 * 2,
                                font: 'Times New Roman',
                            }),
                        ],
                        spacing: { before: 240, after: 40 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (job.company || job.location) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: job.company || '',
                                    size: 11 * 2,
                                    italics: true,
                                    font: 'Times New Roman',
                                }),
                                new TextRun({
                                    text: '\t',
                                    size: 11 * 2,
                                }),
                                new TextRun({
                                    text: job.location || '',
                                    size: 11 * 2,
                                    font: 'Times New Roman',
                                }),
                            ],
                            spacing: { after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 400 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'education' && form.education && form.education[0]?.degree) {
            children.push(
                new Paragraph({
                    children: [new TextRun({ text: '', size: 1 })],
                    spacing: { before: 120, after: 0 },
                    border: {
                        bottom: {
                            color: 'CCCCCC',
                            space: 1,
                            style: BorderStyle.SINGLE,
                            size: 4,
                        },
                    },
                })
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            size: 12 * 2,
                            bold: true,
                            font: 'Times New Roman',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 120, after: 120 },
                    alignment: AlignmentType.CENTER,
                })
            );

            form.education.forEach(edu => {
                if (!edu.degree && !edu.school) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: '♦ ' + (edu.school || ''),
                                size: 11 * 2,
                                bold: true,
                                font: 'Times New Roman',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 11 * 2,
                            }),
                            new TextRun({
                                text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                                size: 11 * 2,
                                font: 'Times New Roman',
                            }),
                        ],
                        spacing: { before: 240, after: 40 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (edu.degree || edu.location) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.degree || '',
                                    size: 11 * 2,
                                    italics: true,
                                    font: 'Times New Roman',
                                }),
                                new TextRun({
                                    text: '\t',
                                    size: 11 * 2,
                                }),
                                new TextRun({
                                    text: edu.location || '',
                                    size: 11 * 2,
                                    font: 'Times New Roman',
                                }),
                            ],
                            spacing: { after: 120 },
                            tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                        })
                    );
                }

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        font: 'Times New Roman',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 400 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'skills' && form.skills) {
            const skillsArray = getSkillsArray(form);
            if (skillsArray.length > 0) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: '', size: 1 })],
                        spacing: { before: 120, after: 0 },
                        border: {
                            bottom: {
                                color: 'CCCCCC',
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 4,
                            },
                        },
                    })
                );

                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'SKILLS',
                                size: 12 * 2,
                                bold: true,
                                font: 'Times New Roman',
                                allCaps: true,
                            }),
                        ],
                        spacing: { before: 120, after: 120 },
                        alignment: AlignmentType.CENTER,
                    })
                );

                skillsArray.forEach(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• ${skillName}`,
                                    size: 11 * 2,
                                    font: 'Times New Roman',
                                }),
                            ],
                            spacing: { after: 40 },
                            indent: { left: 400 },
                        })
                    );
                });
            }
        }
    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            children: children,
        }],
    });

    return await Packer.toBlob(doc);
}

// Template 3: Two-Column Dark Sidebar
async function generateTemplate3(form, sections, customSections) {
    const children = [];

    // Helper to create left sidebar cell
    async function createLeftSidebarCell() {
        const sidebarContent = [];

        // Name
        sidebarContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${form.firstName || ''} ${form.lastName || ''}`.trim() || 'Your Name',
                        bold: true,
                        size: 20 * 2,
                        color: 'FFFFFF',
                        font: 'Arial',
                    }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
            })
        );

        // Contact info
        if (form.email) {
            sidebarContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.email,
                            size: 10 * 2,
                            color: 'FFFFFF',
                            font: 'Arial',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 60 },
                })
            );
        }

        if (form.phone) {
            sidebarContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.phone,
                            size: 10 * 2,
                            color: 'FFFFFF',
                            font: 'Arial',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 60 },
                })
            );
        }

        if (form.city || form.country) {
            sidebarContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}`,
                            size: 10 * 2,
                            color: 'FFFFFF',
                            font: 'Arial',
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 300 },
                })
            );
        }

        // Skills
        const skillsArray = getSkillsArray(form);
        if (skillsArray.length > 0) {
            sidebarContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'SKILLS',
                            bold: true,
                            size: 12 * 2,
                            color: 'FFFFFF',
                            font: 'Arial',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 200, after: 120 },
                    borders: {
                        bottom: {
                            color: '4a7c59',
                            space: 0,
                            style: BorderStyle.SINGLE,
                            size: 4,
                        },
                    },
                })
            );

            skillsArray.forEach(skill => {
                const skillName = typeof skill === 'string' ? skill : skill.name;
                const skillLevel = typeof skill === 'string' ? 'Intermediate' : (skill.level || 'Intermediate');
                
                sidebarContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: skillName,
                                size: 10 * 2,
                                color: 'FFFFFF',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { after: 40 },
                    })
                );
                
                // Skill level blocks
                const totalBlocks = 40;
                let filledBlocks;
                if (skillLevel === 'Expert') {
                    filledBlocks = Math.round(totalBlocks * 0.9);
                } else if (skillLevel === 'Intermediate') {
                    filledBlocks = Math.round(totalBlocks * 0.7);
                } else {
                    filledBlocks = Math.round(totalBlocks * 0.4);
                }
                const emptyBlocks = totalBlocks - filledBlocks;
                
                sidebarContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}`,
                                size: 8 * 2,
                                color: 'FFFFFF',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { after: 160 },
                    })
                );
            });
        }

        return new TableCell({
            children: sidebarContent,
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: { top: 320, bottom: 320, left: 300, right: 300 },
            shading: { fill: '10365C' },
            verticalAlign: VerticalAlign.TOP,
        });
    }

    // Helper to create right content cell
    async function createRightContentCell() {
        const contentArray = [];

        // Summary
        if (sections.includes('summary') && form.summary) {
            contentArray.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROFILE',
                            size: 16 * 2,
                            bold: true,
                            color: '10365C',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 400, after: 160 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.summary,
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 280 },
                    alignment: AlignmentType.JUSTIFIED,
                })
            );
        }

        // Employment
        if (sections.includes('employment') && form.employment && form.employment[0]?.jobTitle) {
            contentArray.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EMPLOYMENT HISTORY',
                            size: 16 * 2,
                            bold: true,
                            color: '10365C',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                })
            );

            form.employment.forEach(job => {
                contentArray.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${job.jobTitle}, ${job.company}`,
                                size: 12 * 2,
                                bold: true,
                                color: '10365C',
                                font: 'Arial',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 12 * 2,
                            }),
                            new TextRun({
                                text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                                size: 10 * 2,
                                color: '666666',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { after: 100 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
                    })
                );

                if (job.location) {
                    contentArray.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: job.location,
                                    size: 10 * 2,
                                    italics: true,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 120 },
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        contentArray.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `• ${line.trim()}`,
                                        size: 10 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 300 },
                            })
                        );
                    });
                }

                contentArray.push(
                    new Paragraph({
                        children: [new TextRun({ text: '', size: 1 })],
                        spacing: { after: 280 },
                    })
                );
            });
        }

        // Education
        if (sections.includes('education') && form.education && form.education[0]?.degree) {
            contentArray.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            size: 16 * 2,
                            bold: true,
                            color: '10365C',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 300, after: 200 },
                })
            );

            form.education.forEach(edu => {
                contentArray.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${edu.degree}, ${edu.school}`,
                                size: 12 * 2,
                                bold: true,
                                color: '10365C',
                                font: 'Arial',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 12 * 2,
                            }),
                            new TextRun({
                                text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                                size: 10 * 2,
                                color: '666666',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { after: 100 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
                    })
                );

                if (edu.location) {
                    contentArray.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.location,
                                    size: 10 * 2,
                                    italics: true,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 120 },
                        })
                    );
                }

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        contentArray.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `• ${line.trim()}`,
                                        size: 10 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 40 },
                                indent: { left: 300 },
                            })
                        );
                    });
                }

                contentArray.push(
                    new Paragraph({
                        children: [new TextRun({ text: '', size: 1 })],
                        spacing: { after: 280 },
                    })
                );
            });
        }

        return new TableCell({
            children: contentArray,
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 320, right: 320, bottom: 320, left: 320 },
            verticalAlign: VerticalAlign.TOP,
        });
    }

    // Create two-column layout
    const leftCell = await createLeftSidebarCell();
    const rightCell = await createRightContentCell();

    const mainTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
            new TableRow({
                children: [leftCell, rightCell]
            })
        ]
    });

    children.push(mainTable);

    const doc = new Document({
        sections: [{
            children: children,
            properties: {
                page: {
                    margin: {
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    },
                },
            },
        }],
    });

    return await Packer.toBlob(doc);
}

// Template 4: Modern Blue
async function generateTemplate4(form, sections, customSections) {
    const children = [];

    // Header table
    if (form.firstName) {
        const headerTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { color: '4A90E2', space: 1, style: BorderStyle.SINGLE, size: 4 },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE }
            },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${form.firstName} ${form.lastName || ''}`,
                                            size: 28 * 2,
                                            bold: true,
                                            color: '4A90E2',
                                            font: 'Arial',
                                        }),
                                    ],
                                    alignment: AlignmentType.LEFT,
                                    spacing: { after: 120 },
                                }),
                                ...(form.tagline ? [new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: form.tagline,
                                            size: 14 * 2,
                                            color: '666666',
                                            font: 'Arial',
                                        }),
                                    ],
                                    alignment: AlignmentType.LEFT,
                                    spacing: { after: 0 },
                                })] : []),
                            ],
                            width: { size: 70, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            },
                            verticalAlign: VerticalAlign.TOP
                        }),
                        new TableCell({
                            children: [
                                ...(form.email ? [new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: form.email,
                                            size: 11 * 2,
                                            color: '4A90E2',
                                            font: 'Arial',
                                        }),
                                    ],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 40 },
                                })] : []),
                                ...(form.phone ? [new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: form.phone,
                                            size: 11 * 2,
                                            color: '4A90E2',
                                            font: 'Arial',
                                        }),
                                    ],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 40 },
                                })] : []),
                                ...((form.city || form.country) ? [new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}`,
                                            size: 11 * 2,
                                            color: '4A90E2',
                                            font: 'Arial',
                                        }),
                                    ],
                                    alignment: AlignmentType.RIGHT,
                                    spacing: { after: 0 },
                                })] : []),
                            ],
                            width: { size: 30, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            },
                            verticalAlign: VerticalAlign.TOP
                        }),
                    ],
                }),
            ],
            margins: { bottom: 480 },
        });
        
        children.push(headerTable);
    }

    // Process sections
    sections.forEach(section => {
        if (section === 'summary' && form.summary) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Summary',
                            size: 16 * 2,
                            bold: true,
                            color: '4A90E2',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 480, after: 160 },
                })
            );
            
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.summary,
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 400 },
                    alignment: AlignmentType.LEFT,
                })
            );
        }

        if (section === 'employment' && form.employment && form.employment[0]?.jobTitle) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Professional Experience',
                            size: 16 * 2,
                            bold: true,
                            color: '4A90E2',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 480, after: 240 },
                })
            );

            form.employment.forEach(job => {
                if (!job.jobTitle) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: job.company || '',
                                size: 12 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                            new TextRun({
                                text: '\t',
                                size: 12 * 2,
                            }),
                            new TextRun({
                                text: `${job.start}${job.start && job.end ? ' – ' : ''}${job.end}`,
                                size: 11 * 2,
                                color: '4A90E2',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 320, after: 80 },
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }],
                    })
                );

                if (job.jobTitle) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: job.jobTitle,
                                    size: 11 * 2,
                                    italics: true,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 120 },
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'education' && form.education && form.education[0]?.degree) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Education',
                            size: 16 * 2,
                            bold: true,
                            color: '4A90E2',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 480, after: 240 },
                })
            );

            form.education.forEach(edu => {
                if (!edu.degree && !edu.school) return;
                
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: edu.degree || '',
                                size: 12 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 240, after: 40 },
                    })
                );

                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${edu.school}${edu.location ? `, ${edu.location}` : ''}`,
                                size: 11 * 2,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { after: 120 },
                    })
                );

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        children.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'skills' && form.skills) {
            const skillsArray = getSkillsArray(form);
            if (skillsArray.length > 0) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Skills',
                                size: 16 * 2,
                                bold: true,
                                color: '4A90E2',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 480, after: 240 },
                    })
                );

                skillsArray.forEach(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `• ${skillName}`,
                                    size: 11 * 2,
                                    color: '333333',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 100 },
                            indent: { left: 400 },
                        })
                    );
                });
            }
        }
    });

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        right: 1440,
                        bottom: 1440,
                        left: 1440,
                    },
                },
            },
            children: children,
        }],
    });

    return await Packer.toBlob(doc);
}

// Template 5: Two-Column Light
async function generateTemplate5(form, sections, customSections) {
    const children = [];
    const tableRows = [];
    const leftColumnContent = [];
    const rightColumnContent = [];

    // Left column: Profile, Address, Email, Phone, Skills
    if (form.firstName) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: `${form.firstName} ${form.lastName || ''}`,
                        size: 20 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 120 },
            })
        );

        if (form.tagline) {
            leftColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: form.tagline,
                            size: 13 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 320 },
                })
            );
        }
    }

    if (form.summary) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'PROFILE',
                        size: 13 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: form.summary,
                        size: 11 * 2,
                        color: '333333',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 480 },
            })
        );
    }

    if (form.address || form.city || form.country) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'ADDRESS',
                        size: 13 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 0, after: 160 },
            })
        );

        const addressText = [
            form.address,
            `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country || ''}`
        ].filter(Boolean).join('\n');

        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: addressText,
                        size: 11 * 2,
                        color: '333333',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 480 },
            })
        );
    }

    if (form.email) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'EMAIL',
                        size: 13 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 0, after: 160 },
            })
        );

        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: form.email,
                        size: 11 * 2,
                        color: '333333',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 480 },
            })
        );
    }

    if (form.phone) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'PHONE',
                        size: 13 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 0, after: 160 },
            })
        );

        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: form.phone,
                        size: 11 * 2,
                        color: '333333',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 480 },
            })
        );
    }

    const skillsArray = getSkillsArray(form);
    if (skillsArray.length > 0) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'SKILLS',
                        size: 13 * 2,
                        bold: true,
                        color: '5A7BA8',
                        font: 'Arial',
                        allCaps: true,
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        skillsArray.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            leftColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: skillName,
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 80 },
                })
            );
        });
    }

    // Right column: Employment, Education, Projects
    sections.forEach(section => {
        if (section === 'summary') return; // Already in left column

        if (section === 'employment' && form.employment && form.employment[0]?.jobTitle) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EMPLOYMENT HISTORY',
                            size: 15 * 2,
                            bold: true,
                            color: '5A7BA8',
                            font: 'Arial',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 0, after: 320 },
                })
            );

            form.employment.forEach(job => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${job.jobTitle}${job.company ? ` at ${job.company}` : ''}`,
                                size: 13 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 160 },
                    })
                );

                if (job.start || job.end) {
                    rightColumnContent.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${job.start}${job.start && job.end ? ' – ' : ''}${job.end}`,
                                    size: 11 * 2,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 160 },
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'education' && form.education && form.education[0]?.degree) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            size: 15 * 2,
                            bold: true,
                            color: '5A7BA8',
                            font: 'Arial',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 400, after: 320 },
                })
            );

            form.education.forEach(edu => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: edu.degree || '',
                                size: 13 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 160 },
                    })
                );

                if (edu.school) {
                    rightColumnContent.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.school,
                                    size: 11 * 2,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 160 },
                        })
                    );
                }

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'projects' && form.projects && form.projects[0]?.name) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROJECTS',
                            size: 15 * 2,
                            bold: true,
                            color: '5A7BA8',
                            font: 'Arial',
                            allCaps: true,
                        }),
                    ],
                    spacing: { before: 400, after: 320 },
                })
            );

            form.projects.forEach(proj => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: proj.name || '',
                                size: 13 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 160 },
                    })
                );

                if (proj.desc) {
                    const lines = proj.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 11 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }
    });

    tableRows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: leftColumnContent,
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    margins: { top: 360, right: 240, bottom: 360, left: 240 },
                    shading: { fill: 'F5F5F5' },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE }
                    }
                }),
                new TableCell({
                    children: rightColumnContent,
                    width: { size: 65, type: WidthType.PERCENTAGE },
                    margins: { top: 360, right: 360, bottom: 360, left: 360 },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE }
                    }
                })
            ]
        })
    );

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 360,
                        right: 360,
                        bottom: 360,
                        left: 360,
                    },
                },
            },
            children: [
                new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE }
                    }
                })
            ],
        }],
    });

    return await Packer.toBlob(doc);
}

// Template 6: Green Band
async function generateTemplate6(form, sections, customSections) {
    const children = [];
    const tableRows = [];

    // Header with green band
    if (form.firstName) {
        const headerTable = new Table({
            rows: [
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${form.firstName} ${form.lastName || ''}`,
                                            size: 36 * 2,
                                            bold: true,
                                            color: '333333',
                                            font: 'Arial',
                                        }),
                                    ],
                                    spacing: { before: 0, after: 0 },
                                }),
                            ],
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            margins: { top: 400, right: 400, bottom: 400, left: 400 },
                            shading: { fill: 'D9EAD3' },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            }
                        }),
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${form.email ? form.email : ''}${form.email && form.phone ? ' • ' : ''}${form.phone ? form.phone : ''}`,
                                            size: 12 * 2,
                                            color: '333333',
                                            font: 'Arial',
                                        }),
                                    ],
                                    spacing: { before: 0, after: 80 },
                                    alignment: AlignmentType.RIGHT,
                                }),
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}${(form.city || form.country) && form.address ? ', ' : ''}${form.address ? form.address : ''}`,
                                            size: 12 * 2,
                                            color: '333333',
                                            font: 'Arial',
                                        }),
                                    ],
                                    spacing: { before: 0, after: 0 },
                                    alignment: AlignmentType.RIGHT,
                                }),
                            ],
                            width: { size: 50, type: WidthType.PERCENTAGE },
                            margins: { top: 400, right: 400, bottom: 400, left: 400 },
                            shading: { fill: 'D9EAD3' },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE }
                            }
                        }),
                    ],
                }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE },
                insideVertical: { style: BorderStyle.NONE }
            }
        });

        children.push(headerTable);
        children.push(
            new Paragraph({
                children: [new TextRun({ text: '', size: 1 })],
                spacing: { after: 200 },
            })
        );
    }

    // Two-column layout
    const leftColumnContent = [];
    const rightColumnContent = [];

    // Left column: Summary, Skills, Certifications, Languages
    if (form.summary) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: form.tagline || 'Professional Summary',
                        size: 18 * 2,
                        bold: true,
                        color: '6AA84F',
                        font: 'Arial',
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: form.summary,
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                    }),
                ],
                spacing: { after: 480 },
                alignment: AlignmentType.JUSTIFIED,
            })
        );
    }

    const skillsArray = getSkillsArray(form);
    if (skillsArray.length > 0) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Skills',
                        size: 18 * 2,
                        bold: true,
                        color: '6AA84F',
                        font: 'Arial',
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        skillsArray.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
            leftColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '• ',
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                        new TextRun({
                            text: `${skillName}${skillLevel}`,
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 96 },
                })
            );
        });
    }

    if (form.certifications && form.certifications[0]) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Certifications',
                        size: 18 * 2,
                        bold: true,
                        color: '6AA84F',
                        font: 'Arial',
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        form.certifications.forEach(cert => {
            leftColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '• ',
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                        new TextRun({
                            text: cert,
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 96 },
                })
            );
        });
    }

    if (form.languages && form.languages[0]) {
        leftColumnContent.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: 'Languages',
                        size: 18 * 2,
                        bold: true,
                        color: '6AA84F',
                        font: 'Arial',
                    }),
                ],
                spacing: { before: 0, after: 240 },
            })
        );

        form.languages.forEach(lang => {
            leftColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '• ',
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                        new TextRun({
                            text: lang,
                            size: 12 * 2,
                            color: '333333',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { after: 96 },
                })
            );
        });
    }

    // Right column: Employment, Education, Projects
    sections.forEach(section => {
        if (section === 'summary') return;

        if (section === 'employment' && form.employment && form.employment[0]?.jobTitle) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EMPLOYMENT HISTORY',
                            size: 18 * 2,
                            bold: true,
                            color: '6AA84F',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 0, after: 240 },
                })
            );

            form.employment.forEach(job => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: job.jobTitle || '',
                                size: 14 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 80 },
                    })
                );

                if (job.company) {
                    rightColumnContent.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: job.company,
                                    size: 12 * 2,
                                    color: '6AA84F',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 80 },
                        })
                    );
                }

                if (job.start || job.end) {
                    rightColumnContent.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                                    size: 11 * 2,
                                    color: '666666',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 120 },
                        })
                    );
                }

                if (job.desc) {
                    const lines = job.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'education' && form.education && form.education[0]?.degree) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'EDUCATION',
                            size: 18 * 2,
                            bold: true,
                            color: '6AA84F',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 400, after: 240 },
                })
            );

            form.education.forEach(edu => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: edu.degree || '',
                                size: 14 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 80 },
                    })
                );

                if (edu.school) {
                    rightColumnContent.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.school,
                                    size: 12 * 2,
                                    color: '6AA84F',
                                    font: 'Arial',
                                }),
                            ],
                            spacing: { after: 80 },
                        })
                    );
                }

                if (edu.desc) {
                    const lines = edu.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }

        if (section === 'projects' && form.projects && form.projects[0]?.name) {
            rightColumnContent.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'PROJECTS',
                            size: 18 * 2,
                            bold: true,
                            color: '6AA84F',
                            font: 'Arial',
                        }),
                    ],
                    spacing: { before: 400, after: 240 },
                })
            );

            form.projects.forEach(proj => {
                rightColumnContent.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: proj.name || '',
                                size: 14 * 2,
                                bold: true,
                                color: '333333',
                                font: 'Arial',
                            }),
                        ],
                        spacing: { before: 0, after: 80 },
                    })
                );

                if (proj.desc) {
                    const lines = proj.desc.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                        rightColumnContent.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: '• ',
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                    new TextRun({
                                        text: line.trim(),
                                        size: 12 * 2,
                                        color: '333333',
                                        font: 'Arial',
                                    }),
                                ],
                                spacing: { after: 80 },
                                indent: { left: 240 },
                            })
                        );
                    });
                }
            });
        }
    });

    tableRows.push(
        new TableRow({
            children: [
                new TableCell({
                    children: leftColumnContent,
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    margins: { top: 400, right: 400, bottom: 400, left: 400 },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE }
                    }
                }),
                new TableCell({
                    children: rightColumnContent,
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    margins: { top: 400, right: 400, bottom: 400, left: 400 },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE }
                    }
                })
            ]
        })
    );

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
            },
            children: [
                ...children,
                new Table({
                    rows: tableRows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE }
                    }
                })
            ],
        }],
    });

    return await Packer.toBlob(doc);
}
