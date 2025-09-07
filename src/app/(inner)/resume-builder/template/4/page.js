"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";

import html2pdf from 'html2pdf.js';
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



  // Resume preview content (WYSIWYG) - Modern Blue Template (Matches target design)
  const previewHtml = `
    <div style="padding: 32px 40px; font-family: 'Arial', 'Helvetica', sans-serif; color: #333; min-height: 1040px; font-size: 11px; line-height: 1.4;">
      
      <!-- Header Section - Name left, contact right -->
      ${form.firstName ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #4A90E2; padding-bottom: 16px;">
          <div style="flex: 1;">
            <div style="font-size: 28px; font-weight: bold; color: #4A90E2; margin-bottom: 6px; font-family: 'Arial', sans-serif;">${form.firstName} ${form.lastName || ''}</div>
            ${form.tagline ? `<div style="font-size: 14px; color: #666; font-weight: normal; margin-bottom: 0;">${form.tagline}</div>` : ''}
          </div>
          <div style="text-align: right; font-size: 11px; color: #4A90E2; line-height: 1.5;">
            ${form.email ? `<div style="margin-bottom: 2px;">${form.email}</div>` : ''}
            ${form.phone ? `<div style="margin-bottom: 2px;">${form.phone}</div>` : ''}
            ${(form.city || form.country) ? `<div style="margin-bottom: 2px;">${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}</div>` : ''}
          </div>
        </div>
      ` : ''}
      
      ${sections.map(section => {
        if (section === 'summary' && form.summary) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 8px; font-family: 'Arial', sans-serif;">Summary</div>
              <div style="font-size: 11px; margin-top: 0; text-align: left; line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap; color: #333;">${form.summary}</div>
            </div>
          `;
        }
        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Professional Experience</div>
              ${form.employment.map((job, idx) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="font-size: 12px; font-weight: bold; color: #333;">${job.company}</div>
                    <div style="font-size: 11px; color: #4A90E2; font-weight: 500;">${job.start}${job.start && job.end ? ' – ' : ''}${job.end}</div>
                  </div>
                  <div style="font-size: 11px; color: #666; font-style: italic; margin-bottom: 6px;">${job.jobTitle}</div>
                  <div style="font-size: 11px; color: #333; line-height: 1.4;">
                    ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'education' && form.education && form.education[0].degree) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Education</div>
              ${form.education.map((edu, idx) => `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 2px;">${edu.degree}</div>
                  <div style="font-size: 11px; color: #333; margin-bottom: 2px;">${edu.school}${edu.location ? `, ${edu.location}` : ''}</div>
                  ${edu.desc ? `<div style="font-size: 11px; color: #333; line-height: 1.4; margin-top: 4px;">
                    ${edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px;">• ${line.trim()}</div>`).join('')}
                  </div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'skills' && form.skills) {
          // Handle skills as array of objects with competency levels
          const skillsArray = Array.isArray(form.skills) 
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
            : form.skills.split(',').map(s => s.trim()).filter(s => s);
          
          if (skillsArray.length > 0) {
            const skillsPerColumn = Math.ceil(skillsArray.length / 3);
            const column1 = skillsArray.slice(0, skillsPerColumn);
            const column2 = skillsArray.slice(skillsPerColumn, skillsPerColumn * 2);
            const column3 = skillsArray.slice(skillsPerColumn * 2);
            
            return `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Areas of Expertise</div>
                <div style="display: flex; gap: 24px; margin-top: 0;">
                  <div style="flex: 1;">
                    ${column1.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 11px; margin-bottom: 4px; color: #333;">• ${skillName}${skillLevel}</div>`;
                    }).join('')}
                  </div>
                  <div style="flex: 1;">
                    ${column2.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 11px; margin-bottom: 4px; color: #333;">• ${skillName}${skillLevel}</div>`;
                    }).join('')}
                  </div>
                  <div style="flex: 1;">
                    ${column3.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 11px; margin-bottom: 4px; color: #333;">• ${skillName}${skillLevel}</div>`;
                    }).join('')}
                  </div>
                </div>
              </div>
            `;
          }
          return '';
        }
        if (section === 'projects' && form.projects && form.projects[0].name) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Projects</div>
              ${form.projects.map((proj, idx) => `
                <div style="margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                    <div style="font-size: 12px; font-weight: bold; color: #333;">${proj.name}</div>
                    <div style="font-size: 11px; color: #4A90E2; font-weight: 500;">${proj.date || ''}</div>
                  </div>
                  <div style="font-size: 11px; color: #333; line-height: 1.4;">
                    ${proj.desc ? proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Certifications</div>
              ${form.certifications.map(cert => `<div style="font-size: 11px; margin-bottom: 4px; color: #333;">• ${cert}</div>`).join('')}
            </div>
          `;
        }
        if (section === 'languages' && form.languages && form.languages[0]) {
          return `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">Languages</div>
              ${form.languages.map(lang => `<div style="font-size: 11px; margin-bottom: 4px; color: #333;">• ${lang}</div>`).join('')}
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
              <div style="margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">${custom.label}</div>
                ${customData.map((entry, idx) => `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <div style="font-size: 12px; font-weight: bold; color: #333;">${entry.title || entry.name || ''}</div>
                      <div style="font-size: 11px; color: #4A90E2; font-weight: 500;">${entry.date || entry.start || ''}${(entry.date || entry.start) && (entry.end) ? ' – ' : ''}${entry.end || ''}</div>
                    </div>
                    <div style="font-size: 11px; color: #666; font-style: italic; margin-bottom: 6px;">${entry.subtitle || entry.company || entry.institution || ''}</div>
                    <div style="font-size: 11px; color: #333; line-height: 1.4;">
                      ${entry.description ? entry.description.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px;">• ${line.trim()}</div>`).join('') : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            // Simple text format
            return `
              <div style="margin-bottom: 20px;">
                <div style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px; font-family: 'Arial', sans-serif;">${custom.label}</div>
                <div style="font-size: 11px; margin-top: 0; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap; color: #333; line-height: 1.4;">${form[custom.key] || ''}</div>
            </div>
          `;
          }
        }
        return '';
      }).join('')}
    </div>
  `;

  // Function to split content into pages - Working implementation
  const splitContentIntoPages = (content) => {
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
      padding: 72px;
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
          font-family: 'Times New Roman', serif;
          font-size: 11px;
          line-height: 1.0;
          padding: 72px;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 4 }) }); } catch (_) {}

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 4 }) }); } catch (_) {}

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

      // Header section - Modern Blue Template (Name left, contact right with blue border)
      if (form.firstName) {
        // Create header table for layout
        const headerTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { // Remove all borders except bottom
            top: { style: BorderStyle.NONE },
            bottom: { color: '4A90E2', space: 1, style: BorderStyle.SINGLE, size: 4 },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    // Name - 28pt font, bold, blue color, left-aligned
          new Paragraph({
            children: [
              new TextRun({
                text: `${form.firstName} ${form.lastName || ''}`,
                          size: 28 * 2,
                bold: true,
                          color: '4A90E2',
                          font: 'Arial',
              }),
            ],
                      alignment: AlignmentType.LEFT,
                      spacing: { after: 120 }, // 6px margin-bottom
                    }),
                    // Tagline - 14pt font, normal weight, gray color
                    ...(form.tagline ? [new Paragraph({
              children: [
                new TextRun({
                  text: form.tagline,
                          size: 14 * 2,
                  bold: false,
                          color: '666666',
                          font: 'Arial',
                }),
              ],
                      alignment: AlignmentType.LEFT,
                      spacing: { after: 0 },
                    })] : []),
                  ],
                  width: { size: 70, type: WidthType.PERCENTAGE },
                  borders: { // Remove all cell borders
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  verticalAlign: "top"
                }),
                new TableCell({
                  children: [
                    // Contact info - 11pt font, blue color, right-aligned
                    ...(form.email ? [new Paragraph({
              children: [
                new TextRun({
                          text: form.email,
                          size: 11 * 2,
                          color: '4A90E2',
                          font: 'Arial',
                }),
              ],
                      alignment: AlignmentType.RIGHT,
                      spacing: { after: 40 },
                    })] : []),
                    ...(form.phone ? [new Paragraph({
                      children: [
                        new TextRun({
                          text: form.phone,
                          size: 11 * 2,
                          color: '4A90E2',
                          font: 'Arial',
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                      spacing: { after: 40 },
                    })] : []),
                    ...((form.city || form.country) ? [new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}`,
                          size: 11 * 2,
                          color: '4A90E2',
                          font: 'Arial',
                        }),
                      ],
                      alignment: AlignmentType.RIGHT,
                      spacing: { after: 0 },
                    })] : []),
                  ],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                  borders: { // Remove all cell borders
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  verticalAlign: "top"
                }),
              ],
            }),
          ],
          margins: { bottom: 480 }, // 24px margin-bottom
        });
        
        children.push(headerTable);
      }

      // Process sections with Modern Blue template formatting
      sections.forEach(section => {
            if (section === 'summary' && form.summary) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Summary',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 160 }, // 24px margin-top, 8px after title
            })
          );
          
          // Summary content - 11pt, gray color, left-aligned
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: form.summary,
                  size: 11 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 400 }, // 20px margin-bottom
              alignment: AlignmentType.LEFT,
            })
          );
        }

            if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Professional Experience',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
            })
          );

          form.employment.forEach(job => {
            // Company and dates - company name bold, dates in blue
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: job.company,
                    size: 12 * 2,
                    bold: true,
                    color: '333333',
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: '\t', // Tab for spacing
                    size: 12 * 2,
                  }),
                  new TextRun({
                    text: `${job.start}${job.start && job.end ? ' – ' : ''}${job.end}`,
                    size: 11 * 2,
                    color: '4A90E2',
                    font: 'Arial',
                    bold: false,
                  }),
                ],
                spacing: { before: 320, after: 80 }, // 16px margin-top, 4px after
                tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
              })
            );

            // Job title - italic, gray
            if (job.jobTitle) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: job.jobTitle,
                      size: 11 * 2,
                      italics: true,
                      color: '666666',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 120 }, // 6px margin-bottom
                })
              );
            }

            // Job description bullets - 11pt, gray color
            if (job.desc) {
              const lines = job.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
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
                  })
                );
              });
            }
          });
        }

            if (section === 'education' && form.education && form.education[0].degree) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Education',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
            })
          );

          form.education.forEach(edu => {
            // Degree - bold, gray color
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree,
                    size: 12 * 2,
                    bold: true,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 240, after: 40 }, // 12px margin-top, 2px after
              })
            );

            // School and location - normal weight, gray color
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                    text: `${edu.school}${edu.location ? `, ${edu.location}` : ''}`,
                      size: 11 * 2,
                    color: '333333',
                    font: 'Arial',
                    }),
                  ],
                  spacing: { after: 120 }, // 6px margin-bottom
                })
              );

            // Education description bullets - 11pt, gray color
            if (edu.desc) {
              const lines = edu.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
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
                    spacing: { after: 40 }, // 2px margin-bottom
                  })
                );
              });
            }
          });
        }

            if (section === 'skills' && form.skills) {
              const skillsArray = Array.isArray(form.skills) 
                ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
                : form.skills.split(',').map(s => s.trim()).filter(s => s);
              
              if (skillsArray.length > 0) {
            // Section title - 16pt, bold, blue color
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'Areas of Expertise',
                    size: 16 * 2,
                    bold: true,
                    color: '4A90E2',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
              })
            );

            // Create a table for skills in 3 columns like the live preview
            const skillsPerColumn = Math.ceil(skillsArray.length / 3);
            const tableRows = [];
            
            for (let i = 0; i < skillsPerColumn; i++) {
              const row = new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: skillsArray[i] ? `• ${typeof skillsArray[i] === 'string' ? skillsArray[i] : skillsArray[i].name}${typeof skillsArray[i] === 'string' ? '' : (skillsArray[i].level ? ` (${skillsArray[i].level})` : '')}` : '',
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 80 }, // 4px margin-bottom
                      }),
                    ],
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: { right: 480 }, // 24px margin-right
                    borders: { // Remove all borders
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: skillsArray[i + skillsPerColumn] ? `• ${typeof skillsArray[i + skillsPerColumn] === 'string' ? skillsArray[i + skillsPerColumn] : skillsArray[i + skillsPerColumn].name}${typeof skillsArray[i + skillsPerColumn] === 'string' ? '' : (skillsArray[i + skillsPerColumn].level ? ` (${skillsArray[i + skillsPerColumn].level})` : '')}` : '',
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 80 }, // 4px margin-bottom
                      }),
                    ],
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: { right: 480 }, // 24px margin-right
                    borders: { // Remove all borders
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    }
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: skillsArray[i + skillsPerColumn * 2] ? `• ${typeof skillsArray[i + skillsPerColumn * 2] === 'string' ? skillsArray[i + skillsPerColumn * 2] : skillsArray[i + skillsPerColumn * 2].name}${typeof skillsArray[i + skillsPerColumn * 2] === 'string' ? '' : (skillsArray[i + skillsPerColumn * 2].level ? ` (${skillsArray[i + skillsPerColumn * 2].level})` : '')}` : '',
                            size: 11 * 2,
                            color: '333333',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 80 }, // 4px margin-bottom
                      }),
                    ],
                    width: { size: 34, type: WidthType.PERCENTAGE },
                    borders: { // Remove all borders
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE }
                    }
                  }),
                ],
              });
              tableRows.push(row);
            }

            children.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
                margins: { top: 0 }, // No margin-top since title has margin
                borders: { // Remove ALL table borders including internal ones
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE }
                }
              })
            );
          }
        }

            if (section === 'projects' && form.projects && form.projects[0].name) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Projects',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
            })
          );

          form.projects.forEach(proj => {
            // Project name and date - project name bold, date in blue
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name,
                    size: 12 * 2,
                    bold: true,
                    color: '333333',
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: '\t', // Tab for spacing
                    size: 12 * 2,
                  }),
                  new TextRun({
                    text: proj.date || '',
                    size: 11 * 2,
                    color: '4A90E2',
                    font: 'Arial',
                    bold: false,
                  }),
                ],
                spacing: { before: 320, after: 120 }, // 16px margin-top, 6px after
                tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
              })
            );

            // Project description bullets - 11pt, gray color
            if (proj.desc) {
              const lines = proj.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
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
                  })
                );
              });
            }
          });
        }

            if (section === 'certifications' && form.certifications && form.certifications[0]) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Certifications',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
            })
          );

          form.certifications.forEach(cert => {
            children.push(
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
              })
            );
          });
        }

            if (section === 'languages' && form.languages && form.languages[0]) {
          // Section title - 16pt, bold, blue color
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Languages',
                  size: 16 * 2,
                  bold: true,
                  color: '4A90E2',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
            })
          );

          form.languages.forEach(lang => {
            children.push(
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
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: custom.label,
                        size: 16 * 2,
                        bold: true,
                        color: '4A90E2',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
                  })
                );

                customData.forEach(entry => {
                  // Title and date - title bold, date in blue
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: entry.title || entry.name || '',
                          size: 12 * 2,
                          bold: true,
                          color: '333333',
                          font: 'Arial',
                        }),
                        new TextRun({
                          text: '\t', // Tab for spacing
                          size: 12 * 2,
                        }),
                        new TextRun({
                          text: `${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' – ' : ''}${entry.end || ''}`,
                          size: 11 * 2,
                          color: '4A90E2',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { before: 320, after: 80 }, // 16px margin-top, 4px after
                      tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
                    })
                  );

                  // Subtitle - italic, gray
                  if (entry.subtitle || entry.company || entry.institution) {
                    children.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: entry.subtitle || entry.company || entry.institution || '',
                            size: 11 * 2,
                            italics: true,
                            color: '666666',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 120 }, // 6px margin-bottom
                      })
                    );
                  }

                  // Description bullets - 11pt, gray color
                  if (entry.description) {
                    const lines = entry.description.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                      children.push(
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
                        })
                      );
                    });
                  }
                });
              } else {
                // Simple text format
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: custom.label,
                        size: 16 * 2,
                        bold: true,
                        color: '4A90E2',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { before: 480, after: 240 }, // 24px margin-top, 12px after title
                  })
                );
                
                if (form[custom.key]) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: form[custom.key],
                          size: 11 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 400 }, // 20px margin-bottom
                    })
                  );
                }
              }
            }
      });

      // Create the document with Harvard template margins
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch (60px)
                  right: 1440, // 1 inch (60px)
                  bottom: 1440, // 1 inch (60px)
                  left: 1440, // 1 inch (60px)
                },
              },
            },
            children: children,
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
              templateId="template-4"
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
                      padding: '32px 40px',
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
      <FooterOne />

    </>
  );
} 