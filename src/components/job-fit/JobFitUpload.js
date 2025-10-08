import React, { useState, useRef, useEffect } from 'react';

export default function JobFitUpload({ onAnalysisSubmit, isProcessing }) {
    const [jobDescription, setJobDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);

    // Job fit tips that rotate every 5 seconds
    const jobFitTips = [
        "💡 Tip: Include specific skills mentioned in the job description to show alignment",
        "📊 Tip: Highlight quantifiable achievements that match the role's requirements",
        "🎯 Tip: Use keywords from the job posting to demonstrate understanding",
        "📝 Tip: Tailor your experience examples to match the job's key responsibilities",
        "🔍 Tip: Research the company culture and mention relevant values or mission",
        "📈 Tip: Show career progression that aligns with the role's growth opportunities",
        "🎨 Tip: Format your resume to emphasize the most relevant sections first",
        "⚡ Tip: Include soft skills that complement the technical requirements mentioned"
    ];

    // Progress simulation and tip rotation
    useEffect(() => {
        if (isProcessing) {
            setProgress(0);
            setCurrentTipIndex(0);
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 15;
                });
            }, 1000);
            const tipInterval = setInterval(() => {
                setCurrentTipIndex(prev => (prev + 1) % jobFitTips.length);
            }, 5000);
            return () => {
                clearInterval(progressInterval);
                clearInterval(tipInterval);
            };
        } else {
            setProgress(0);
            setCurrentTipIndex(0);
        }
    }, [isProcessing]);

    const validateFile = (file) => {
        const allowedTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        const allowedExtensions = ['.docx', '.doc'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type) && !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
            return 'Please upload a DOCX or DOC file';
        }

        if (file.size > maxSize) {
            return 'File size must be less than 5MB';
        }

        return null;
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file) => {
        setUploadError('');
        const error = validateFile(file);
        if (error) {
            setUploadError(error);
            setSelectedFile(null);
            return;
        }
        setSelectedFile(file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const clearFile = () => {
        setSelectedFile(null);
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!jobDescription.trim() || !selectedFile) {
            return;
        }

        onAnalysisSubmit({
            jobDescription: jobDescription.trim(),
            resumeFile: selectedFile
        });
    };

    const handleJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
    };

    const isFormValid = jobDescription.trim().length >= 50 && selectedFile !== null;

    return (
        <div className="rts-banner-area-start" style={{ padding: '60px 0' }}>
            <div className="container container-job-fit">
                {!isProcessing ? (
                    <form onSubmit={handleSubmit}>
                        <div className="row align-items-start">
                            {/* Left Column: 70% width - Title, Paragraph, Job Description */}
                            <div className="col-lg-8 col-md-12 job-fit-upload-left">
                                <div className="banner-wrapper-one banner-wrapper-one-job-fit">
                                    <span className="pre-title" data-aos="fade-up" data-aos-duration="1000"></span>
                                    <h1 className="title job-fit-title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300" style={{ color: 'var(--color-heading-1)' }}>
                                        Find Your <span style={{ color: 'var(--color-primary)' }}>Perfect Job </span><br />Match Today
                                    </h1>
                                    <p data-aos="fade-up" data-aos-delay="500" style={{ color: 'var(--color-body)' }}>
                                        Submit a job description and your resume to receive an objective analysis of how well you fit the role. Get honest, actionable feedback to improve your chances of landing your dream job.
                                    </p>
                                </div>

                                {/* Job Description */}
                                <div className="form-group" style={{ marginTop: '40px' }}>
                                    <label className="form-label" htmlFor="jobDescription" style={{ fontSize: '18px', marginBottom: '12px', display: 'block', color: 'var(--color-heading-1)' }}>
                                        Job Description
                                    </label>
                                    <textarea
                                        id="jobDescription"
                                        className="form-textarea"
                                        placeholder="Paste the complete job description here. Include requirements, responsibilities, and qualifications..."
                                        value={jobDescription}
                                        onChange={handleJobDescriptionChange}
                                        maxLength={5000}
                                        required
                                        style={{ minHeight: '200px' }}
                                    />
                                    <div className="character-count">
                                        {jobDescription.length}/5000 characters
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: 30% width - Resume Upload */}
                            <div className="col-lg-4 col-md-12">
                                <div className="upload-section" data-aos="fade-up" data-aos-duration="1000" style={{ width: '100%' }}>
                                    <div 
                                        className={`upload-area-integrated ${isDragOver ? 'drag-over' : ''}`}
                                        style={{
                                            borderRadius: 16,
                                            background: '#fcfcff',
                                            minHeight: 400,
                                            width: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '32px 24px',
                                            boxSizing: 'border-box',
                                            position: 'relative',
                                            border: isDragOver ? '2px dashed var(--color-primary)' : '2px dashed #e5e7eb'
                                        }}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 20 }}>
                                            <rect x="8" y="4" width="32" height="48" rx="6" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="2" />
                                            <path d="M24 20V40M24 40L17 33M24 40L31 33" stroke="#A3A3A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <button
                                            type="button"
                                            className="choose-file-btn"
                                            onClick={handleButtonClick}
                                            style={{
                                                background: 'none',
                                                color: '#4F46E5',
                                                fontWeight: 700,
                                                fontSize: '1.18rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                marginBottom: 6,
                                            }}
                                        >
                                            Upload your resume
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="file-input"
                                            accept=".docx,.doc"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{ color: '#6B7280', fontSize: 16, marginTop: 4, fontWeight: 500, textAlign: 'center' }}>DOCX or DOC, up to 5MB</div>
                                        {uploadError && (
                                            <div className="upload-error" style={{ marginTop: 16, fontSize: 14, background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(220, 53, 69, 0.2)', width: '100%', textAlign: 'center' }}>
                                                ⚠️ {uploadError}
                                            </div>
                                        )}
                                        {selectedFile && !uploadError && (
                                            <div className="file-info" style={{
                                                background: 'rgba(62, 183, 94, 0.1)',
                                                color: '#198754',
                                                padding: '16px 20px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(62, 183, 94, 0.2)',
                                                marginTop: '20px',
                                                fontSize: '14px',
                                                width: '100%',
                                                textAlign: 'center',
                                            }}>
                                                <strong>✓ File Selected:</strong><br />
                                                <span style={{ fontSize: '13px', wordBreak: 'break-word' }}>{selectedFile.name}</span><br />
                                                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={clearFile}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#198754',
                                                        cursor: 'pointer',
                                                        fontSize: '18px',
                                                        padding: '5px',
                                                        marginLeft: 10,
                                                    }}
                                                    title="Remove file"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        className="analyze-btn"
                                        disabled={!isFormValid || isProcessing}
                                        style={{ marginTop: '20px' }}
                                    >
                                        {isProcessing ? 'Analyzing...' : 'Analyze Job Fit'}
                                    </button>

                                    {!isFormValid && (jobDescription.length > 0 || selectedFile) && (
                                        <div style={{
                                            background: 'rgba(255, 143, 60, 0.1)',
                                            color: '#e67e22',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            marginTop: '15px',
                                            fontSize: '14px',
                                            textAlign: 'center',
                                            border: '1px solid rgba(255, 143, 60, 0.2)'
                                        }}>
                                            ⚠️ Please provide both job description (min 50 chars) and resume file
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="upload-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                <div className="processing-state">
                                    <div className="processing-spinner"></div>
                                    <h3 className="processing-title">Analyzing Your Job Fit</h3>
                                    <p className="processing-subtitle">
                                        Our AI is comparing your resume against the job requirements to provide objective feedback. This may take a few moments...
                                    </p>
                                    {/* Progress Bar */}
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '400px',
                                        margin: '30px auto',
                                        background: '#f0f0f0',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{
                                            width: `${Math.min(progress, 100)}%`,
                                            height: '12px',
                                            background: 'linear-gradient(90deg, var(--color-primary), #0856c7)',
                                            borderRadius: '10px',
                                            transition: 'width 0.5s ease',
                                            position: 'relative'
                                        }}>
                                            <div style={{
                                                position: 'absolute',
                                                top: '0',
                                                left: '0',
                                                right: '0',
                                                bottom: '0',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                                animation: 'shimmer 2s infinite'
                                            }}></div>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
                                        Progress: {Math.round(progress)}%
                                    </p>
                                    {selectedFile && (
                                        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '30px' }}>
                                            Processing: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                    {/* Rotating Tips */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(9, 99, 211, 0.05), rgba(9, 99, 211, 0.02))',
                                        border: '1px solid rgba(9, 99, 211, 0.1)',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginTop: '20px',
                                        maxWidth: '500px',
                                        margin: '20px auto 0'
                                    }}>
                                        <div style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: 'var(--color-primary)',
                                            marginBottom: '8px',
                                            textAlign: 'center'
                                        }}>
                                            💡 Job Fit Tip
                                        </div>
                                        <p style={{
                                            fontSize: '14px',
                                            color: 'var(--color-body)',
                                            textAlign: 'center',
                                            margin: '0',
                                            lineHeight: '1.5',
                                            minHeight: '40px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {jobFitTips[currentTipIndex]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
