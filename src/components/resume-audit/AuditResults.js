import React from 'react';

export default function AuditResults({ auditData, onNewAudit }) {
    // Use the actual audit data passed from props
    const data = auditData;

    if (!data) {
        return null;
    }

    const handleBackClick = () => {
        window.location.href = '/resume-audit';
    };

    return (
        <div className="results-section">
            {/* Back Button */}
            <div className="back-button-container" style={{
                marginBottom: '30px',
                textAlign: 'left'
            }}>
                <button 
                    onClick={handleBackClick}
                    style={{
                        background: 'none',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: 'var(--color-body)',
                        transition: 'all 0.3s ease',
                        minWidth: 'auto',
                        width: 'auto'
                    }}
                    onMouseOver={(e) => {
                        e.target.style.background = 'var(--color-primary)';
                        e.target.style.color = 'white';
                        e.target.style.borderColor = 'var(--color-primary)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = 'var(--color-body)';
                        e.target.style.borderColor = 'var(--color-border)';
                    }}
                >
                    ← Back to Resume Audit
                </button>
            </div>

            <div className="results-header">
                <div className="audit-score">{data.score}</div>
                <h2 className="results-title">Resume Audit Complete</h2>
                <p className="results-subtitle">
                    Here&apos;s your comprehensive resume analysis with actionable recommendations
                </p>
                <p className="results-metadata" style={{ fontSize: '14px', color: '#6c757d', marginTop: '10px' }}>
                    File: {data.fileName} | Processed: {new Date(data.processedAt).toLocaleString()}
                </p>
            </div>

            <div className="results-grid">
                {/* Strengths Card */}
                <div className="result-card strengths">
                    <div className="card-header">
                        <div className="card-icon">✓</div>
                        <h3 className="card-title">Strengths</h3>
                    </div>
                    <ul className="result-list">
                        {data.strengths && data.strengths.map((strength, index) => (
                            <li key={index} className="result-item">{strength}</li>
                        ))}
                    </ul>
                </div>

                {/* Weaknesses Card */}
                <div className="result-card weaknesses">
                    <div className="card-header">
                        <div className="card-icon">⚠</div>
                        <h3 className="card-title">Areas to Improve</h3>
                    </div>
                    <ul className="result-list">
                        {data.weaknesses && data.weaknesses.map((weakness, index) => (
                            <li key={index} className="result-item">{weakness}</li>
                        ))}
                    </ul>
                </div>

                {/* Improvements Card */}
                <div className="result-card improvements">
                    <div className="card-header">
                        <div className="card-icon">💡</div>
                        <h3 className="card-title">Recommendations</h3>
                    </div>
                    <ul className="result-list">
                        {data.improvements && data.improvements.map((improvement, index) => (
                            <li key={index} className="result-item">{improvement}</li>
                        ))}
                    </ul>
                </div>

                {/* ATS Compatibility Card */}
                <div className="result-card ats-compatibility">
                    <div className="card-header">
                        <div className="card-icon">🔍</div>
                        <h3 className="card-title">ATS Compatibility</h3>
                    </div>
                    <ul className="result-list">
                        {data.atsCompatibility && data.atsCompatibility.map((ats, index) => (
                            <li key={index} className="result-item">{ats}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Annotations Section (if available) */}
            {data.annotations && data.annotations.length > 0 && (
                <div className="annotations-section" style={{ marginTop: '40px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--color-heading-1)' }}>
                        Detailed Annotations
                    </h3>
                    <div className="annotations-grid" style={{ display: 'grid', gap: '15px' }}>
                        {data.annotations.map((annotation, index) => (
                            <div key={index} className="annotation-item" style={{
                                padding: '15px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                background: '#fafbfc'
                            }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-primary)' }}>
                                    {annotation.section}
                                </h4>
                                <p style={{ fontSize: '13px', marginBottom: '5px', color: '#dc3545' }}>
                                    <strong>Issue:</strong> {annotation.issue}
                                </p>
                                <p style={{ fontSize: '13px', color: '#198754' }}>
                                    <strong>Suggestion:</strong> {annotation.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="results-actions" style={{ textAlign: 'center', marginTop: '40px' }}>
                
            </div>
        </div>
    );
} 