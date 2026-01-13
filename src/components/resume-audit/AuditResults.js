import React, { useState, useEffect } from 'react';
import TemplateSelector from '@/components/job-fit/TemplateSelector';

export default function AuditResults({ auditData, onNewAudit, originalResumeFile = null }) {
    // Use the actual audit data passed from props
    const data = auditData;
    const [showTailorCVOption, setShowTailorCVOption] = useState(false);
    const [showChangeTemplate, setShowChangeTemplate] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(1);
    const [isTailoringCV, setIsTailoringCV] = useState(false);
    const [tailoredCVData, setTailoredCVData] = useState(null);
    const [cvTailoringError, setCvTailoringError] = useState(null);

    // Always show the option if there's no tailored CV and not currently tailoring
    useEffect(() => {
        if (!tailoredCVData && !isTailoringCV && !cvTailoringError) {
            setShowTailorCVOption(true);
        } else {
            setShowTailorCVOption(false);
        }
    }, [tailoredCVData, isTailoringCV, cvTailoringError]);

    const handleTailorCV = async (templateId) => {
        if (!originalResumeFile) {
            setCvTailoringError('Original resume file is required. Please upload your resume again.');
            return;
        }

        setIsTailoringCV(true);
        setCvTailoringError(null);
        setTailoredCVData(null);

        try {
            const formData = new FormData();
            formData.append('resumeFile', originalResumeFile);
            formData.append('auditData', JSON.stringify(data));
            formData.append('templateId', templateId.toString());

            const response = await fetch('/api/resume-audit/tailor-cv', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to tailor CV based on audit recommendations.');
            }

            setTailoredCVData(result.data);
        } catch (error) {
            console.error('CV tailoring error:', error);
            setCvTailoringError(error.message || 'Failed to tailor CV. Please try again.');
        } finally {
            setIsTailoringCV(false);
        }
    };

    const handleOpenResumeBuilder = () => {
        if (!tailoredCVData || !tailoredCVData.redirectUrl) {
            console.error('No tailored CV data or redirect URL available');
            return;
        }

        // Store the tailored CV data in sessionStorage
        if (tailoredCVData.resumeForm) {
            try {
                const dataKey = tailoredCVData.dataKey || new URLSearchParams(tailoredCVData.redirectUrl.split('?')[1]).get('dataKey');
                if (dataKey) {
                    const storageKey = `tailored_cv_${dataKey}`;
                    sessionStorage.setItem(storageKey, JSON.stringify({
                        form: tailoredCVData.resumeForm,
                        sections: tailoredCVData.sections || ['personal', 'summary', 'employment', 'education', 'skills']
                    }));
                }
            } catch (storageError) {
                console.error('Error storing tailored CV data:', storageError);
            }
        }

        // Redirect to resume builder
        window.location.href = tailoredCVData.redirectUrl;
    };

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

            {/* Tailoring CV Loading State */}
            {isTailoringCV && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.1), rgba(9, 99, 211, 0.05))',
                    border: '2px solid rgba(9, 99, 211, 0.3)',
                    borderRadius: '12px',
                    padding: '30px',
                    marginTop: '30px',
                    textAlign: 'center'
                }}>
                    <div className="processing-spinner" style={{
                        width: '60px',
                        height: '60px',
                        margin: '0 auto 20px'
                    }}></div>
                    <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '600', 
                        color: 'var(--color-primary)',
                        marginBottom: '10px'
                    }}>
                        🤖 Tailoring Your CV...
                    </h4>
                    <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-body)',
                        marginBottom: '15px'
                    }}>
                        We&apos;re improving your resume based on the audit recommendations, fixing weaknesses, implementing suggestions, and optimizing for ATS compatibility. This may take a minute...
                    </p>
                </div>
            )}

            {/* Tailoring CV Error */}
            {cvTailoringError && !isTailoringCV && (
                <div style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '2px solid rgba(220, 53, 69, 0.3)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginTop: '30px',
                    textAlign: 'center'
                }}>
                    <p style={{ 
                        fontSize: '14px', 
                        color: '#dc3545',
                        marginBottom: '15px'
                    }}>
                        {cvTailoringError}
                    </p>
                    <button 
                        className="action-btn"
                        onClick={() => {
                            setShowTailorCVOption(true);
                            setCvTailoringError(null);
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
                        Based on your audit results, we can automatically improve your resume by addressing all the weaknesses, implementing recommendations, fixing ATS issues, and enhancing your content. Choose a template to get started!
                    </p>
                    <TemplateSelector
                        selectedTemplate={selectedTemplate}
                        onTemplateSelect={setSelectedTemplate}
                        disabled={isTailoringCV}
                    />
                    <div style={{ textAlign: 'center', marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            className="action-btn"
                            onClick={() => {
                                handleTailorCV(selectedTemplate);
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
                    textAlign: 'center'
                }}>
                    <h4 style={{ 
                        fontSize: '18px', 
                        fontWeight: '600', 
                        color: '#10b981',
                        marginBottom: '10px'
                    }}>
                        ✅ Your Improved CV is Ready!
                    </h4>
                    <p style={{ 
                        fontSize: '14px', 
                        color: 'var(--color-body)',
                        marginBottom: '20px'
                    }}>
                        Your resume has been improved based on the audit recommendations. We&apos;ve addressed weaknesses, implemented suggestions, fixed ATS issues, and enhanced your content. Open it in our resume builder to review, edit, and download your optimized CV.
                    </p>
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button 
                            className="action-btn"
                            onClick={handleOpenResumeBuilder}
                            style={{ 
                                padding: '12px 24px',
                                fontSize: '14px',
                                backgroundColor: '#10b981',
                                borderColor: '#10b981',
                                color: '#fff',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            🚀 Open in Resume Builder
                        </button>
                        <button 
                            onClick={() => {
                                setShowChangeTemplate(true);
                            }}
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
                            Change Template
                        </button>
                    </div>
                    {showChangeTemplate && (
                        <div style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                            <TemplateSelector
                                selectedTemplate={selectedTemplate}
                                onTemplateSelect={setSelectedTemplate}
                                disabled={isTailoringCV}
                            />
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px', flexWrap: 'wrap' }}>
                                <button 
                                    onClick={() => {
                                        handleTailorCV(selectedTemplate);
                                        setShowChangeTemplate(false);
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
                                    {isTailoringCV ? 'Regenerating...' : '🔄 Regenerate with New Template'}
                                </button>
                                <button 
                                    onClick={() => setShowChangeTemplate(false)}
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
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="results-actions" style={{ textAlign: 'center', marginTop: '40px' }}>
                
            </div>
        </div>
    );
} 
