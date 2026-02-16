import React, { useState, useEffect } from 'react';
import TemplateSelector from './TemplateSelector';

export default function JobFitResults({ analysisData, onNewAnalysis, tailoredCVData, isTailoringCV, cvTailoringError, onTailorCVNow }) {
    const [showTailorCVOption, setShowTailorCVOption] = useState(false);
    const [showChangeTemplate, setShowChangeTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(1);

    // Always show the option if there's no tailored CV and not currently tailoring
    useEffect(() => {
        if (!tailoredCVData && !isTailoringCV && !cvTailoringError) {
            setShowTailorCVOption(true);
        } else {
            setShowTailorCVOption(false);
        }
    }, [tailoredCVData, isTailoringCV, cvTailoringError]);
    const { 
        fitScore, 
        fitLevel,
        scoreBreakdown,
        scoringRationale,
        strengths, 
        gaps, 
        recommendations,
        atsOptimization,
        jobTitle, 
        companyName,
        industrySector 
    } = analysisData;

    // State for expandable score breakdown items
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpanded = (key) => {
        setExpandedItems(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const getScoreColor = (score) => {
        if (score >= 85) return '#10b981'; // Green
        if (score >= 80) return '#f59e0b'; // Yellow/Amber
        if (score >= 60) return '#f97316'; // Orange
        if (score >= 40) return '#ef4444'; // Red
        return '#dc2626'; // Dark Red
    };

    const getScoreLabel = (score) => {
        if (fitLevel) return fitLevel;
        if (score >= 85) return 'Excellent Fit';
        if (score >= 80) return 'Good Fit';
        if (score >= 60) return 'Moderate Fit';
        if (score >= 40) return 'Weak Fit';
        return 'Poor Fit';
    };

    const getScoreDescription = (score) => {
        if (score >= 80) return "You're an excellent match for this position! Your skills and experience align well with the job requirements.";
        if (score >= 60) return "You have a good foundation for this role with transferable skills. Some gaps can be addressed with targeted development.";
        if (score >= 40) return "There's potential for this role, but significant gaps need to be addressed. Consider gaining relevant experience or skills.";
        return "This role may not be the best fit based on current qualifications. Consider roles that better align with your experience or focus on skill development first.";
    };

    const handleDownloadResults = () => {
        let resultsContent = `
JOB FIT ANALYSIS RESULTS
========================

Job Position: ${jobTitle || 'Not specified'}
Company: ${companyName || 'Not specified'}
Industry: ${industrySector || 'Not specified'}
Fit Score: ${fitScore}/100 (${getScoreLabel(fitScore)})

${scoringRationale ? `SCORING RATIONALE:\n${scoringRationale}\n` : ''}
${scoreBreakdown ? `\nSCORE BREAKDOWN:
- Hard Skills: ${scoreBreakdown.hardSkills || 'N/A'}%
- Soft Skills: ${scoreBreakdown.softSkills || 'N/A'}%
- Experience: ${scoreBreakdown.experience || 'N/A'}%
- Education: ${scoreBreakdown.education || 'N/A'}%
- Keyword Match: ${scoreBreakdown.keywordMatch || 'N/A'}%
- Transferable Skills: ${scoreBreakdown.transferableSkills || 'N/A'}%
` : ''}
STRENGTHS:
${strengths.map((strength, index) => `${index + 1}. ${strength}`).join('\n')}

GAPS TO ADDRESS:
${gaps.map((gap, index) => `${index + 1}. ${gap}`).join('\n')}

RECOMMENDATIONS:
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

ATS OPTIMIZATION TIPS:
${atsOptimization && atsOptimization.length > 0 ? atsOptimization.map((tip, index) => `${index + 1}. ${tip}`).join('\n') : `1. Use industry-standard section headings (Experience, Education, Skills)
2. Include relevant keywords from the job description throughout your resume
3. Use standard fonts (Arial, Calibri, Times New Roman) for better parsing
4. Avoid tables, graphics, and complex formatting that ATS may not read
5. Save your resume as a .docx file for optimal ATS compatibility`}

FIT SCORE GUIDE:
- 85-100: Excellent/Strong Fit - Meets or exceeds most requirements
- 80-84: Good Fit - Strong alignment with most requirements, minor gaps may exist
- 60-79: Moderate Fit - Has transferable skills but significant gaps exist
- 40-59: Weak Fit - Major gaps and misalignment with role requirements
- 0-39: Poor Fit - Severe misalignment with role requirements

Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        `.trim();

        const blob = new Blob([resultsContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `job-fit-analysis-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleOpenResumeBuilder = () => {
        if (!tailoredCVData || !tailoredCVData.redirectUrl) {
            console.error('No tailored CV data or redirect URL available');
            return;
        }

        try {
            // Store the form data in sessionStorage so the resume builder can read it
            if (tailoredCVData.resumeForm) {
                // Get dataKey from URL or from the response data
                const dataKey = tailoredCVData.dataKey || new URLSearchParams(tailoredCVData.redirectUrl.split('?')[1]).get('dataKey');
                if (dataKey) {
                    const storageKey = `tailored_cv_${dataKey}`;
                    sessionStorage.setItem(storageKey, JSON.stringify({
                        form: tailoredCVData.resumeForm,
                        sections: tailoredCVData.sections || ['personal', 'summary', 'employment', 'education', 'skills']
                    }));
                }
            }

            // Redirect to resume builder
            window.location.href = tailoredCVData.redirectUrl;
        } catch (error) {
            console.error('Error opening resume builder:', error);
            alert('Failed to open resume builder. Please try again.');
        }
    };

    return (
        <div className="results-section">
            <div className="results-header">
                <div 
                    className="fit-score"
                    style={{ 
                        background: `linear-gradient(135deg, ${getScoreColor(fitScore)}, ${getScoreColor(fitScore)}dd)`
                    }}
                >
                    {fitScore}
                </div>
                <h2 className="results-title">{getScoreLabel(fitScore)}</h2>
                <p className="results-subtitle">
                    {getScoreDescription(fitScore)}
                </p>
                {(jobTitle || companyName || industrySector) && (
                    <div style={{ marginTop: '15px' }}>
                        {(jobTitle || companyName) && (
                            <p style={{ 
                                fontSize: '16px', 
                                color: '#6b7280', 
                                marginBottom: '5px',
                                fontStyle: 'italic'
                            }}>
                                Analysis for: {[jobTitle, companyName].filter(Boolean).join(' at ')}
                            </p>
                        )}
                        {industrySector && (
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#6b7280',
                                fontStyle: 'italic'
                            }}>
                                Industry: {industrySector}
                            </p>
                        )}
                    </div>
                )}
                
                {/* Scoring Rationale */}
                {scoringRationale && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.05), rgba(9, 99, 211, 0.02))',
                        border: '1px solid rgba(9, 99, 211, 0.2)',
                        borderRadius: '12px',
                        padding: '20px',
                        marginTop: '25px',
                        maxWidth: '800px',
                        margin: '25px auto 0'
                    }}>
                        <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: 'var(--color-primary)',
                            marginBottom: '15px',
                            textAlign: 'left'
                        }}>
                            📊 Scoring Rationale
                        </h4>
                        <div style={{ 
                            fontSize: '14px', 
                            color: 'var(--color-body)',
                            lineHeight: '1.8',
                            textAlign: 'left'
                        }}>
                            {scoringRationale.split('\n').map((paragraph, index) => (
                                paragraph.trim() && (
                                    <p key={index} style={{ marginBottom: '12px' }}>
                                        {paragraph.trim()}
                                    </p>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Score Breakdown */}
                {scoreBreakdown && (
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '25px',
                        marginTop: '25px',
                        maxWidth: '1200px',
                        margin: '25px auto 0'
                    }}>
                        <h4 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: 'var(--color-heading-1)',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            Detailed Score Breakdown
                        </h4>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                            gap: '15px' 
                        }}>
                            {Object.entries(scoreBreakdown).filter(([key]) => typeof scoreBreakdown[key] === 'object' || typeof scoreBreakdown[key] === 'number').map(([key, value]) => {
                                const scoreValue = typeof value === 'object' ? value.score : value;
                                const isExpanded = expandedItems[key];
                                const hasComparison = typeof value === 'object' && (value.resumeItems || value.jobItems);
                                
                                return (
                                    <div key={key} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-heading-1)', textTransform: 'capitalize' }}>
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                {hasComparison && (
                                                    <button
                                                        onClick={() => toggleExpanded(key)}
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '4px',
                                                            padding: '2px 8px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            color: 'var(--color-primary)',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        {isExpanded ? '−' : '+'} Compare
                                                    </button>
                                                )}
                                            </div>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: getScoreColor(scoreValue) }}>
                                                {scoreValue}%
                                            </span>
                                        </div>
                                        <div style={{ background: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ 
                                                width: `${scoreValue}%`, 
                                                height: '100%', 
                                                background: getScoreColor(scoreValue),
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                        
                                        {/* Years of Experience Comparison (for experience section) */}
                                        {key === 'experience' && value.yearsOfExperience && (
                                            <div style={{ marginTop: '12px', padding: '10px', background: value.yearsOfExperience.match ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', border: `1px solid ${value.yearsOfExperience.match ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}>
                                                <div style={{ fontSize: '12px', fontWeight: '600', color: value.yearsOfExperience.match ? '#059669' : '#f59e0b', marginBottom: '6px' }}>
                                                    {value.yearsOfExperience.match ? '✓' : '⚠️'} Years of Experience
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-body)', lineHeight: '1.5' }}>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <strong>Your Experience:</strong> {value.yearsOfExperience.candidateYears || 'N/A'} years
                                                    </div>
                                                    <div style={{ marginBottom: '4px' }}>
                                                        <strong>Required:</strong> {value.yearsOfExperience.requiredYears || 'Not specified'}
                                                    </div>
                                                    {value.yearsOfExperience.analysis && (
                                                        <div style={{ marginTop: '6px', fontStyle: 'italic', fontSize: '11px', color: '#6b7280' }}>
                                                            {value.yearsOfExperience.analysis}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Expandable Comparison */}
                                        {hasComparison && isExpanded && (
                                            <div style={{ marginTop: '15px', padding: '12px', background: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '13px' }}>
                                                    <div>
                                                        <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#059669', marginBottom: '8px' }}>✓ On Your Resume</h5>
                                                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-body)', lineHeight: '1.6' }}>
                                                            {(value.resumeItems || []).map((item, idx) => (
                                                                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                                                            ))}
                                                            {(!value.resumeItems || value.resumeItems.length === 0) && (
                                                                <li style={{ fontStyle: 'italic', color: '#9ca3af' }}>No items identified</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#0963d3', marginBottom: '8px' }}>⚡ Required by Job</h5>
                                                        <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--color-body)', lineHeight: '1.6' }}>
                                                            {(value.jobItems || []).map((item, idx) => (
                                                                <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                                                            ))}
                                                            {(!value.jobItems || value.jobItems.length === 0) && (
                                                                <li style={{ fontStyle: 'italic', color: '#9ca3af' }}>No items identified</li>
                                                            )}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="results-grid">
                {/* Strengths Card */}
                <div className="result-card strengths">
                    <div className="card-header">
                        <div className="card-icon">
                            ✅
                        </div>
                        <h3 className="card-title">Your Strengths</h3>
                    </div>
                    <ul className="result-list">
                        {strengths.map((strength, index) => (
                            <li key={index} className="result-item">
                                {strength}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Gaps Card */}
                <div className="result-card gaps">
                    <div className="card-header">
                        <div className="card-icon">
                            ⚠️
                        </div>
                        <h3 className="card-title">Gaps to Address</h3>
                    </div>
                    <ul className="result-list">
                        {gaps.map((gap, index) => (
                            <li key={index} className="result-item">
                                {gap}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recommendations Card */}
                <div className="result-card recommendations">
                    <div className="card-header">
                        <div className="card-icon">
                            💡
                        </div>
                        <h3 className="card-title">Recommendations</h3>
                    </div>
                    <ul className="result-list">
                        {recommendations.map((recommendation, index) => (
                            <li key={index} className="result-item">
                                {recommendation}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ATS Optimization Card */}
                <div className="result-card ats-optimization">
                    <div className="card-header">
                        <div className="card-icon">
                            🤖
                        </div>
                        <h3 className="card-title">ATS Optimization</h3>
                    </div>
                    <ul className="result-list">
                        {atsOptimization && atsOptimization.length > 0 ? (
                            atsOptimization.map((item, index) => (
                                <li key={index} className="result-item">
                                    {item}
                                </li>
                            ))
                        ) : (
                            <>
                                <li className="result-item">Use industry-standard section headings (Experience, Education, Skills)</li>
                                <li className="result-item">Include relevant keywords from the job description throughout your resume</li>
                                <li className="result-item">Use standard fonts (Arial, Calibri, Times New Roman) for better parsing</li>
                                <li className="result-item">Avoid tables, graphics, and complex formatting that ATS may not read</li>
                                <li className="result-item">Save your resume as a .docx file for optimal ATS compatibility</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* CV Tailoring Loading State */}
            {isTailoringCV && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.1), rgba(9, 99, 211, 0.05))',
                    border: '2px solid rgba(9, 99, 211, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '30px',
                    maxWidth: '800px',
                    margin: '30px auto 0',
                    textAlign: 'center'
                }}>
                    <div className="processing-spinner" style={{ margin: '0 auto 15px' }}></div>
                    <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: 'var(--color-primary)',
                        marginBottom: '10px'
                    }}>
                        🤖 Tailoring Your CV...
                    </h4>
                    <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-body)'
                    }}>
                        We&apos;re extracting your resume details, tailoring the content to match the job description, and generating your optimized CV. This may take a minute...
                    </p>
                </div>
            )}

            {/* CV Tailoring Error Message */}
            {cvTailoringError && !isTailoringCV && (
                <div style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '2px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '30px',
                    maxWidth: '800px',
                    margin: '30px auto 0',
                    textAlign: 'center'
                }}>
                    <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#dc3545',
                        marginBottom: '10px'
                    }}>
                        ⚠️ CV Tailoring Failed
                    </h4>
                    <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-body)',
                        marginBottom: '15px'
                    }}>
                        {cvTailoringError}
                    </p>
                    {onTailorCVNow && (
                        <button 
                            className="action-btn"
                            onClick={() => {
                                setShowTailorCVOption(true);
                            }}
                            style={{ 
                                padding: '10px 20px',
                                fontSize: '14px',
                                backgroundColor: 'var(--color-primary)',
                                borderColor: 'var(--color-primary)',
                                fontWeight: '600'
                            }}
                        >
                            Try Again
                        </button>
                    )}
                </div>
            )}

            {/* Option to Tailor CV Now (if not already done) */}
            {showTailorCVOption && !tailoredCVData && !isTailoringCV && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))',
                    border: '2px solid rgba(255, 193, 7, 0.3)',
                    borderRadius: '12px',
                    padding: '25px',
                    marginTop: '30px',
                    maxWidth: '800px',
                    margin: '30px auto 0'
                }}>
                    <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#ffc107',
                        marginBottom: '10px',
                        textAlign: 'center'
                    }}>
                        ✨ Tailor your resume with our templates
                    </h4>
                    <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-body)',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        Get an AI-tailored resume optimized for this specific job. We&apos;ll extract your resume details, tailor the content to match the job description, and open it in our resume builder where you can edit and download it.
                    </p>
                    
                    <TemplateSelector
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={setSelectedTemplate}
                        disabled={isTailoringCV}
                        compact={false}
                    />

                    <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {onTailorCVNow ? (
                            <>
                                <button 
                                    className="action-btn"
                                    onClick={() => {
                                        onTailorCVNow(selectedTemplate);
                                        setShowTailorCVOption(false);
                                    }}
                                    disabled={isTailoringCV}
                                    style={{ 
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffc107',
                                        borderColor: '#ffc107',
                                        color: '#000',
                                        fontWeight: '600',
                                        cursor: isTailoringCV ? 'not-allowed' : 'pointer',
                                        opacity: isTailoringCV ? 0.6 : 1
                                    }}
                                >
                                    {isTailoringCV ? 'Tailoring...' : '✨ Tailor My Resume'}
                                </button>
                                <button 
                                    onClick={() => setShowTailorCVOption(false)}
                                    style={{ 
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #6b7280',
                                        color: '#6b7280',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Maybe Later
                                </button>
                            </>
                        ) : (
                            <p style={{ 
                                fontSize: '14px', 
                                color: '#6b7280',
                                fontStyle: 'italic'
                            }}>
                                Please refresh the page to enable CV tailoring.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Tailored CV Success Message */}
            {tailoredCVData && !isTailoringCV && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '30px',
                    maxWidth: '800px',
                    margin: '30px auto 0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h4 style={{ 
                            fontSize: '18px', 
                            fontWeight: '600', 
                            color: '#10b981',
                            marginBottom: '10px'
                        }}>
                            ✅ Your Tailored CV is Ready!
                        </h4>
                        <p style={{ 
                            fontSize: '14px', 
                            color: 'var(--color-body)',
                            marginBottom: '15px'
                        }}>
                            Your resume has been tailored to match this job description. Open it in our resume builder to review, edit, and download your optimized CV.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button 
                                className="action-btn"
                                onClick={handleOpenResumeBuilder}
                                style={{ 
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    backgroundColor: '#10b981',
                                    borderColor: '#10b981',
                                    fontWeight: '600'
                                }}
                            >
                                ✏️ Open in Resume Builder
                            </button>
                            {onTailorCVNow && (
                                <button 
                                    className="action-btn"
                                    onClick={() => setShowChangeTemplate(true)}
                                    style={{ 
                                        padding: '12px 24px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        border: '2px solid #10b981',
                                        color: '#10b981',
                                        fontWeight: '600'
                                    }}
                                >
                                    🎨 Change Template
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Change Template Section */}
                    {showChangeTemplate && onTailorCVNow && (
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '20px',
                            borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                            <TemplateSelector
                                selectedTemplate={selectedTemplate}
                                onTemplateSelect={setSelectedTemplate}
                                disabled={isTailoringCV}
                                compact={true}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
                                <button 
                                    className="action-btn"
                                    onClick={() => {
                                        onTailorCVNow(selectedTemplate);
                                        setShowChangeTemplate(false);
                                    }}
                                    disabled={isTailoringCV}
                                    style={{ 
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        backgroundColor: '#10b981',
                                        borderColor: '#10b981',
                                        fontWeight: '600',
                                        cursor: isTailoringCV ? 'not-allowed' : 'pointer',
                                        opacity: isTailoringCV ? 0.6 : 1
                                    }}
                                >
                                    {isTailoringCV ? 'Regenerating...' : '🔄 Regenerate with New Template'}
                                </button>
                                <button 
                                    onClick={() => setShowChangeTemplate(false)}
                                    style={{ 
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #6b7280',
                                        color: '#6b7280',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="results-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginTop: '30px' }}>
                <button 
                    className="action-btn secondary"
                    onClick={onNewAnalysis}
                    style={{ 
                        padding: '8px 16px',
                        fontSize: '13px',
                        width: 'auto',
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Analyze Another Job
                </button>
                <button 
                    className="action-btn"
                    onClick={handleDownloadResults}
                    style={{ 
                        padding: '8px 16px',
                        fontSize: '13px',
                        width: 'auto',
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Download Results
                </button>
            </div>

            <div className="results-metadata" style={{ textAlign: 'center' }}>
                <p>
                    Analysis completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
