"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Breadcrumb from "@/components/common/Breadcrumb";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";
import { useTailoredCVData } from "@/utils/useTailoredCVData";

import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType } from 'docx';

export default function ResumeEditorPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState(["personal", "summary", "employment", "education", "skills"]);
  const [customSections, setCustomSections] = useState([]);
  const [step, setStep] = useState(0);
  
  // Get tailored CV data from job fit analysis
  const { initialFormData, initialSections } = useTailoredCVData();
  
  // Update sections if tailored data provides them
  useEffect(() => {
    if (initialSections && initialSections.length > 0) {
      setSections(initialSections);
    }
  }, [initialSections]);

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



  // Resume preview content (WYSIWYG) - Modern Green Template with Two-Column Layout (Matches DOCX exactly)
  const previewHtml = `
    <div style="padding: 0; font-family: 'Arial', 'Helvetica', sans-serif; color: #333; min-height: 1040px; font-size: 12px; line-height: 1.4;">
      
      <!-- Header Section - Light Green Band -->
      ${form.firstName ? `
        <div style="background: #D9EAD3; padding: 30px 40px; margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 36px; font-weight: bold; color: #333;">${form.firstName} ${form.lastName || ''}</div>
            <div style="text-align: right; font-size: 12px; color: #333;">
              <div style="margin-bottom: 4px;">${form.email ? form.email : ''}${form.email && form.phone ? ' • ' : ''}${form.phone ? form.phone : ''}</div>
              <div>${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}${(form.city || form.country) && form.address ? ', ' : ''}${form.address ? form.address : ''}</div>
            </div>
          </div>
        </div>
      ` : ''}
      
      <!-- Two-Column Main Content Area -->
      <div style="display: flex; padding: 0 40px;">
        <!-- Left Column (40% width) -->
        <div style="width: 40%; padding-right: 30px; box-sizing: border-box;">
        ${sections.map(section => {
          if (section === 'summary' && form.summary) {
            return `
              <div style="margin-bottom: 30px;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">${form.tagline || 'Professional Summary'}</div>
                  <div style="font-size: 12px; line-height: 1.5; color: #333; text-align: justify;">${form.summary}</div>
              </div>
            `;
          }
          if (section === 'skills' && form.skills) {
            // Handle skills as array of objects with competency levels
            const skillsArray = Array.isArray(form.skills) 
              ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
              : form.skills.split(',').map(s => s.trim()).filter(s => s);
            
            if (skillsArray.length > 0) {
              return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Skills</div>
                    <div style="margin-top: 10px;">
                      ${skillsArray.map(skill => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                        return `<div style="font-size: 12px; margin-bottom: 6px; color: #333;">• ${skillName}${skillLevel}</div>`;
                      }).join('')}
                  </div>
                </div>
              `;
            }
            return '';
          }
          if (section === 'certifications' && form.certifications && form.certifications[0]) {
            return `
              <div style="margin-bottom: 30px;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Certifications</div>
                ${form.certifications.map(cert => `<div style="font-size: 12px; margin-bottom: 6px; color: #333;">• ${cert}</div>`).join('')}
              </div>
            `;
          }
          if (section === 'languages' && form.languages && form.languages[0]) {
            return `
              <div style="margin-bottom: 30px;">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Languages</div>
                ${form.languages.map(lang => `<div style="font-size: 12px; margin-bottom: 6px; color: #333;">• ${lang}</div>`).join('')}
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
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">${custom.label}</div>
                  ${customData.map((entry, idx) => `
                    <div style="margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                        <div style="font-size: 14px; font-weight: bold; color: #333;">${entry.title || entry.name || ''}</div>
                        <div style="font-size: 14px; color: #333;">${entry.date || entry.start || ''}${(entry.date || entry.start) && (entry.end) ? ' – ' : ''}${entry.end || ''}</div>
                      </div>
                      <div style="font-size: 12px; margin-left: 20px; margin-top: 8px;">
                        ${entry.description ? entry.description.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 6px;">• ${line.trim()}</div>`).join('') : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            } else {
              // Simple text format
              return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">${custom.label}</div>
                  <div style="font-size: 12px; line-height: 1.5; color: #333;">${form[custom.key] || ''}</div>
              </div>
            `;
            }
          }
          return '';
        }).join('')}
        </div>

        <!-- Right Column (60% width) -->
        <div style="width: 60%; padding-left: 30px; box-sizing: border-box;">
          ${sections.map(section => {
            if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
              return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Career Experience</div>
                  ${form.employment.map((job, idx) => `
                    <div style="margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                        <div style="font-size: 14px; font-weight: bold; color: #333;">${job.jobTitle} at ${job.company}</div>
                        <div style="font-size: 14px; color: #333;">${job.start}${job.start && job.end ? ' – ' : ''}${job.end}</div>
                      </div>
                      <div style="font-size: 12px; margin-left: 20px; margin-top: 8px;">
                        ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 6px;">• ${line.trim()}</div>`).join('') : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }
            if (section === 'education' && form.education && form.education[0].degree) {
              return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Education</div>
                  ${form.education.map((edu, idx) => `
                    <div style="margin-bottom: 15px;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                        <div style="font-size: 14px; color: #333;">${edu.degree}</div>
                        <div style="font-size: 14px; color: #333;">${edu.start}${edu.start && edu.end ? ' – ' : ''}${edu.end || ''}</div>
                      </div>
                      <div style="font-size: 12px; color: #333;">${edu.school}${edu.school && edu.location ? ', ' : ''}${edu.location || ''}</div>
                      ${edu.desc ? `
                        <div style="font-size: 12px; margin-left: 20px; margin-top: 8px;">
                          ${edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 6px;">• ${line.trim()}</div>`).join('')}
                        </div>
                      ` : ''}
                    </div>
                  `).join('')}
                </div>
              `;
            }
            if (section === 'projects' && form.projects && form.projects[0].name) {
              return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Projects</div>
                  ${form.projects.map((proj, idx) => `
                    <div style="margin-bottom: 20px;">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <div style="font-size: 14px; font-weight: bold; color: #333;">${proj.name}</div>
                        <div style="font-size: 14px; color: #333;">${proj.date || ''}</div>
                      </div>
                      <div style="font-size: 12px; margin-left: 20px;">
                        ${proj.desc ? proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 6px;">• ${line.trim()}</div>`).join('') : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `;
            }
            return '';
          }).join('')}
        </div>
      </div>
      
      <!-- Page Number -->
      <div style="position: absolute; bottom: 20px; left: 40px; font-size: 10px; color: #333;">Page 1</div>
    </div>
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
      font-family: 'Times New Roman', serif;
      font-size: 11px;
      line-height: 1.0;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 6 }) }); } catch (_) {}

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 6 }) }); } catch (_) {}

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

      // Header Section - Light Green Band
      if (form.firstName) {
        // Create a table for the header with two columns
        const headerTable = new Table({
          rows: [
            new TableRow({
              children: [
                // Left column - Name
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.firstName} ${form.lastName || ''}`,
                          size: 36 * 2, // 36px font size
                          bold: true,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { before: 0, after: 0 },
                    }),
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 400, right: 400, bottom: 400, left: 400 }, // 20px padding
                  shading: { fill: 'D9EAD3' }, // Light green background
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  }
                }),
                // Right column - Contact information
                new TableCell({
                  children: [
                    // Email and phone
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.email ? form.email : ''}${form.email && form.phone ? ' • ' : ''}${form.phone ? form.phone : ''}`,
                          size: 12 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { before: 0, after: 80 }, // 4px margin-bottom
                      alignment: AlignmentType.RIGHT,
                    }),
                    // Address
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}${(form.city || form.country) && form.address ? ', ' : ''}${form.address ? form.address : ''}`,
                          size: 12 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { before: 0, after: 0 },
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  margins: { top: 400, right: 400, bottom: 400, left: 400 }, // 20px padding
                  shading: { fill: 'D9EAD3' }, // Light green background
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  }
                }),
              ],
            }),
          ],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          }
        });

        children.push(headerTable);
        
                 // Add spacing after header
         children.push(
           new Paragraph({
             children: [new TextRun({ text: '', size: 1 })],
             spacing: { after: 200 }, // 10px margin-bottom
           })
         );
      }

      // Create a table for the two-column layout
      const tableRows = [];

      // Left column content (40% width)
      const leftColumnContent = [];

      // Summary Section
      if (form.summary) {
        leftColumnContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: form.tagline || 'Professional Summary',
                size: 18 * 2,
                bold: true,
                color: '6AA84F',
                font: 'Arial',
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
                size: 12 * 2,
                color: '333333',
                font: 'Arial',
              }),
            ],
            spacing: { after: 480 }, // 24px margin-bottom
            alignment: AlignmentType.JUSTIFIED,
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
                text: 'Skills',
                size: 18 * 2,
                bold: true,
                color: '6AA84F',
                font: 'Arial',
              }),
            ],
            spacing: { before: 0, after: 240 }, // 12px margin-bottom
          })
        );

        skillsArray.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
          leftColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '• ',
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
                new TextRun({
                  text: `${skillName}${skillLevel}`,
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 96 }, // 6px margin-bottom
            })
          );
        });
      }

      // Certifications
      if (form.certifications && form.certifications[0]) {
        leftColumnContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Certifications',
                size: 18 * 2,
                bold: true,
                color: '6AA84F',
                font: 'Arial',
              }),
            ],
            spacing: { before: 0, after: 240 }, // 12px margin-bottom
          })
        );

        form.certifications.forEach(cert => {
          leftColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '• ',
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
                new TextRun({
                  text: cert,
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 96 }, // 6px margin-bottom
            })
          );
        });
      }

      // Languages
      if (form.languages && form.languages[0]) {
        leftColumnContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'Languages',
                size: 18 * 2,
                bold: true,
                color: '6AA84F',
                font: 'Arial',
              }),
            ],
            spacing: { before: 0, after: 240 }, // 12px margin-bottom
          })
        );

        form.languages.forEach(lang => {
          leftColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: '• ',
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
                new TextRun({
                  text: lang,
                  size: 12 * 2,
                  color: '333333',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 96 }, // 6px margin-bottom
            })
          );
        });
      }

      // Custom sections for left column
      sections.forEach(section => {
        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          const customData = form[custom.key];
          if (customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
            // Structured format with multiple entries
            leftColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: custom.label,
                    size: 18 * 2,
                    bold: true,
                    color: '6AA84F',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 0, after: 240 }, // 12px margin-bottom
              })
            );

            customData.forEach(entry => {
              // Title
              leftColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: entry.title || entry.name || '',
                      size: 14 * 2,
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
                leftColumnContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' – ' : ''}${entry.end || ''}`,
                        size: 14 * 2,
                        color: '333333',
                        font: 'Arial',
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
                  leftColumnContent.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: '• ',
                          size: 12 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                        new TextRun({
                          text: line.trim(),
                          size: 12 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 96 }, // 6px margin-bottom
                      indent: { left: 320 }, // 16px left margin
                    })
                  );
                });
              }

              leftColumnContent.push(
                new Paragraph({
                  children: [new TextRun({ text: '', size: 1 })],
                  spacing: { after: 400 }, // 20px margin-bottom between entries
                })
              );
            });
          } else {
            // Simple text format
            leftColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: custom.label,
                    size: 18 * 2,
                    bold: true,
                    color: '6AA84F',
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 0, after: 240 }, // 12px margin-bottom
              })
            );
            
            if (form[custom.key]) {
              leftColumnContent.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: form[custom.key],
                      size: 12 * 2,
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

      // Right column content (60% width)
      const rightColumnContent = [];

      // Process sections for right column
      sections.forEach(section => {
        // Skip summary, skills, certifications, languages as they're in the left column
        if (section === 'summary' || section === 'skills' || section === 'certifications' || section === 'languages') {
          return;
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          rightColumnContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Career Experience',
                  size: 18 * 2,
                  bold: true,
                  color: '6AA84F',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 0, after: 240 }, // 12px margin-bottom
            })
          );

          form.employment.forEach(job => {
            // Job title and company
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${job.jobTitle} at ${job.company}`,
                    size: 14 * 2,
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
                      size: 14 * 2,
                      color: '333333',
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
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { after: 96 }, // 6px margin-bottom
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
                  text: 'Education',
                  size: 18 * 2,
                  bold: true,
                  color: '6AA84F',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 0, after: 240 }, // 12px margin-bottom
            })
          );

          form.education.forEach(edu => {
            // Degree
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.degree,
                    size: 14 * 2,
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
                      size: 14 * 2,
                      color: '333333',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 160 }, // 8px margin-bottom
                })
              );
            }

            // School and location
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${edu.school}${edu.school && edu.location ? ', ' : ''}${edu.location || ''}`,
                    size: 12 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 160 }, // 8px margin-bottom
              })
            );

            // Education description bullets
            if (edu.desc) {
              const lines = edu.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                rightColumnContent.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ',
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { after: 96 }, // 6px margin-bottom
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
                  text: 'Projects',
                  size: 18 * 2,
                  bold: true,
                  color: '6AA84F',
                  font: 'Arial',
                }),
              ],
              spacing: { before: 0, after: 240 }, // 12px margin-bottom
            })
          );

          form.projects.forEach(proj => {
            // Project name
            rightColumnContent.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name,
                    size: 14 * 2,
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
                      size: 14 * 2,
                      color: '333333',
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
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 12 * 2,
                        color: '333333',
                        font: 'Arial',
                      }),
                    ],
                    spacing: { after: 96 }, // 6px margin-bottom
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
      });

      // Create the table row with two columns
      const tableRow = new TableRow({
        children: [
          // Left column (40% width)
          new TableCell({
            children: leftColumnContent,
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: { top: 200, right: 300, bottom: 400, left: 400 }, // 10px top, 20px other sides, 15px between columns
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE }
            }
          }),
          // Right column (60% width)
          new TableCell({
            children: rightColumnContent,
            width: { size: 60, type: WidthType.PERCENTAGE },
            margins: { top: 200, right: 400, bottom: 400, left: 300 }, // 10px top, 20px other sides, 15px between columns
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
                  top: 0, // 0 margins
                  right: 0, // 0 margins
                  bottom: 0, // 0 margins
                  left: 0, // 0 margins
                },
              },
            },
            children: [
              // Header section
              ...children,
              // Two-column table
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
              initialFormData={initialFormData}
              templateId="template-6" 
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
                      fontSize: 12,
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


