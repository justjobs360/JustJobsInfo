"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Breadcrumb from "@/components/common/Breadcrumb";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";

import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType } from 'docx';

export default function ResumeEditorPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState(["personal", "summary", "employment", "education", "skills"]);
  const [customSections, setCustomSections] = useState([]);
  const [step, setStep] = useState(0);

  // Responsive preview scaling
  const previewWrapperRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const A4_WIDTH = 800; // Standard A4 width
  const A4_HEIGHT = Math.round(800 * 1.414); // Proper A4 aspect ratio (1:1.414)

  useEffect(() => {
    function updateScale() {
      if (!previewWrapperRef.current) return;
      const { height, width } = previewWrapperRef.current.getBoundingClientRect();
      // Use 85% of the available space for better fit
      const scaleWidth = Math.min((width * 0.85) / A4_WIDTH, 1);
      const scaleHeight = Math.min((height * 0.85) / A4_HEIGHT, 1);
      const scale = Math.min(scaleWidth, scaleHeight);
      setPreviewScale(scale);
    }
    updateScale();
    const ro = new window.ResizeObserver(updateScale);
    if (previewWrapperRef.current) ro.observe(previewWrapperRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Handle form changes from the component
  const handleFormChange = (newForm) => {
    setForm(newForm);
  };

  // Handle progress updates from the component
  const handleProgressChange = (newProgress) => {
    setProgress(newProgress);
  };

  // Handle sections updates from the component
  const handleSectionsChange = (newSections) => {
    setSections(newSections);
  };

  // Handle custom sections updates from the component
  const handleCustomSectionsChange = (newCustomSections) => {
    setCustomSections(newCustomSections);
  };

  // Handle step updates from the component
  const handleStepChange = (newStep) => {
    setStep(newStep);
  };

  // Calculate all sections with review
  const REVIEW_TAB_KEY = "review";
  const allSectionsWithReview = [...sections, REVIEW_TAB_KEY];



  // Resume preview content (WYSIWYG) - Two-Column Template (Matches Alice Hart design)
  const previewHtml = `
    <div style="display: flex; font-family: 'Arial', 'Helvetica', sans-serif; color: #333; min-height: 1040px; font-size: 11px; line-height: 1.4;">
      
      <!-- Left Sidebar -->
      <div style="width: 35%; background: #F5F5F5; padding: 32px 24px; box-sizing: border-box;">
        
        <!-- Profile Section -->
      ${form.firstName ? `
          <div style="margin-bottom: 32px;">
            <h1 style="font-size: 20px; font-weight: bold; color: #5A7BA8; margin: 0 0 6px 0; line-height: 1.2;">${form.firstName} ${form.lastName || ''}</h1>
            ${form.tagline ? `<div style="font-size: 13px; color: #333; margin: 0 0 16px 0; font-weight: 400;">${form.tagline}</div>` : ''}
          </div>
        ` : ''}

        <!-- Profile Summary -->
        ${form.summary ? `
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Profile</h3>
            <p style="font-size: 11px; color: #333; margin: 0; line-height: 1.5; text-align: justify;">${form.summary}</p>
        </div>
      ` : ''}
      
        <!-- Address -->
        ${(form.address || form.city || form.country) ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Address</h3>
            <div style="font-size: 11px; color: #333; line-height: 1.4;">
              ${form.address ? `<div>${form.address}</div>` : ''}
              <div>${form.city ? form.city : ''}${form.city && (form.country) ? ', ' : ''}${form.country || ''}</div>
            </div>
          </div>
        ` : ''}

        <!-- Email -->
        ${form.email ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Email</h3>
            <div style="font-size: 11px; color: #333;">${form.email}</div>
          </div>
        ` : ''}

        <!-- Phone -->
        ${form.phone ? `
          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Phone</h3>
            <div style="font-size: 11px; color: #333;">${form.phone}</div>
          </div>
        ` : ''}

        <!-- Skills -->
        ${(() => {
          const skillsArray = Array.isArray(form.skills) 
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
            : (form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : []);
          
          if (skillsArray.length > 0) {
          return `
              <div style="margin-bottom: 24px;">
                <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Skills</h3>
                <div style="font-size: 11px; color: #333; line-height: 1.6;">
                  ${skillsArray.map(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    return `<div style="margin-bottom: 4px;">${skillName}</div>`;
                  }).join('')}
                </div>
            </div>
          `;
          }
          return '';
        })()}

      </div>

      <!-- Main Content Area -->
      <div style="width: 65%; padding: 32px 32px; box-sizing: border-box; background: #fff;">
      
      ${sections.map(section => {
        // Skip summary as it's already in the sidebar
        if (section === 'summary') {
          return '';
        }
        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          return `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Employment History</h2>
              ${form.employment.map((job, idx) => `
                <div style="margin-bottom: 20px;">
                  <div style="margin-bottom: 8px;">
                    <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0; line-height: 1.2;">${job.jobTitle}${job.company ? ` at ${job.company}` : ''}</h3>
                    <div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${job.start}${job.start && job.end ? ' – ' : ''}${job.end}</div>
                  </div>
                  ${job.desc ? `
                    <div style="font-size: 11px; color: #333; line-height: 1.5;">
                      ${job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        ${line.trim()}
                      </div>`).join('')}
                  </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'education' && form.education && form.education[0].degree) {
          return `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Education</h2>
              ${form.education.map((edu, idx) => `
                <div style="margin-bottom: 20px;">
                  <div style="margin-bottom: 8px;">
                    <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0; line-height: 1.2;">${edu.school}${edu.location ? `, ${edu.location}` : ''}</h3>
                    <div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${edu.start}${edu.start && edu.end ? ' – ' : ''}${edu.end || ''}</div>
                  </div>
                  ${edu.degree ? `<div style="font-size: 11px; color: #333; margin-bottom: 8px; font-style: italic;">${edu.degree}</div>` : ''}
                  ${edu.desc ? `
                    <div style="font-size: 11px; color: #333; line-height: 1.5;">
                      ${edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        ${line.trim()}
                      </div>`).join('')}
                  </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'skills') {
          // Skills are displayed in the sidebar, skip here
          return '';
        }
        if (section === 'projects' && form.projects && form.projects[0].name) {
          return `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Projects</h2>
              ${form.projects.map((proj, idx) => `
                <div style="margin-bottom: 20px;">
                  <div style="margin-bottom: 8px;">
                    <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0; line-height: 1.2;">${proj.name}</h3>
                    ${proj.date ? `<div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${proj.date}</div>` : ''}
                  </div>
                  ${proj.desc ? `
                    <div style="font-size: 11px; color: #333; line-height: 1.5;">
                      ${proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                        <span style="position: absolute; left: 0; top: 0;">•</span>
                        ${line.trim()}
                      </div>`).join('')}
                  </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          return `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Certifications</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6;">
                ${form.certifications.map(cert => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                  <span style="position: absolute; left: 0; top: 0;">•</span>
                  ${cert}
                </div>`).join('')}
              </div>
            </div>
          `;
        }
        if (section === 'languages' && form.languages && form.languages[0]) {
          return `
            <div style="margin-bottom: 32px;">
              <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">Languages</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6;">
                ${form.languages.map(lang => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                  <span style="position: absolute; left: 0; top: 0;">•</span>
                  ${lang}
                </div>`).join('')}
              </div>
            </div>
          `;
        }
        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          // Check if custom section has structured data (like employment/education format)
          const customData = form[custom.key];
          if (customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
            // Structured format with multiple entries
          return `
              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">${custom.label}</h2>
                ${customData.map((entry, idx) => `
                  <div style="margin-bottom: 20px;">
                    <div style="margin-bottom: 8px;">
                      <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0; line-height: 1.2;">${entry.title || entry.name || ''}</h3>
                      ${(entry.date || entry.start || entry.end) ? `<div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' – ' : ''}${entry.end || ''}</div>` : ''}
                    </div>
                    ${(entry.subtitle || entry.company || entry.institution) ? `<div style="font-size: 11px; color: #333; margin-bottom: 8px; font-style: italic;">${entry.subtitle || entry.company || entry.institution}</div>` : ''}
                    ${entry.description ? `
                      <div style="font-size: 11px; color: #333; line-height: 1.5;">
                        ${entry.description.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px; padding-left: 16px; position: relative;">
                          <span style="position: absolute; left: 0; top: 0;">•</span>
                          ${line.trim()}
                        </div>`).join('')}
                    </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            // Simple text format
            return `
              <div style="margin-bottom: 32px;">
                <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px;">${custom.label}</h2>
                <div style="font-size: 11px; color: #333; line-height: 1.5; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form[custom.key] || ''}</div>
            </div>
          `;
          }
        }
        return '';
      }).join('')}
      
      </div> <!-- Close main content area -->
    </div> <!-- Close main flex container -->
  `;

  // Function to split content into pages - Working implementation
  const splitContentIntoPages = (content) => {
    if (typeof document === 'undefined') {
      return [content];
    }
    // Create a temporary container to measure content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = content;
    tempContainer.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: ${A4_WIDTH}px;
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 11px;
      line-height: 1.4;
      padding: 0;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT - 160; // Account for margins (72px top + 72px bottom + 16px buffer)
    const totalHeight = tempContainer.offsetHeight;
    
    console.log('Pagination Debug:', {
      pageHeight,
      totalHeight,
      A4_HEIGHT,
      A4_WIDTH,
      contentLength: content.length,
      sections: tempContainer.children.length
    });

    // If total content height is less than page height, return single page
    if (totalHeight <= pageHeight) {
      document.body.removeChild(tempContainer);
      return [content];
    }

    // Content overflows, split into pages
    const sections = Array.from(tempContainer.children);
    const pages = [];
    let currentPage = document.createElement('div');
    let currentHeight = 0;

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionHeight = section.offsetHeight;

      // If adding this section would exceed page height, start a new page
      if (currentHeight + sectionHeight > pageHeight && currentPage.children.length > 0) {
        pages.push(currentPage.innerHTML);
        currentPage = document.createElement('div');
        currentPage.style.cssText = `
          width: ${A4_WIDTH}px;
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          padding: 0;
          box-sizing: border-box;
        `;
        currentHeight = 0;
      }

      // Add section to current page
      currentPage.appendChild(section.cloneNode(true));
      currentHeight += sectionHeight;
    }

    // Add the last page if it has content
    if (currentPage.children.length > 0) {
      pages.push(currentPage.innerHTML);
    }

    // Clean up
    document.body.removeChild(tempContainer);

    console.log('Pages created:', pages.length);
    return pages.length > 0 ? pages : [content];
  };

  // Generate pages from content
  const pages = splitContentIntoPages(previewHtml);
  const totalPages = pages.length;

  // Reset current page when content changes
  useEffect(() => {
    setCurrentPage(1);
  }, [form, sections, customSections]);

  // Update preview content based on current page
  const currentPageContent = pages[currentPage - 1] || previewHtml;

  // Download button hover handlers
  function handleDownloadBtnMouseOver(e) {
    e.currentTarget.style.background = 'linear-gradient(90deg, #34d399 0%, #e0fcef 100%)';
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(16,185,129,0.18)';
    e.currentTarget.style.color = '#059669';
    const svg = e.currentTarget.querySelector('svg');
    if (svg) svg.style.stroke = '#059669';
  }
  function handleDownloadBtnMouseOut(e) {
    e.currentTarget.style.background = 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.10)';
    e.currentTarget.style.color = '#fff';
    const svg = e.currentTarget.querySelector('svg');
    if (svg) svg.style.stroke = '#fff';
  }

  // DOCX download handler for the DOCX button
  async function handleDownloadDOCXButton() {
    try {
      const docxBlob = await handleDownloadDOCX();
      if (!docxBlob) {
        alert('Error generating DOCX file. Please try again.');
        return;
      }

      // Track template download
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 5 }) }); } catch (_) {}

      // Download the DOCX file
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form?.firstName || 'resume'}_${form?.lastName || ''}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOCX download error:', error);
      alert('DOCX download failed. Please try again.');
    }
  }

  // PDF download handler
  function handleDownloadPDF() {
    // First generate the DOCX blob
    handleDownloadDOCX().then(docxBlob => {
      if (!docxBlob) {
        alert('Error generating DOCX file. Please try again.');
      return;
    }

      // Track template download
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 5 }) }); } catch (_) {}

      // Show loading state
      const pdfButton = document.querySelector('button[onclick*="handleDownloadPDF"]');
      const originalText = pdfButton?.textContent;
      if (pdfButton) {
        pdfButton.textContent = 'Converting to PDF...';
        pdfButton.disabled = true;
      }

      // Convert DOCX to PDF using a conversion service
      // For now, we'll use a simple approach that downloads the DOCX
      // and provides instructions for manual conversion
      const url = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${form.firstName || 'resume'}_${form.lastName || ''}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show instructions for PDF conversion
      alert('DOCX file downloaded successfully!\n\nFor perfect PDF formatting:\n1. Open the DOCX file in Microsoft Word or Google Docs\n2. Save/Export as PDF\n\nThis ensures the exact same formatting as the live preview without canvas issues.');
    }).catch(error => {
      console.error('PDF generation error:', error);
      alert('PDF generation failed. Please try again or use the DOCX download option.');
    }).finally(() => {
      // Restore button state
      const pdfButton = document.querySelector('button[onclick*="handleDownloadPDF"]');
      if (pdfButton) {
        pdfButton.textContent = 'Download PDF';
        pdfButton.disabled = false;
      }
    });
  }
  // DOCX download handler
  async function handleDownloadDOCX() {
    try {
      // Create document sections
      const children = [];

      // Create a table for the two-column layout
      const tableRows = [];

      // Left column content (35% width)
      const leftColumnContent = [];

      // Profile Section (Name and Title)
      if (form.firstName) {
        leftColumnContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${form.firstName} ${form.lastName || ''}`,
                size: 20 * 2, // 20px font size
                bold: true,
                color: '5A7BA8',
                font: 'Arial',
              }),
            ],
            spacing: { after: 120 }, // 6px margin-bottom
          })
        );

        if (form.tagline) {
          leftColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: form.tagline,
                  size: 13 * 2, // 13px font size
                  color: '333333',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 320 }, // 16px margin-bottom
            })
          );
        }
      }

      // Profile Summary
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
            spacing: { before: 0, after: 240 }, // 12px margin-bottom
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
            spacing: { after: 480 }, // 24px margin-bottom
          })
        );
      }

      // Address
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
            spacing: { before: 0, after: 160 }, // 8px margin-bottom
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
            spacing: { after: 480 }, // 24px margin-bottom
          })
        );
      }

      // Email
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
            spacing: { before: 0, after: 160 }, // 8px margin-bottom
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
            spacing: { after: 480 }, // 24px margin-bottom
          })
        );
      }

      // Phone
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
            spacing: { before: 0, after: 160 }, // 8px margin-bottom
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
            spacing: { after: 480 }, // 24px margin-bottom
          })
        );
      }

      // Skills
      const skillsArray = Array.isArray(form.skills) 
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
        : (form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : []);
      
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
            spacing: { before: 0, after: 240 }, // 12px margin-bottom
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
              spacing: { after: 80 }, // 4px margin-bottom
            })
          );
        });
      }

      // Right column content (65% width)
      const rightColumnContent = [];

      // Process sections for right column
      sections.forEach(section => {
        // Skip summary as it's already in the sidebar
        if (section === 'summary') {
          return;
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
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
              spacing: { before: 0, after: 320 }, // 16px margin-bottom
            })
          );

          form.employment.forEach(job => {
            // Job title and company
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
                spacing: { before: 0, after: 160 }, // 8px margin-bottom
              })
            );

            // Dates
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
                  spacing: { after: 160 }, // 8px margin-bottom
                })
              );
            }

            // Job description bullets
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
                    spacing: { after: 80 }, // 4px margin-bottom
                    indent: { left: 320 }, // 16px left margin
                  })
                );
              });
            }

            rightColumnContent.push(
              new Paragraph({
                children: [new TextRun({ text: '', size: 1 })],
                spacing: { after: 400 }, // 20px margin-bottom between jobs
              })
            );
          });
        }

        if (section === 'education' && form.education && form.education[0].degree) {
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
              spacing: { before: 0, after: 320 }, // 16px margin-bottom
            })
          );

          form.education.forEach(edu => {
            // School and location
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.school}${edu.location ? `, ${edu.location}` : ''}`,
                    size: 13 * 2,
                    bold: true,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 0, after: 160 }, // 8px margin-bottom
              })
            );

            // Dates
            if (edu.start || edu.end) {
              rightColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${edu.start}${edu.start && edu.end ? ' – ' : ''}${edu.end || ''}`,
                      size: 11 * 2,
                      color: '666666',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 160 }, // 8px margin-bottom
                })
              );
            }

            // Degree
            if (edu.degree) {
              rightColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      size: 11 * 2,
                      color: '333333',
                      font: 'Arial',
                      italics: true,
                    }),
                  ],
                  spacing: { after: 160 }, // 8px margin-bottom
                })
              );
            }

            // Education description bullets
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
                    spacing: { after: 80 }, // 4px margin-bottom
                    indent: { left: 320 }, // 16px left margin
                  })
                );
              });
            }

            rightColumnContent.push(
              new Paragraph({
                children: [new TextRun({ text: '', size: 1 })],
                spacing: { after: 400 }, // 20px margin-bottom between education entries
              })
            );
          });
        }

        if (section === 'projects' && form.projects && form.projects[0].name) {
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
              spacing: { before: 0, after: 320 }, // 16px margin-bottom
            })
          );

          form.projects.forEach(proj => {
            // Project name
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name,
                    size: 13 * 2,
                    bold: true,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 0, after: 160 }, // 8px margin-bottom
              })
            );

            // Project date
            if (proj.date) {
              rightColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.date,
                      size: 11 * 2,
                      color: '666666',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 160 }, // 8px margin-bottom
                })
              );
            }

            // Project description bullets
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
                    spacing: { after: 80 }, // 4px margin-bottom
                    indent: { left: 320 }, // 16px left margin
                  })
                );
              });
            }

            rightColumnContent.push(
              new Paragraph({
                children: [new TextRun({ text: '', size: 1 })],
                spacing: { after: 400 }, // 20px margin-bottom between projects
              })
            );
          });
        }

        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          rightColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'CERTIFICATIONS',
                  size: 15 * 2,
                  bold: true,
                  color: '5A7BA8',
                  font: 'Arial',
                  allCaps: true,
                }),
              ],
              spacing: { before: 0, after: 320 }, // 16px margin-bottom
            })
          );

          form.certifications.forEach(cert => {
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
                    text: cert,
                    size: 11 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 80 }, // 4px margin-bottom
                indent: { left: 320 }, // 16px left margin
              })
            );
          });
        }

        if (section === 'languages' && form.languages && form.languages[0]) {
          rightColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'LANGUAGES',
                  size: 15 * 2,
                  bold: true,
                  color: '5A7BA8',
                  font: 'Arial',
                  allCaps: true,
                }),
              ],
              spacing: { before: 0, after: 320 }, // 16px margin-bottom
            })
          );

          form.languages.forEach(lang => {
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
                    text: lang,
                    size: 11 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 80 }, // 4px margin-bottom
                indent: { left: 320 }, // 16px left margin
              })
            );
          });
        }

        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          // Check if custom section has structured data
          const customData = form[custom.key];
          if (customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
            // Structured format with multiple entries
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: custom.label.toUpperCase(),
                    size: 15 * 2,
                    bold: true,
                    color: '5A7BA8',
                    font: 'Arial',
                    allCaps: true,
                  }),
                ],
                spacing: { before: 0, after: 320 }, // 16px margin-bottom
              })
            );

            customData.forEach(entry => {
              // Title
              rightColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: entry.title || entry.name || '',
                      size: 13 * 2,
                      bold: true,
                      color: '333333',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { before: 0, after: 160 }, // 8px margin-bottom
                })
              );

              // Date
              if (entry.date || entry.start || entry.end) {
                rightColumnContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' – ' : ''}${entry.end || ''}`,
                        size: 11 * 2,
                        color: '666666',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { after: 160 }, // 8px margin-bottom
                  })
                );
              }

              // Subtitle
              if (entry.subtitle || entry.company || entry.institution) {
                rightColumnContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: entry.subtitle || entry.company || entry.institution || '',
                        size: 11 * 2,
                        color: '333333',
                        font: 'Arial',
                        italics: true,
                      }),
                    ],
                    spacing: { after: 160 }, // 8px margin-bottom
                  })
                );
              }

              // Description bullets
              if (entry.description) {
                const lines = entry.description.split('\n').filter(line => line.trim());
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
                      spacing: { after: 80 }, // 4px margin-bottom
                      indent: { left: 320 }, // 16px left margin
                    })
                  );
                });
              }

              rightColumnContent.push(
                new Paragraph({
                  children: [new TextRun({ text: '', size: 1 })],
                  spacing: { after: 400 }, // 20px margin-bottom between entries
                })
              );
            });
          } else {
            // Simple text format
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: custom.label.toUpperCase(),
                    size: 15 * 2,
                    bold: true,
                    color: '5A7BA8',
                    font: 'Arial',
                    allCaps: true,
                  }),
                ],
                spacing: { before: 0, after: 320 }, // 16px margin-bottom
              })
            );
            
            if (form[custom.key]) {
              rightColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: form[custom.key],
                      size: 11 * 2,
                      color: '333333',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 240 }, // 12px margin-bottom
                })
              );
            }
          }
        }
      });

      // Create the table row with two columns
      const tableRow = new TableRow({
        children: [
          // Left column (35% width)
          new TableCell({
            children: leftColumnContent,
            width: { size: 35, type: WidthType.PERCENTAGE },
            margins: { top: 320, right: 240, bottom: 320, left: 240 }, // 16px margins
            shading: { fill: 'F5F5F5' }, // Light gray background
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            }
          }),
          // Right column (65% width)
          new TableCell({
            children: rightColumnContent,
            width: { size: 65, type: WidthType.PERCENTAGE },
            margins: { top: 320, right: 320, bottom: 320, left: 320 }, // 16px margins
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            }
          }),
        ],
      });

      tableRows.push(tableRow);

      // Create the document with the two-column table
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 360, // 0.25 inch (18px)
                  right: 360, // 0.25 inch (18px)
                  bottom: 360, // 0.25 inch (18px)
                  left: 360, // 0.25 inch (18px)
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
          },
        ],
      });

      // Generate and download the document
      const blob = await Packer.toBlob(doc);
      return blob; // Return the blob for the PDF conversion
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Error generating DOCX file. Please try again.');
      return null; // Return null on error
    }
  }

  return (
    <>
      <HeaderOne />
      <Breadcrumb />
      <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <style>{`
          /* Responsive layout - always show both columns but stack on mobile */
          @media (max-width: 1200px) {
            .rb-two-col { 
              gap: 20px !important; 
              padding: 0 20px !important; 
            }
            .rb-preview-col { 
              flex: 1 !important; 
              min-width: 600px !important; 
            }
          }
          
          @media (max-width: 1024px) {
            .rb-two-col { 
              flex-direction: column !important; 
              gap: 24px !important; 
              padding: 0 16px !important; 
            }
            .rb-form-col { 
              width: 100% !important; 
              order: 1; 
              min-width: 0 !important; 
            }
            .rb-preview-col { 
              width: 100% !important; 
              min-width: 100% !important; 
              order: 2;
            }
            .rb-preview-wrapper { 
              height: 600px !important; 
            }
          }
          
          @media (max-width: 768px) {
            .rb-two-col { 
              padding: 0 12px !important; 
              gap: 20px !important; 
            }
            .rb-preview-col { 
              min-width: 100% !important; 
            }
            .rb-preview-wrapper { 
              height: 500px !important; 
            }
            .rb-preview-scale { 
              transform: scale(0.8) !important; 
            }
          }
          
          @media (max-width: 640px) {
            .rb-two-col { 
              padding: 0 8px !important; 
              gap: 16px !important; 
            }
            .rb-form-col { 
              width: 100% !important; 
              min-width: 0 !important; 
            }
            .rb-form-col > div { 
              padding: 20px !important; 
            }
            .rb-preview-wrapper { 
              height: 400px !important; 
            }
            .rb-preview-scale { 
              transform: scale(0.7) !important; 
            }
          }
          
          @media (max-width: 480px) {
            .rb-two-col { 
              padding: 0 4px !important; 
              gap: 12px !important; 
            }
            .rb-form-col { 
              width: 100% !important; 
              min-width: 0 !important; 
            }
            .rb-preview-wrapper { 
              height: 350px !important; 
            }
            .rb-preview-scale { 
              transform: scale(0.6) !important; 
            }
          }
          
          /* Hide preview on very small screens but keep download buttons accessible */
          @media (max-width: 480px) {
            .rb-preview-col { 
              display: none !important; 
            }
            .rb-two-col { 
              gap: 0 !important; 
            }
          }
          
          /* Download section responsiveness */
          @media (max-width: 768px) {
            .rb-download-section { 
              padding: 20px !important; 
              margin: 32px 16px 24px 16px !important; 
            }
            .rb-download-section > div:first-child > div:first-child { 
              font-size: 18px !important; 
            }
            .rb-download-section > div:first-child > div:last-child { 
              font-size: 13px !important; 
            }
          }
          
          @media (max-width: 480px) {
            .rb-download-section { 
              padding: 16px !important; 
              margin: 24px 8px 20px 8px !important; 
              border-radius: 12px !important; 
            }
            .rb-download-section > div:first-child > div:first-child { 
              font-size: 16px !important; 
            }
            .rb-download-section > div:first-child > div:last-child { 
              font-size: 12px !important; 
            }
            .rb-download-section button { 
              padding: 14px 24px !important; 
              font-size: 15px !important; 
              min-width: 140px !important; 
            }
          }

          /* Topbar responsiveness */
          @media (max-width: 1023px) {
            .rb-topbar { 
              height: auto !important; 
              padding: 8px 16px !important; 
              gap: 8px !important; 
              flex-wrap: wrap !important; 
            }
            .rb-progress-percent { 
              font-size: 14px !important; 
              margin-right: 8px !important; 
            }
            .rb-progress-wrap { 
              flex: 1 1 100% !important; 
              height: 6px !important; 
              margin-right: 0 !important; 
              order: 3; 
            }
            .rb-step-text { 
              font-size: 13px !important; 
              margin-right: 8px !important; 
              order: 2; 
            }
            .rb-change-template-btn { 
              padding: 8px 14px !important; 
              font-size: 13px !important; 
              order: 1; 
            }
          }
          
          @media (max-width: 640px) {
            .rb-topbar { 
              padding: 8px 12px !important; 
            }
            .rb-change-template-btn { 
              width: 100% !important; 
              text-align: center !important; 
              order: 4; 
            }
          }
        `}</style>
        <div style={{ maxWidth: 1800, margin: "0 auto", flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
          {/* Progress Bar */}
          <div className="rb-topbar" style={{ height: 48, background: "#fff", borderBottom: "1.5px solid #E3E8F0", display: "flex", alignItems: "center", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
            <div className="rb-progress-percent" style={{ fontWeight: 700, color: "#F36", fontSize: 16, marginRight: 18 }}>{progress}%</div>
            <div className="rb-progress-wrap" style={{ flex: 1, height: 6, background: "#F3E6E6", borderRadius: 4, overflow: "hidden", marginRight: 18 }}>
              <div className="rb-progress-fill" style={{ width: `${progress}%`, height: "100%", background: "#F36", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            <div className="rb-step-text" style={{ color: "#1BAA6D", fontWeight: 600, fontSize: 15, marginRight: 18 }}>Step {step + 1} of {allSectionsWithReview.length}</div>
            <button className="rts-btn btn-primary rb-change-template-btn" style={{ background: "#EAF1FF", color: "#0963D3", fontWeight: 700, fontSize: 16, border: "none", boxShadow: "none", padding: "10px 22px" }} onClick={() => router.push('/resume-builder')}>Change template</button>
          </div>

          {/* Main Two-Column Layout */}
          <div className="rb-two-col" style={{ flex: 1, display: "flex", gap: 40, alignItems: "flex-start", marginTop: 32, padding: "0 32px", minHeight: 0, width: '100%' }}>
            {/* Left: Form Wizard */}
            <div className="rb-form-col" style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%', minWidth: 0 }}>
            <ResumeBuilderForm 
              onFormChange={handleFormChange} 
              onProgressChange={handleProgressChange}
              onSectionsChange={handleSectionsChange}
              onCustomSectionsChange={handleCustomSectionsChange}
              onStepChange={handleStepChange}
              templateId="template-5" 
              onDownloadDOCX={handleDownloadDOCXButton}
            />
            </div>

            {/* Right: Resume Preview */}
            <div className="rb-preview-col" style={{ flex: 1.2, minWidth: 800, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'flex-start', minHeight: 0 }}>
              <div
                ref={previewWrapperRef}
                className="rb-preview-wrapper"
                style={{
                  width: '100%',
                  height: 'calc(100vh - 140px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: 'transparent',
                  position: 'relative',
                  minHeight: 0,
                  padding: '20px',
                }}
              >
                <div
                  id="cv-preview-export"
                  className="rb-preview-scale"
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    background: "#fff",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #E3E8F0",
                    position: "relative",
                    overflow: "hidden",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    margin: '0 auto',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: '0',
                      fontFamily: "'Arial', 'Helvetica', sans-serif",
                      color: "#333",
                      background: '#fff',
                      fontSize: 11,
                      lineHeight: 1.4,
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                    dangerouslySetInnerHTML={{ __html: currentPageContent }}
                  />
                </div>
              </div>
              
              {/* Pagination Controls */}
              <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                justifyContent: 'center', 
                gap: '16px', 
                marginTop: '16px',
                padding: '8px 16px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    background: currentPage === 1 ? '#f8f9fa' : '#fff',
                    color: currentPage === 1 ? '#6c757d' : '#495057',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  ← Previous
                  </button>
                
                <span style={{ 
                  fontSize: '14px', 
                  color: '#495057',
                  fontWeight: '500'
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    background: currentPage === totalPages ? '#f8f9fa' : '#fff',
                    color: currentPage === totalPages ? '#6c757d' : '#495057',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Next →
                </button>
              </div>



            </div>
          </div>
        </div>
      </div>
      <BackToTop />
      <FooterOneDynamic />

    </>
  );
} 


