"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

const ResumeEditor = ({ template, onBack, isAuthenticated }) => {
    const [resumeContent, setResumeContent] = useState(template.editableHtml);
    const [isExporting, setIsExporting] = useState(false);
    const [lastSaved, setLastSaved] = useState(new Date());
    const previewRef = useRef(null);
    const contentRef = useRef(template.editableHtml);

    // Auto-save function
    const autoSave = useCallback((content) => {
        if (content && content.trim() !== '') {
            const saveTime = new Date();
            localStorage.setItem(`resume_${template.id}`, JSON.stringify({
                templateId: template.id,
                content: content,
                lastModified: saveTime.toISOString()
            }));
            setLastSaved(saveTime);
        }
    }, [template.id]);

    // Debounce function
    const debounce = useCallback((func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }, []);

    // Use a debounced function to update content
    const debouncedContentUpdate = useCallback(
        debounce((content) => {
            setResumeContent(content);
            autoSave(content);
        }, 500),
        [] // eslint-disable-line react-hooks/exhaustive-deps
    );

    useEffect(() => {
        // Update the ref when resumeContent changes
        contentRef.current = resumeContent;
    }, [resumeContent]);

    useEffect(() => {
        // Enable contenteditable for all sections
        if (previewRef.current) {
            const editableSections = previewRef.current.querySelectorAll('[contenteditable="true"]');
            
            const handleContentChange = (e) => {
                // Update the ref immediately for real-time editing
                contentRef.current = previewRef.current.innerHTML;
                // Debounce the state update to prevent re-rendering
                debouncedContentUpdate(previewRef.current.innerHTML);
            };

            const handleKeyDown = (e) => {
                // Handle backspace and delete keys
                if (e.key === 'Backspace' || e.key === 'Delete') {
                    // Small delay to let the browser handle the deletion first
                    setTimeout(() => {
                        contentRef.current = previewRef.current.innerHTML;
                        debouncedContentUpdate(previewRef.current.innerHTML);
                    }, 10);
                }
            };

            const handlePaste = (e) => {
                // Handle paste events
                setTimeout(() => {
                    contentRef.current = previewRef.current.innerHTML;
                    debouncedContentUpdate(previewRef.current.innerHTML);
                }, 10);
            };

            editableSections.forEach(section => {
                section.addEventListener('input', handleContentChange);
                section.addEventListener('keydown', handleKeyDown);
                section.addEventListener('paste', handlePaste);
                section.addEventListener('cut', handleContentChange);
            });

            return () => {
                editableSections.forEach(section => {
                    section.removeEventListener('input', handleContentChange);
                    section.removeEventListener('keydown', handleKeyDown);
                    section.removeEventListener('paste', handlePaste);
                    section.removeEventListener('cut', handleContentChange);
                });
            };
        }
    }, [debouncedContentUpdate]);

    const addSection = (sectionType) => {
        const newSectionHtml = getSectionTemplate(sectionType);
        const parser = new DOMParser();
        const currentContent = contentRef.current || resumeContent;
        const doc = parser.parseFromString(currentContent, 'text/html');
        
        const newSection = parser.parseFromString(newSectionHtml, 'text/html').body.firstChild;
        const resumeTemplate = doc.querySelector('.resume-template');
        
        if (resumeTemplate) {
            resumeTemplate.appendChild(newSection);
            const newContent = resumeTemplate.outerHTML;
            contentRef.current = newContent;
            setResumeContent(newContent);
            autoSave(newContent); // Auto-save immediately
            toast.success(`${sectionType} section added!`);
        }
    };

    const removeSection = (sectionName) => {
        if (previewRef.current) {
            const section = previewRef.current.querySelector(`[data-section="${sectionName}"]`);
            if (section) {
                section.remove();
                const newContent = previewRef.current.innerHTML;
                contentRef.current = newContent;
                setResumeContent(newContent);
                autoSave(newContent); // Auto-save immediately
                toast.success(`${sectionName} section removed!`);
            }
        }
    };

    const getSectionTemplate = (sectionType) => {
        const templates = {
            experience: `
                <section data-section="experience" contenteditable="true">
                    <h2>Work Experience</h2>
                    <div class="job">
                        <h3>Job Title</h3>
                        <div class="company-date">Company Name | Year - Year</div>
                        <ul>
                            <li>Key achievement or responsibility</li>
                            <li>Another achievement with metrics</li>
                        </ul>
                    </div>
                </section>
            `,
            education: `
                <section data-section="education" contenteditable="true">
                    <h2>Education</h2>
                    <div class="education-item">
                        <h3>Degree Name</h3>
                        <div class="school-date">University Name | Year</div>
                    </div>
                </section>
            `,
            skills: `
                <section data-section="skills" contenteditable="true">
                    <h2>Skills</h2>
                    <ul class="skills-list">
                        <li>Skill 1</li>
                        <li>Skill 2</li>
                        <li>Skill 3</li>
                    </ul>
                </section>
            `,
            projects: `
                <section data-section="projects" contenteditable="true">
                    <h2>Projects</h2>
                    <div class="project">
                        <h3>Project Name</h3>
                        <div class="project-date">Year</div>
                        <p>Brief description of the project and your role.</p>
                    </div>
                </section>
            `,
            certifications: `
                <section data-section="certifications" contenteditable="true">
                    <h2>Certifications</h2>
                    <div class="certification">
                        <h3>Certification Name</h3>
                        <div class="cert-date">Issuing Organization | Year</div>
                    </div>
                </section>
            `
        };
        
        return templates[sectionType] || '';
    };

    const getCompleteCSS = () => {
        return `
            /* Reset and Base Styles */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Calibri', 'Arial', 'Helvetica', sans-serif;
                font-size: 11pt; /* Professional body text size */
                line-height: 1.3; /* Professional line spacing */
                color: #1A1A1A; /* Very dark gray instead of pure black */
                background: white;
                margin: 0;
                padding: 0;
            }
            
            .resume-template {
                width: 100% !important; /* Force full width */
                max-width: none !important; /* Remove max-width constraint */
                margin: 0 !important;
                background: white;
                padding: 0.5in 0.25in !important; /* Much smaller padding */
                font-family: 'Calibri', 'Arial', 'Helvetica', sans-serif;
                line-height: 1.3;
                color: #1A1A1A;
                box-sizing: border-box;
            }
            
            /* Typography Hierarchy */
            h1 {
                font-size: 24pt; /* Name/Header size */
                font-weight: bold;
                margin-bottom: 8pt;
                line-height: 1.2;
                color: #000000;
            }
            
            h2 {
                font-size: 14pt; /* Section headings */
                font-weight: bold;
                margin-top: 20pt; /* Space above sections */
                margin-bottom: 10pt;
                line-height: 1.2;
                color: #1A1A1A;
            }
            
            h3 {
                font-size: 12pt; /* Job titles, education degrees */
                font-weight: bold;
                margin-bottom: 4pt;
                line-height: 1.2;
                color: #1A1A1A;
            }
            
            p {
                font-size: 11pt; /* Body text */
                line-height: 1.3;
                margin-bottom: 8pt;
                color: #1A1A1A;
            }
            
            /* Modern Professional Template */
            .modern-professional {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }
            
            .modern-professional header {
                text-align: center;
                margin-bottom: 24pt;
                padding-bottom: 12pt;
                border-bottom: 2pt solid #1A1A1A;
                width: 100% !important;
            }
            
            .modern-professional .name {
                font-size: 26pt; /* Large but professional name size */
                font-weight: bold;
                color: #000000; /* Black for name */
                margin-bottom: 8pt;
                line-height: 1.1;
            }
            
            .modern-professional .contact-info {
                display: flex;
                justify-content: center;
                gap: 16pt;
                flex-wrap: wrap;
                margin-bottom: 0;
                font-size: 10pt; /* Subtext size */
                color: #1A1A1A;
            }
            
            .modern-professional .contact-info span {
                color: #1A1A1A;
            }
            
            .modern-professional h2 {
                color: #1A1A1A;
                font-size: 14pt;
                font-weight: bold;
                margin-top: 20pt;
                margin-bottom: 10pt;
                padding-bottom: 2pt;
                border-bottom: 1pt solid #1A1A1A;
                line-height: 1.2;
                width: 100% !important;
                display: block !important;
            }
            
            .modern-professional .job {
                margin-bottom: 16pt; /* Space between job entries */
            }
            
            .modern-professional .job h3 {
                font-size: 12pt;
                font-weight: bold;
                color: #1A1A1A;
                margin-bottom: 2pt;
            }
            
            .modern-professional .company-date {
                color: #666666; /* Gray for dates */
                font-style: italic;
                font-size: 10pt; /* Subtext size */
                margin-bottom: 6pt;
            }
            
            .modern-professional ul {
                margin: 0;
                padding-left: 16pt;
                margin-bottom: 8pt;
            }
            
            .modern-professional li {
                margin-bottom: 4pt; /* 8-16px between bullet points */
                font-size: 11pt;
                line-height: 1.3;
                list-style-type: disc; /* Round bullets */
            }
            
            /* Creative Designer Template */
            .creative-designer {
                display: flex;
                min-height: auto;
                font-family: 'Calibri', 'Arial', sans-serif;
                width: 100%;
            }
            
            .creative-designer .sidebar {
                width: 35%;
                background: #2E4A6B; /* Professional navy instead of gradient */
                color: white;
                padding: 24pt;
            }
            
            .creative-designer .sidebar .name {
                font-size: 20pt; /* Slightly smaller for sidebar */
                font-weight: bold;
                text-align: center;
                margin-bottom: 8pt;
                line-height: 1.1;
            }
            
            .creative-designer .sidebar .title {
                text-align: center;
                margin-bottom: 20pt;
                font-size: 12pt;
                font-style: italic;
            }
            
            .creative-designer .sidebar .contact-info {
                text-align: center;
                margin-bottom: 20pt;
                font-size: 10pt;
            }
            
            .creative-designer .sidebar h2 {
                font-size: 12pt;
                font-weight: bold;
                margin-top: 16pt;
                margin-bottom: 8pt;
                padding-bottom: 4pt;
                border-bottom: 1pt solid rgba(255, 255, 255, 0.5);
                color: white;
            }
            
            .creative-designer .main-content {
                width: 65%;
                padding: 24pt;
            }
            
            .creative-designer .main-content h2 {
                color: #2E4A6B;
                font-size: 14pt;
                font-weight: bold;
                margin-top: 20pt;
                margin-bottom: 10pt;
                padding-bottom: 2pt;
                border-bottom: 2pt solid #2E4A6B;
                line-height: 1.2;
            }
            
            /* Executive Professional Template */
            .executive-professional {
                background: #F8F9FA; /* Very light gray background */
                padding: 32pt;
                font-family: 'Georgia', 'Times New Roman', serif; /* Serif for executive feel */
            }
            
            .executive-professional header {
                text-align: center;
                margin-bottom: 32pt;
                padding-bottom: 16pt;
                border-bottom: 3pt solid #1A1A1A;
            }
            
            .executive-professional .name {
                font-size: 28pt; /* Larger for executive level */
                font-weight: bold;
                margin-bottom: 6pt;
                line-height: 1.2;
                color: #1A1A1A;
            }
            
            .executive-professional .title {
                font-size: 14pt;
                margin-bottom: 12pt;
                line-height: 1.2;
                color: #666666;
                font-style: italic;
            }
            
            .executive-professional .contact-bar {
                display: flex;
                justify-content: center;
                gap: 20pt;
                flex-wrap: wrap;
                font-size: 10pt;
                color: #1A1A1A;
            }
            
            .executive-professional h2 {
                color: #1A1A1A;
                font-size: 14pt;
                font-weight: bold;
                margin-top: 24pt;
                margin-bottom: 12pt;
                padding-bottom: 4pt;
                border-bottom: 2pt solid #1A1A1A;
                line-height: 1.2;
            }
            
            .executive-professional .job-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 4pt;
            }
            
            .executive-professional .job-header h3 {
                font-size: 12pt;
                font-weight: bold;
                color: #1A1A1A;
                line-height: 1.2;
                margin: 0;
            }
            
            .executive-professional .date {
                color: #666666;
                font-weight: normal;
                font-size: 10pt;
            }
            
            .executive-professional .company {
                color: #666666;
                margin-bottom: 6pt;
                font-size: 10pt;
                font-style: italic;
            }
            
            /* Minimal Clean Template */
            .minimal-clean {
                max-width: 8.5in;
                margin: 0 auto;
                font-family: 'Georgia', 'Times New Roman', serif;
                line-height: 1.4;
            }
            
            .minimal-clean header {
                margin-bottom: 24pt;
                padding-bottom: 8pt;
                border-bottom: 1pt solid #1A1A1A;
            }
            
            .minimal-clean .name {
                font-size: 24pt;
                font-weight: normal;
                color: #1A1A1A;
                margin-bottom: 6pt;
                line-height: 1.2;
            }
            
            .minimal-clean .contact-info {
                color: #666666;
                font-size: 10pt;
            }
            
            .minimal-clean h2 {
                color: #1A1A1A;
                font-size: 12pt;
                font-weight: bold;
                margin-bottom: 8pt;
                margin-top: 20pt;
                text-transform: uppercase;
                letter-spacing: 1pt;
                line-height: 1.2;
                border-bottom: none; /* Minimal style - no underlines */
            }
            
            .minimal-clean .job {
                margin-bottom: 16pt;
            }
            
            .minimal-clean .job h3 {
                font-size: 11pt;
                font-weight: bold;
                color: #1A1A1A;
                margin-bottom: 2pt;
            }
            
            .minimal-clean .company-date {
                color: #666666;
                font-style: italic;
                font-size: 10pt;
                margin-bottom: 6pt;
            }
            
            /* Common Professional Styles */
            ul {
                margin: 0;
                padding-left: 16pt;
            }
            
            li {
                margin-bottom: 4pt;
                font-size: 11pt;
                line-height: 1.3;
                list-style-type: disc; /* Professional round bullets */
            }
            
            section {
                margin-bottom: 20pt; /* 16-32px between sections */
            }
            
            .skills-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8pt;
                list-style: none;
                padding: 0;
            }
            
            .skills-list li {
                background: #F0F0F0;
                padding: 4pt 8pt;
                border-radius: 3pt;
                margin-bottom: 0;
                font-size: 10pt;
                color: #1A1A1A;
            }
            
            .skill-item {
                margin-bottom: 8pt;
                font-size: 10pt;
            }
            
            .skill-bar {
                background: rgba(255, 255, 255, 0.3);
                height: 6pt;
                border-radius: 3pt;
                margin-top: 2pt;
                overflow: hidden;
            }
            
            .skill-level {
                background: white;
                height: 100%;
                border-radius: 3pt;
            }
            
            .contact-item {
                margin-bottom: 4pt;
                font-size: 10pt;
            }
            
            .profile-photo {
                width: 80pt;
                height: 80pt;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                margin: 0 auto 12pt;
            }
            
            .education-item {
                margin-bottom: 12pt;
            }
            
            .school-date {
                color: #666666;
                font-style: italic;
                font-size: 10pt;
            }
            
            .project {
                margin-bottom: 16pt;
            }
            
            .project-date {
                color: #666666;
                font-style: italic;
                font-size: 10pt;
                margin-bottom: 4pt;
            }
            
            .certification {
                margin-bottom: 12pt;
            }
            
            .cert-date {
                color: #666666;
                font-style: italic;
                font-size: 10pt;
            }
            
            /* Print/PDF Optimization */
            @media print {
                body { 
                    margin: 0; 
                    padding: 0; 
                    background: white !important;
                    font-size: 11pt;
                    line-height: 1.3;
                }
                .resume-template { 
                    box-shadow: none; 
                    padding: 1in 0.75in;
                    max-width: none;
                }
                .creative-designer {
                    min-height: auto;
                }
                /* Ensure page breaks don't split content awkwardly */
                .job, .education-item, .project, .certification {
                    page-break-inside: avoid;
                }
                h2 {
                    page-break-after: avoid;
                }
            }
        `;
    };

    const exportToPDF = async () => {
        if (!isAuthenticated) {
            toast.error('Please register or login to export PDF files');
            return;
        }

        setIsExporting(true);
        try {
            // Force update the content ref with current DOM state
            if (previewRef.current) {
                contentRef.current = previewRef.current.innerHTML;
            }
            
            // Get the current content (use ref for most up-to-date content)
            const currentContent = contentRef.current || resumeContent;
            
            if (!currentContent || currentContent.trim() === '') {
                toast.error('Please add some content to your resume first');
                return;
            }
            
            const element = document.createElement('div');
            element.innerHTML = currentContent;
            element.style.cssText = `
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: white;
            `;

            // Additional styling for better PDF appearance
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    * { box-sizing: border-box; }
                    body { margin: 0; padding: 0; }
                    h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
                    p, li { page-break-inside: avoid; }
                    .no-print { display: none !important; }
                }
                h1 { font-size: 24px; margin-bottom: 10px; color: #2c3e50; }
                h2 { font-size: 20px; margin-bottom: 8px; color: #34495e; }
                h3 { font-size: 18px; margin-bottom: 6px; color: #34495e; }
                p { margin-bottom: 8px; }
                ul, ol { margin-bottom: 10px; padding-left: 20px; }
                li { margin-bottom: 4px; }
                .contact-info { margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .section-title { 
                    border-bottom: 2px solid #3498db; 
                    padding-bottom: 5px; 
                    margin-bottom: 15px; 
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(element);

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `resume-${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    putOnlyUsedFonts: true,
                    floatPrecision: 16
                }
            };

            await html2pdf().set(opt).from(element).save();
            
            // Cleanup
            document.body.removeChild(element);
            document.head.removeChild(style);
            
            toast.success('PDF exported successfully!');
        } catch (error) {
            toast.error('Failed to export PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportToHTML = () => {
        if (!isAuthenticated && template.category === 'premium') {
            toast.error('Please login to export premium templates');
            return;
        }

        // Force update the content ref with current DOM state
        if (previewRef.current) {
            contentRef.current = previewRef.current.innerHTML;
        }

        // Get the current content (use ref for most up-to-date content)
        const currentContent = contentRef.current || resumeContent;

        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.title} - Resume</title>
    <link href="https://fonts.googleapis.com/css2?family=Calibri:ital,wght@0,400;0,700;1,400;1,700&family=Georgia:ital,wght@0,400;0,700;1,400;1,700&family=Arial:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
    <style>
        ${getCompleteCSS()}
    </style>
</head>
<body>
    ${currentContent}
</body>
</html>
        `;

        const element = document.createElement('a');
        const file = new Blob([fullHtml], { type: 'text/html' });
        element.href = URL.createObjectURL(file);
        element.download = `${template.title.replace(/\s+/g, '_')}_Resume.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        
        toast.success('HTML file downloaded with full styling!');
    };

    const saveResume = () => {
        // Force update the content ref with current DOM state FIRST
        if (previewRef.current) {
            contentRef.current = previewRef.current.innerHTML;
        }
        
        // Get the current content (use ref for most up-to-date content)
        const currentContent = contentRef.current || resumeContent;
        
        // Update React state to match current content
        setResumeContent(currentContent);
        
        // Save the current content (not triggering auto-save to avoid double-save)
        try {
            const saveTime = new Date();
            localStorage.setItem(`resume_${template.id}`, JSON.stringify({
                templateId: template.id,
                content: currentContent,
                lastModified: saveTime.toISOString()
            }));
            setLastSaved(saveTime);
            toast.success('Resume saved manually!');
        } catch (error) {
            toast.error('Failed to save resume');
        }
    };

    return (
        <div className="resume-editor">
            <div className="editor-sidebar">
                <div className="editor-controls">
                    <div className="control-group">
                        <h3>Add Sections</h3>
                        <button 
                            className="control-btn" 
                            onClick={() => addSection('experience')}
                        >
                            + Work Experience
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => addSection('education')}
                        >
                            + Education
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => addSection('skills')}
                        >
                            + Skills
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => addSection('projects')}
                        >
                            + Projects
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => addSection('certifications')}
                        >
                            + Certifications
                        </button>
                    </div>

                    <div className="control-group">
                        <h3>Remove Sections</h3>
                        <button 
                            className="control-btn" 
                            onClick={() => removeSection('experience')}
                        >
                            - Work Experience
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => removeSection('education')}
                        >
                            - Education
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => removeSection('skills')}
                        >
                            - Skills
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => removeSection('projects')}
                        >
                            - Projects
                        </button>
                        <button 
                            className="control-btn" 
                            onClick={() => removeSection('certifications')}
                        >
                            - Certifications
                        </button>
                    </div>
                </div>

                <div className="export-controls">
                    <h3>Actions</h3>
                    <button 
                        className="export-btn" 
                        onClick={saveResume}
                    >
                        💾 Save Resume
                    </button>
                    <button 
                        className="export-btn" 
                        onClick={exportToHTML}
                        disabled={!isAuthenticated && template.category === 'premium'}
                    >
                        📄 Export HTML
                    </button>
                    <button 
                        className="export-btn" 
                        onClick={exportToPDF}
                        disabled={isExporting || !isAuthenticated}
                        title={!isAuthenticated ? 'Please register or login to export PDF files' : ''}
                    >
                        {isExporting ? '⏳ Exporting...' : '📑 Export PDF'}
                        {!isAuthenticated && <span style={{ fontSize: '1rem', display: 'block' }}>Login Required</span>}
                    </button>
                </div>
            </div>

            <div className="resume-preview">
                <div className="preview-header">
                    <h3 className="preview-title">
                        Editing: {template.title}
                    </h3>
                    <div className="auto-save-status">
                        <small style={{ color: '#666', fontSize: '0.8rem' }}>
                            Auto-saved at {lastSaved.toLocaleTimeString()}
                        </small>
                    </div>
                    <button className="back-btn" onClick={onBack}>
                        ← Back to Templates
                    </button>
                </div>
                
                <div className="preview-content">
                    <div 
                        ref={previewRef}
                        dangerouslySetInnerHTML={{ __html: resumeContent }}
                        style={{ outline: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResumeEditor; 