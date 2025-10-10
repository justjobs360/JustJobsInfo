import React, { useState } from 'react';

export default function JobFitResults({ analysisData, onNewAnalysis }) {
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
        if (score >= 80) return '#10b981'; // Green
        if (score >= 60) return '#f59e0b'; // Yellow
        if (score >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    const getScoreLabel = (score) => {
        if (fitLevel) return fitLevel;
        if (score >= 80) return 'Excellent Fit';
        if (score >= 60) return 'Good Fit';
        if (score >= 40) return 'Moderate Fit';
        return 'Weak Fit';
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
- 80-100: Excellent/Strong Fit - Meets or exceeds most requirements
- 60-79: Good/Partial Fit - Has transferable skills with some gaps
- 40-59: Moderate Fit - Significant gaps but potential with development
- 0-39: Weak Fit - Major misalignment with role requirements

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

            <div className="results-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
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
