"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Breadcrumb from "@/components/common/Breadcrumb";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
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



  // Resume preview content (WYSIWYG) - Harvard Template (Matches DOCX exactly)
  const previewHtml = `
    <div style="padding: 40px 40px; font-family: 'Times New Roman', serif; color: #000; min-height: 1040px; font-size: 10px; line-height: 1.0;">
      
      <!-- Header Section - Centered -->
      ${form.firstName ? `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; letter-spacing: 0.5px;">${form.firstName} ${form.lastName || ''}</div>
          ${form.tagline ? `<div style="font-size: 10px; font-weight: normal; margin-bottom: 8px; color: #333;">${form.tagline}</div>` : ''}
          <div style="font-size: 9px; color: #333;">
            ${form.phone ? form.phone : ''}${form.phone && form.email ? ' • ' : ''}${form.email ? form.email : ''}${(form.phone || form.email) && form.linkedin ? ' • ' : ''}${form.linkedin ? form.linkedin : ''}${(form.phone || form.email || form.linkedin) && (form.city || form.country) ? ' • ' : ''}${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}
          </div>
        </div>
      ` : ''}
      
      ${sections.map(section => {
        if (section === 'summary' && form.summary) {
          return `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">SUMMARY</div>
              <div style="font-size: 10px; margin-top: 4px; text-align: left; line-height: 1.0; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form.summary}</div>
            </div>
          `;
        }
        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          return `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">EXPERIENCE</div>
              ${form.employment.map((job, idx) => `
                <div style="margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px;">
                    <div style="font-size: 10px; font-weight: bold;">${job.jobTitle}</div>
                    <div style="font-size: 10px;">${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="font-size: 10px; font-style: italic;">${job.company}</div>
                    <div style="font-size: 10px;">${job.location || ''}</div>
                  </div>
                  <div style="font-size: 9px; margin-left: 16px;">
                    ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'education' && form.education && form.education[0].degree) {
          return `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">EDUCATION</div>
              ${form.education.map((edu, idx) => `
                <div style="margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px;">
                    <div style="font-size: 10px; font-weight: bold;">${edu.school}</div>
                    <div style="font-size: 10px;">${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="font-size: 10px; font-style: italic;">${edu.degree}</div>
                    <div style="font-size: 10px;">${edu.location || ''}</div>
                  </div>
                  <div style="font-size: 9px; margin-left: 16px;">
                    ${edu.desc ? edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
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
              <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">SKILLS</div>
                <div style="display: flex; margin-top: 4px;">
                  <div style="flex: 1; margin-right: 16px;">
                    ${column1.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 10px; margin-bottom: 1px;">• ${skillName}${skillLevel}</div>`;
                    }).join('')}
                  </div>
                  <div style="flex: 1; margin-right: 16px;">
                    ${column2.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 10px; margin-bottom: 1px;">• ${skillName}${skillLevel}</div>`;
                    }).join('')}
                  </div>
                  <div style="flex: 1;">
                    ${column3.map(skill => {
                      const skillName = typeof skill === 'string' ? skill : skill.name;
                      const skillLevel = typeof skill === 'string' ? '' : (skill.level ? ` (${skill.level})` : '');
                      return `<div style="font-size: 10px; margin-bottom: 1px;">• ${skillName}${skillLevel}</div>`;
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
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">PROJECTS</div>
              ${form.projects.map((proj, idx) => `
                <div style="margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="font-size: 10px; font-weight: bold;">${proj.name}</div>
                    <div style="font-size: 10px;">${proj.date || ''}</div>
                  </div>
                  <div style="font-size: 9px; margin-left: 16px;">
                    ${proj.desc ? proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          return `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">CERTIFICATIONS</div>
              ${form.certifications.map(cert => `<div style="font-size: 9px; margin-top: 4px;">• ${cert}</div>`).join('')}
            </div>
          `;
        }
        if (section === 'languages' && form.languages && form.languages[0]) {
          return `
            <div style="margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">LANGUAGES</div>
              ${form.languages.map(lang => `<div style="font-size: 9px; margin-top: 4px;">• ${lang}</div>`).join('')}
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
              <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">${custom.label.toUpperCase()}</div>
                ${customData.map((entry, idx) => `
                  <div style="margin-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px;">
                      <div style="font-size: 10px; font-weight: bold;">${entry.title || entry.name || ''}</div>
                      <div style="font-size: 10px;">${entry.date || entry.start || ''}${(entry.date || entry.start) && (entry.end) ? ' - ' : ''}${entry.end || ''}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                      <div style="font-size: 10px; font-style: italic;">${entry.subtitle || entry.company || entry.institution || ''}</div>
                      <div style="font-size: 10px;">${entry.location || ''}</div>
                    </div>
                    <div style="font-size: 9px; margin-left: 16px;">
                      ${entry.description ? entry.description.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('') : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            // Simple text format
            return `
              <div style="margin-bottom: 10px;">
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">${custom.label.toUpperCase()}</div>
                <div style="font-size: 10px; margin-top: 4px; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form[custom.key] || ''}</div>
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 1 }) }); } catch (_) {}

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 1 }) }); } catch (_) {}

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

      // Header section - Centered like Harvard template
      if (form.firstName) {
        // Name - 18pt font, bold, centered
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${form.firstName} ${form.lastName || ''}`,
                size: 18 * 2, // Convert pt to docx units (1pt = 2 units)
                bold: true,
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 }, // 12px margin-bottom
          })
        );

        // Tagline - 11pt font, normal weight, centered
        if (form.tagline) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: form.tagline,
                  size: 11 * 2,
                  bold: false,
                  color: '333333',
                  font: 'Times New Roman',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 }, // 12px margin-bottom
            })
          );
        }

        // Contact info - 10pt font, centered
        const contactInfo = [
          form.phone,
          form.email,
          form.linkedin,
          form.city && form.country ? `${form.city}, ${form.country}` : form.city || form.country
        ].filter(Boolean).join(' • ');

        if (contactInfo) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: contactInfo,
                  size: 10 * 2,
                  color: '333333',
                  font: 'Times New Roman',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 360 }, // 18px margin-bottom for section spacing
            })
          );
        }
      }

      // Process sections with Harvard template formatting
      sections.forEach(section => {
            if (section === 'summary' && form.summary) {
          // Section title - 12pt, bold, uppercase, with bottom border
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'SUMMARY',
                  size: 12 * 2,
                  bold: true,
                  font: 'Times New Roman',
                  allCaps: true,
                }),
              ],
              spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 1,
                },
              },
            })
          );
          
          // Summary content - 11pt, left-aligned
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: form.summary,
                  size: 11 * 2,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { after: 240 }, // 12px margin-bottom
              alignment: AlignmentType.LEFT,
            })
          );
        }

            if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          // Section title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EXPERIENCE',
                  size: 12 * 2,
                  bold: true,
                  font: 'Times New Roman',
                  allCaps: true,
                }),
              ],
              spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 1,
                },
              },
            })
          );

          form.employment.forEach(job => {
            // Job title and dates - flex layout with space-between, dates pushed to far right
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: job.jobTitle,
                    size: 11 * 2,
                    bold: true,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: '\t', // Tab for spacing
                    size: 11 * 2,
                  }),
                  new TextRun({
                    text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                    size: 11 * 2,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { before: 120, after: 40 }, // 6px margin-top, 2px after
                tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
              })
            );

            // Company and location - flex layout with space-between, location pushed to far right
            if (job.company || job.location) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: job.company || '',
                      size: 11 * 2,
                      italics: true,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '\t', // Tab for spacing
                      size: 11 * 2,
                    }),
                    new TextRun({
                      text: job.location || '',
                      size: 11 * 2,
                      font: 'Times New Roman',
                    }),
                  ],
                  spacing: { after: 120 }, // 6px margin-bottom
                  tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
                })
              );
            }

            // Job description bullets - 11pt, indented
            if (job.desc) {
              const lines = job.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ',
                        size: 11 * 2,
                        font: 'Times New Roman',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 11 * 2,
                        font: 'Times New Roman',
                      }),
                    ],
                    spacing: { after: 40 }, // 2px margin-bottom
                    indent: { left: 400 }, // 20px left margin
                  })
                );
              });
            }
          });
        }

            if (section === 'education' && form.education && form.education[0].degree) {
          // Section title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'EDUCATION',
                  size: 12 * 2,
                  bold: true,
                  font: 'Times New Roman',
                  allCaps: true,
                }),
              ],
              spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 1,
                },
              },
            })
          );

          form.education.forEach(edu => {
            // School and date - flex layout with space-between, date pushed to far right
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: edu.school,
                    size: 11 * 2,
                    bold: true,
                    font: 'Times New Roman',
                  }),
                  new TextRun({
                    text: '\t', // Tab for spacing
                    size: 11 * 2,
                  }),
                  new TextRun({
                    text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                    size: 11 * 2,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { before: 120, after: 40 }, // 6px margin-top, 2px after
                tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
              })
            );

            // Degree and location - flex layout with space-between, location pushed to far right
            if (edu.degree || edu.location) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree || '',
                      size: 11 * 2,
                      italics: true,
                      font: 'Times New Roman',
                    }),
                    new TextRun({
                      text: '\t', // Tab for spacing
                      size: 11 * 2,
                    }),
                    new TextRun({
                      text: edu.location || '',
                      size: 11 * 2,
                      font: 'Times New Roman',
                    }),
                  ],
                  spacing: { after: 120 }, // 6px margin-bottom
                  tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
                })
              );
            }

            // Education description bullets - 11pt, indented
            if (edu.desc) {
              const lines = edu.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ',
                        size: 11 * 2,
                        font: 'Times New Roman',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 11 * 2,
                        font: 'Times New Roman',
                      }),
                    ],
                    spacing: { after: 40 }, // 2px margin-bottom
                    indent: { left: 400 }, // 20px left margin
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
            // Section title
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'SKILLS',
                    size: 12 * 2,
                    bold: true,
                    font: 'Times New Roman',
                    allCaps: true,
                  }),
                ],
                spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
                border: {
                  bottom: {
                    color: '000000',
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 1,
                  },
                },
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
                            size: 10 * 2, // Consistent with live preview (10px)
                            font: 'Times New Roman',
                          }),
                        ],
                        spacing: { after: 40 }, // 2px margin-bottom
                      }),
                    ],
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: { right: 400 }, // 20px margin-right
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
                            size: 10 * 2, // Consistent with live preview (10px)
                            font: 'Times New Roman',
                          }),
                        ],
                        spacing: { after: 40 }, // 2px margin-bottom
                      }),
                    ],
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    margins: { right: 400 }, // 20px margin-right
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
                            size: 10 * 2, // Consistent with live preview (10px)
                            font: 'Times New Roman',
                          }),
                        ],
                        spacing: { after: 40 }, // 2px margin-bottom
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
                margins: { top: 240 }, // 12px margin-top
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
          // Section title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'PROJECTS',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                  allCaps: true,
                }),
              ],
              spacing: { before: 400, after: 160 }, // 25px margin-bottom, 8px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 2,
                },
              },
            })
          );

          form.projects.forEach(proj => {
            // Project name and date - flex layout with space-between, date pushed to far right
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name,
                    size: 13 * 2,
                    bold: true,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: '\t', // Tab for spacing
                    size: 13 * 2,
                  }),
                  new TextRun({
                    text: proj.date || '',
                    size: 13 * 2,
                    font: 'Arial',
                  }),
                ],
                spacing: { before: 320, after: 240 }, // 16px margin-top, 12px after
                tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
              })
            );

            // Project description bullets - 12px, indented
            if (proj.desc) {
              const lines = proj.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ',
                        size: 12 * 2,
                        font: 'Arial',
                      }),
                      new TextRun({
                        text: line.trim(),
                        size: 12 * 2,
                        font: 'Arial',
                      }),
                    ],
                    spacing: { after: 80 }, // 4px margin-bottom
                    indent: { left: 400 }, // 20px left margin
                  })
                );
              });
            }
          });
        }

            if (section === 'certifications' && form.certifications && form.certifications[0]) {
          // Section title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'CERTIFICATIONS',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                  allCaps: true,
                }),
              ],
              spacing: { before: 400, after: 160 }, // 25px margin-bottom, 8px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 2,
                },
              },
            })
          );

          form.certifications.forEach(cert => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ',
                    size: 12 * 2,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: cert,
                    size: 12 * 2,
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 240 }, // 12px margin-top
              })
            );
          });
        }

            if (section === 'languages' && form.languages && form.languages[0]) {
          // Section title
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'LANGUAGES',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                  allCaps: true,
                }),
              ],
              spacing: { before: 400, after: 160 }, // 25px margin-bottom, 8px after title
              border: {
                bottom: {
                  color: '000000',
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 2,
                },
              },
            })
          );

          form.languages.forEach(lang => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ',
                    size: 12 * 2,
                    font: 'Arial',
                  }),
                  new TextRun({
                    text: lang,
                    size: 12 * 2,
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 240 }, // 12px margin-top
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
                        text: custom.label.toUpperCase(),
                        size: 12 * 2,
                        bold: true,
                        font: 'Times New Roman',
                        allCaps: true,
                      }),
                    ],
                    spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
                    border: {
                      bottom: {
                        color: '000000',
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 1,
                      },
                    },
                  })
                );

                customData.forEach(entry => {
                  // Title and date - flex layout with space-between, date pushed to far right
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: entry.title || entry.name || '',
                          size: 11 * 2,
                          bold: true,
                          font: 'Times New Roman',
                        }),
                        new TextRun({
                          text: '\t', // Tab for spacing
                          size: 11 * 2,
                        }),
                        new TextRun({
                          text: `${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' - ' : ''}${entry.end || ''}`,
                          size: 11 * 2,
                          font: 'Times New Roman',
                        }),
                      ],
                      spacing: { before: 120, after: 40 }, // 6px margin-top, 2px after
                      tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
                    })
                  );

                  // Subtitle and location - flex layout with space-between, location pushed to far right
                  if (entry.subtitle || entry.company || entry.institution || entry.location) {
                    children.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: entry.subtitle || entry.company || entry.institution || '',
                            size: 11 * 2,
                            italics: true,
                            font: 'Times New Roman',
                          }),
                          new TextRun({
                            text: '\t', // Tab for spacing
                            size: 11 * 2,
                          }),
                          new TextRun({
                            text: entry.location || '',
                            size: 11 * 2,
                            font: 'Times New Roman',
                          }),
                        ],
                        spacing: { after: 120 }, // 6px margin-bottom
                        tabStops: [{ type: TabStopType.RIGHT, position: 12000 }], // Push to far right edge
                      })
                    );
                  }

                  // Description bullets - 11pt, indented
                  if (entry.description) {
                    const lines = entry.description.split('\n').filter(line => line.trim());
                    lines.forEach(line => {
                      children.push(
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: '• ',
                              size: 11 * 2,
                              font: 'Times New Roman',
                            }),
                            new TextRun({
                              text: line.trim(),
                              size: 11 * 2,
                              font: 'Times New Roman',
                            }),
                          ],
                          spacing: { after: 40 }, // 2px margin-bottom
                          indent: { left: 400 }, // 20px left margin
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
                        text: custom.label.toUpperCase(),
                        size: 12 * 2,
                        bold: true,
                        font: 'Times New Roman',
                        allCaps: true,
                      }),
                    ],
                    spacing: { before: 240, after: 120 }, // 12px margin-bottom, 6px after title
                    border: {
                      bottom: {
                        color: '000000',
                        space: 1,
                        style: BorderStyle.SINGLE,
                        size: 1,
                      },
                    },
                  })
                );
                
                if (form[custom.key]) {
                  children.push(
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: form[custom.key],
                          size: 11 * 2,
                          font: 'Times New Roman',
                        }),
                      ],
                      spacing: { after: 240 }, // 12px margin-bottom
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
              templateId="template-1"
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
                      padding: '40px 40px',
                      fontFamily: "'Times New Roman', serif",
                      color: "#000",
                      background: '#fff',
                      fontSize: 10,
                      lineHeight: 1.0,
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
