import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const ResumeTemplateGrid = ({ templates, onTemplateSelect, isAuthenticated }) => {
    // Use a single state to track which card is hovered
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedTemplateForImport, setSelectedTemplateForImport] = useState(null);
    const [importFile, setImportFile] = useState(null);
    const [importError, setImportError] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [uploadBtnHoveredIndex, setUploadBtnHoveredIndex] = useState(null);
    const [useTemplateHoveredIndex, setUseTemplateHoveredIndex] = useState(null);
    const router = useRouter();

    const overlayButtonBase = {
        width: '70%',
        height: '48px',
        padding: 0,
        margin: 0,
        fontSize: '17px',
        fontWeight: 600,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
    };

    const handleOpenImportModal = (template) => {
        if (!isAuthenticated) {
            router.push('/register');
            return;
        }
        setSelectedTemplateForImport(template);
        setImportFile(null);
        setImportError('');
        setShowImportModal(true);
    };

    const handleImportFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setImportFile(null);
            return;
        }

        const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const allowedExtensions = ['.docx', '.doc'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
            setImportError('Please upload a DOCX or DOC file.');
            setImportFile(null);
            return;
        }

        if (file.size > maxSize) {
            setImportError('File size must be less than 5MB.');
            setImportFile(null);
            return;
        }

        setImportError('');
        setImportFile(file);
    };

    const handleImportSubmit = async () => {
        if (!selectedTemplateForImport || !importFile) {
            setImportError('Please choose a resume file to import.');
            return;
        }

        setIsImporting(true);
        setImportError('');

        try {
            const formData = new FormData();
            formData.append('resumeFile', importFile);
            formData.append('templateId', String(selectedTemplateForImport.id));

            const response = await fetch('/api/resume/import-to-template', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!result.success) {
                setImportError(result.error || 'Failed to import resume. Please try again.');
                setIsImporting(false);
                return;
            }

            const { resumeForm, sections, templateId, redirectUrl, dataKey } = result.data || {};
            if (!resumeForm || !redirectUrl || !dataKey) {
                setImportError('Import completed but response was incomplete. Please try again.');
                setIsImporting(false);
                return;
            }

            try {
                const storageKey = `tailored_cv_${dataKey}`;
                const sectionsToStore = sections && sections.length > 0
                    ? sections
                    : ['personal', 'summary', 'employment', 'education', 'skills'];

                if (typeof window !== 'undefined' && window.sessionStorage) {
                    window.sessionStorage.setItem(storageKey, JSON.stringify({
                        form: resumeForm,
                        sections: sectionsToStore
                    }));
                }
            } catch (storageError) {
                console.error('Error storing imported resume data in sessionStorage:', storageError);
            }

            setIsImporting(false);
            setShowImportModal(false);

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (templateId) {
                window.location.href = `/resume-builder/template/${templateId}`;
            }
        } catch (error) {
            console.error('Error importing resume into template:', error);
            setImportError('Failed to import resume. Please try again.');
            setIsImporting(false);
        }
    };

    return (
        <>
            <style>{`
                .resume-template-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 32px;
                    margin-bottom: 40px;
                    justify-items: center;
                }
                
                @media (max-width: 1200px) {
                    .resume-template-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 24px;
                    }
                }
                
                @media (max-width: 768px) {
                    .resume-template-grid {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                }
                
                @keyframes resume-import-spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div className="resume-template-grid">
                {templates.map((template, idx) => {
                    const isLocked = !isAuthenticated;
                    const isHovered = hoveredIndex === idx;
                    return (
                        <div
                            key={template.id}
                            className={`resume-template-card${isLocked ? ' locked' : ''}`}
                            style={{
                                background: '#F5F7FA',
                                borderRadius: '18px',
                                boxShadow: isHovered ? '0 12px 32px rgba(0,0,0,0.15)' : '0 4px 24px rgba(0,0,0,0.06)',
                                padding: '40px 32px 32px 32px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                minHeight: '700px',
                                maxWidth: '480px',
                                width: '100%',
                                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                                textAlign:'left',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Resume Preview with floating button on hover */}
                            <div style={{
                                width: '100%',
                                maxWidth: '370px',
                                aspectRatio: '8.5/11',
                                background: 'white',
                                borderRadius: '12px',
                                marginBottom: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                border: '1.5px solid #E3E8F0',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                                position: 'relative',
                            }}>
                                {template.thumbnail ? (
                                    <img src={template.thumbnail} alt={template.title} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: 'white' }} />
                                ) : (
                                    <span style={{ color: '#B0B0B0', fontSize: '48px', fontWeight: 700, opacity: 0.3 }}>
                                        PDF
                                    </span>
                                )}
                                {/* Use Template / Upload Resume Buttons - only on hover, floating over preview */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        right: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '82%',
                                        maxWidth: '300px',
                                        margin: '0 auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '10px',
                                        opacity: isHovered ? 1 : 0,
                                        pointerEvents: isHovered ? 'auto' : 'none',
                                        transition: 'opacity 0.2s',
                                        zIndex: 2,
                                    }}
                                >
                                    <button
                                        type="button"
                                        style={{
                                            ...overlayButtonBase,
                                            backgroundColor: useTemplateHoveredIndex === idx ? '#0856c7' : 'var(--color-primary)',
                                            color: '#fff',
                                            border: 'none',
                                            boxShadow: useTemplateHoveredIndex === idx ? '0 4px 12px rgba(9,99,211,0.35)' : '0 2px 8px rgba(9,99,211,0.25)',
                                        }}
                                        onClick={(e) => { e.stopPropagation(); onTemplateSelect(template); }}
                                        onMouseEnter={() => setUseTemplateHoveredIndex(idx)}
                                        onMouseLeave={() => setUseTemplateHoveredIndex(null)}
                                    >
                                        {isLocked ? 'Register to Use' : 'Use this template'}
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...overlayButtonBase,
                                            backgroundColor: uploadBtnHoveredIndex === idx ? '#e8f0fe' : '#ffffff',
                                            color: '#0963d3',
                                            border: `1.5px solid ${uploadBtnHoveredIndex === idx ? '#0963d3' : '#B5D2F6'}`,
                                            boxShadow: uploadBtnHoveredIndex === idx ? '0 2px 8px rgba(9,99,211,0.2)' : '0 1px 4px rgba(9,99,211,0.1)',
                                        }}
                                        onClick={(e) => { e.stopPropagation(); handleOpenImportModal(template); }}
                                        onMouseEnter={() => setUploadBtnHoveredIndex(idx)}
                                        onMouseLeave={() => setUploadBtnHoveredIndex(null)}
                                    >
                                        Upload your resume
                                    </button>
                                </div>
                            </div>
                            {/* Row: Monochrome + PDF/DOCX badges */}
                            <div style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '24px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: '1.5px solid #E3E8F0' }}>
                                        <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="#222" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="3" fill="#222"/></svg>
                                    </span>
                                    <span style={{ color: '#222', fontSize: '16px', fontWeight: 500, opacity: 0.7 }}>Monochrome</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                   
                                    <span style={{ background: '#E3E8F0', color: '#222', fontWeight: 700, fontSize: '15px', borderRadius: '6px', padding: '4px 16px', letterSpacing: '1px' }}>DOCX</span>
                                </div>
                            </div>
                        {/* Title */}
                        <h3 style={{
                            fontSize: '26px',
                            fontWeight: 700,
                            color: '#222',
                            marginBottom: '10px',
                            textAlign: 'center',
                        }}>{template.title}</h3>
                        {/* Description (derived from tags) */}
                        <div style={{
                            fontSize: '16px',
                            color: '#6B7280',
                            textAlign: 'center',
                            fontWeight: 400,
                            marginBottom: 0,
                        }}>
                            {Array.isArray(template.tags) && template.tags.length > 0
                              ? template.tags.map(t => t[0].toUpperCase() + t.slice(1)).join(' • ')
                              : 'Professional resume template'}
                        </div>
                        </div>
                    );
                })}
            </div>
            {/* Import Resume Modal */}
            {showImportModal && selectedTemplateForImport && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15,23,42,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => !isImporting && setShowImportModal(false)}
                >
                    <div
                        style={{
                            width: '100%',
                            maxWidth: '520px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            padding: '24px 24px 20px',
                            boxShadow: '0 18px 45px rgba(15,23,42,0.35)',
                            position: 'relative',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {isImporting && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.95)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    zIndex: 10,
                                }}
                            >
                                <div
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        border: '4px solid #e5e7eb',
                                        borderTopColor: 'var(--color-primary)',
                                        borderRadius: '50%',
                                        animation: 'resume-import-spin 0.8s linear infinite',
                                    }}
                                />
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                                    Importing your resume…
                                </p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                                    Opening the template in a moment
                                </p>
                            </div>
                        )}
                        <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
                            Upload your resume
                        </h3>
                        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                            We&apos;ll import your existing resume and format it into the
                            <strong> {selectedTemplateForImport.title}</strong> template. You can edit everything before downloading.
                        </p>
                        <div
                            style={{
                                border: '2px dashed #d1d5db',
                                borderRadius: '12px',
                                padding: '20px',
                                background: '#f9fafb',
                                textAlign: 'center',
                                marginBottom: '12px'
                            }}
                        >
                            <input
                                id="template-import-file-input"
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleImportFileChange}
                                style={{ display: 'none' }}
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('template-import-file-input')?.click()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontWeight: 600,
                                    fontSize: '15px',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    marginBottom: '4px'
                                }}
                                disabled={isImporting}
                            >
                                Choose DOC or DOCX file
                            </button>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>
                                DOCX or DOC, up to 5MB
                            </div>
                            {importFile && !importError && (
                                <div style={{ marginTop: '10px', fontSize: '13px', color: '#065f46' }}>
                                    <strong>Selected:</strong> {importFile.name}
                                </div>
                            )}
                        </div>
                        {importError && (
                            <div
                                style={{
                                    marginBottom: '12px',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    background: 'rgba(220,53,69,0.08)',
                                    border: '1px solid rgba(220,53,69,0.4)',
                                    color: '#b91c1c',
                                    fontSize: '13px'
                                }}
                            >
                                ⚠️ {importError}
                            </div>
                        )}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                                marginTop: '4px'
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => !isImporting && setShowImportModal(false)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: '#ffffff',
                                    color: '#374151',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    cursor: isImporting ? 'not-allowed' : 'pointer'
                                }}
                                disabled={isImporting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleImportSubmit}
                                disabled={isImporting}
                                style={{
                                    padding: '10px 18px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isImporting ? '#9ca3af' : 'var(--color-primary)',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    cursor: isImporting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isImporting ? 'Importing…' : 'Import & open template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ResumeTemplateGrid; 
