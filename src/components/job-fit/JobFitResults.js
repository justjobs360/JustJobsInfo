import React from 'react';

export default function JobFitResults({ analysisData, onNewAnalysis }) {
    const { 
        fitScore, 
        fitLevel,
        scoreBreakdown,
        scoringRationale,
        strengths, 
        gaps, 
        recommendations, 
        jobTitle, 
        companyName,
        industrySector 
    } = analysisData;

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
                            marginBottom: '10px'
                        }}>
                            📊 Scoring Rationale
                        </h4>
                        <p style={{ 
                            fontSize: '14px', 
                            color: 'var(--color-body)',
                            lineHeight: '1.6',
                            margin: 0
                        }}>
                            {scoringRationale}
                        </p>
                    </div>
                )}

                {/* Score Breakdown */}
                {scoreBreakdown && (
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '25px',
                        marginTop: '25px',
                        maxWidth: '800px',
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                            {Object.entries(scoreBreakdown).map(([key, value]) => (
                                <div key={key} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-heading-1)', textTransform: 'capitalize' }}>
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span style={{ fontSize: '16px', fontWeight: '700', color: getScoreColor(value) }}>
                                            {value}%
                                        </span>
                                    </div>
                                    <div style={{ background: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${value}%`, 
                                            height: '100%', 
                                            background: getScoreColor(value),
                                            transition: 'width 0.3s ease'
                                        }}></div>
                                    </div>
                                </div>
                            ))}
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
