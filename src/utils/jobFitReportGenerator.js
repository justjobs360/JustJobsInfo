import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export async function generateJobFitReport(analysisData) {
    try {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        text: 'JOB FIT ANALYSIS REPORT',
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),

                    // Job Details Section
                    new Paragraph({
                        text: 'Job Details',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Job Title: ', bold: true }),
                            new TextRun(analysisData.jobTitle || 'N/A')
                        ],
                        spacing: { after: 100 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: 'Company: ', bold: true }),
                            new TextRun(analysisData.companyName || 'N/A')
                        ],
                        spacing: { after: 100 }
                    }),
                    ...(analysisData.industrySector ? [new Paragraph({
                        children: [
                            new TextRun({ text: 'Industry: ', bold: true }),
                            new TextRun(analysisData.industrySector)
                        ],
                        spacing: { after: 100 }
                    })] : []),

                    // Overall Fit Score
                    new Paragraph({
                        text: 'Overall Fit Score',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${analysisData.fitScore}/100 - ${analysisData.fitLevel}`, bold: true, size: 32 })
                        ],
                        spacing: { after: 200 }
                    }),

                    // Scoring Rationale
                    ...(analysisData.scoringRationale ? [
                        new Paragraph({
                            text: 'Scoring Rationale',
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 300, after: 200 }
                        }),
                        ...analysisData.scoringRationale.split('\n').filter(p => p.trim()).map(paragraph =>
                            new Paragraph({
                                text: paragraph.trim(),
                                spacing: { after: 150 }
                            })
                        )
                    ] : []),

                    // Detailed Score Breakdown
                    new Paragraph({
                        text: 'Detailed Score Breakdown',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    ...generateScoreBreakdown(analysisData.scoreBreakdown),

                    // Strengths
                    new Paragraph({
                        text: 'Key Strengths',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    ...(analysisData.strengths || []).map((strength, index) =>
                        new Paragraph({
                            text: `${index + 1}. ${strength}`,
                            spacing: { after: 100 }
                        })
                    ),

                    // Gaps to Address
                    new Paragraph({
                        text: 'Gaps to Address',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    ...(analysisData.gaps || []).map((gap, index) =>
                        new Paragraph({
                            text: `${index + 1}. ${gap}`,
                            spacing: { after: 100 }
                        })
                    ),

                    // Recommendations
                    new Paragraph({
                        text: 'Recommendations',
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 300, after: 200 }
                    }),
                    ...(analysisData.recommendations || []).map((recommendation, index) =>
                        new Paragraph({
                            text: `${index + 1}. ${recommendation}`,
                            spacing: { after: 100 }
                        })
                    ),

                    // ATS Optimization Tips
                    ...(analysisData.atsOptimization && analysisData.atsOptimization.length > 0 ? [
                        new Paragraph({
                            text: 'ATS Optimization Tips',
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 300, after: 200 }
                        }),
                        ...analysisData.atsOptimization.map((tip, index) =>
                            new Paragraph({
                                text: `${index + 1}. ${tip}`,
                                spacing: { after: 100 }
                            })
                        )
                    ] : []),

                    // Footer
                    new Paragraph({
                        text: `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 400 },
                        italics: true
                    }),
                    new Paragraph({
                        text: 'Powered by JustJobs.info',
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        italics: true
                    })
                ]
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;

    } catch (error) {
        console.error('Error generating DOCX report:', error);
        throw new Error('Failed to generate report');
    }
}

function generateScoreBreakdown(scoreBreakdown) {
    if (!scoreBreakdown) return [];

    const paragraphs = [];
    const categories = {
        hardSkills: 'Hard Skills',
        softSkills: 'Soft Skills',
        experience: 'Experience Level',
        education: 'Education',
        keywordMatch: 'Keywords Match',
        transferableSkills: 'Transferable Skills'
    };

    Object.entries(categories).forEach(([key, label]) => {
        if (scoreBreakdown[key]) {
            const breakdown = scoreBreakdown[key];
            const score = typeof breakdown === 'object' ? breakdown.score : breakdown;

            paragraphs.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${label}: `, bold: true }),
                        new TextRun(`${score}/100`)
                    ],
                    spacing: { after: 100 }
                })
            );

            // Add resume items if available
            if (typeof breakdown === 'object' && breakdown.resumeItems && breakdown.resumeItems.length > 0) {
                paragraphs.push(
                    new Paragraph({
                        text: 'On Resume:',
                        italics: true,
                        indent: { left: 360 },
                        spacing: { after: 50 }
                    })
                );
                breakdown.resumeItems.forEach(item => {
                    paragraphs.push(
                        new Paragraph({
                            text: `• ${item}`,
                            indent: { left: 720 },
                            spacing: { after: 50 }
                        })
                    );
                });
            }

            // Add job items if available
            if (typeof breakdown === 'object' && breakdown.jobItems && breakdown.jobItems.length > 0) {
                paragraphs.push(
                    new Paragraph({
                        text: 'Required by Job:',
                        italics: true,
                        indent: { left: 360 },
                        spacing: { after: 50 }
                    })
                );
                breakdown.jobItems.forEach(item => {
                    paragraphs.push(
                        new Paragraph({
                            text: `• ${item}`,
                            indent: { left: 720 },
                            spacing: { after: 50 }
                        })
                    );
                });
            }

            paragraphs.push(
                new Paragraph({ text: '', spacing: { after: 150 } })
            );
        }
    });

    return paragraphs;
}

