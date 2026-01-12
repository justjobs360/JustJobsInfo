"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Breadcrumb from "@/components/common/Breadcrumb";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";
import { useTailoredCVData } from "@/utils/useTailoredCVData";

import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun, ShadingType, VerticalAlign, HeightRule } from 'docx';

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



  // Resume preview content (WYSIWYG) - Dark Modern Template with Sidebar
  const previewHtml = `
    <div style="font-family: 'Georgia', serif; color: #fff; min-height: 1131px; font-size: 11px; line-height: 1.4; background: #1a1a2e; display: flex; flex-direction: column; padding: 40px 48px;">
      
      <!-- Header Bar with Name and Tagline -->
      <div style="margin-bottom: 40px;">
        <div style="font-size: 42px; font-weight: 700; color: #fff; letter-spacing: 1px; text-transform: uppercase; line-height: 1.1; margin-bottom: 8px;">
          ${form.firstName || ''} ${form.lastName || ''}
        </div>
        <div style="font-size: 14px; color: #b8b8c8; font-weight: 400; text-transform: uppercase; letter-spacing: 2px;">${form.tagline || 'Professional'}</div>
      </div>

      <!-- Profile (Summary) - Full Width -->
      ${form.summary ? `
      <div style="margin-bottom: 40px; border-bottom: 1px solid #2d2d44; padding-bottom: 32px;">
        <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Profile</div>
        <div style="font-size: 18px; font-weight: 600; color: #fff; font-style: italic; margin-bottom: 12px; line-height: 1.4;">${form.summary.split('.')[0]}${form.summary.includes('.') ? '.' : ''}</div>
        <div style="font-size: 11px; color: #c8c8d8; line-height: 1.6;">${form.summary.split('.').slice(1).join('.').trim()}</div>
      </div>
      ` : ''}

      <!-- Main Content - Two Column Layout -->
      <div style="display: flex; gap: 48px; flex: 1;">
        
        <!-- Main Column (Left) -->
        <div style="flex: 1.8;">
          
          ${form.employment && form.employment[0]?.jobTitle ? `
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">Employment History</div>
            ${form.employment.map(job => `
              <div style="margin-bottom: 24px;">
                <div style="font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 4px;">${job.jobTitle}${job.company ? ` at ${job.company}` : ''}</div>
                <div style="font-size: 10px; color: #7dd3fc; margin-bottom: 8px;">${job.start || ''}${job.start && job.end ? ' — ' : ''}${job.end || ''} | ${job.location || ''}</div>
                <div style="font-size: 10px; color: #c8c8d8; line-height: 1.6;">
                  ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 4px; display: flex; gap: 8px;"><span style="color: #555;">•</span> ${line.trim()}</div>`).join('') : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${form.education && form.education[0]?.degree ? `
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">Education</div>
            ${form.education.map(edu => `
              <div style="margin-bottom: 16px;">
                <div style="font-size: 11px; font-weight: 600; color: #fff; margin-bottom: 2px;">${edu.degree}${edu.school ? ` — ${edu.school}` : ''}</div>
                <div style="font-size: 10px; color: #7dd3fc;">${edu.start || ''}${edu.start && edu.end ? ' — ' : ''}${edu.end || ''} | ${edu.location || ''}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${form.projects && form.projects[0]?.name ? `
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">Projects</div>
            ${form.projects.map(proj => `
              <div style="margin-bottom: 16px;">
                <div style="font-size: 11px; font-weight: 600; color: #fff; margin-bottom: 2px;">${proj.name}</div>
                <div style="font-size: 10px; color: #c8c8d8; line-height: 1.5;">${proj.desc || ''}</div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${customSections.map(custom => {
    const customData = form[custom.key];
    if (!customData) return '';
    return `
              <div style="margin-bottom: 32px;">
                <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;">${custom.label}</div>
                ${Array.isArray(customData) ? customData.map(entry => `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #fff;">${entry.title || entry.name || ''}</div>
                    <div style="font-size: 10px; color: #c8c8d8;">${entry.description || ''}</div>
                  </div>
                `).join('') : `<div style="font-size: 10px; color: #c8c8d8; white-space: pre-wrap;">${customData}</div>`}
              </div>
            `;
  }).join('')}
        </div>

        <!-- Sidebar Column (Right) -->
        <div style="flex: 1; border-left: 1px solid #2d2d44; padding-left: 32px;">
          
          <!-- Details Section -->
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Details</div>
            <div style="font-size: 10px; color: #c8c8d8; line-height: 1.8;">
              ${form.address || form.city || form.country ? `<div>${form.address ? form.address + ', ' : ''}${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}</div>` : ''}
              ${form.phone ? `<div>${form.phone}</div>` : ''}
              ${form.email ? `<div style="color: #7dd3fc; text-decoration: none;">${form.email}</div>` : ''}
            </div>
          </div>

          <!-- Skills Section -->
          ${(() => {
      if (!form.skills) return '';
      const skillsArray = Array.isArray(form.skills)
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
        : form.skills.split(',').map(s => s.trim()).filter(s => s);
      if (skillsArray.length === 0) return '';
      return `
            <div style="margin-bottom: 32px;">
              <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Skills</div>
              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${skillsArray.map(skill => {
        const skillName = typeof skill === 'string' ? skill : skill.name;
        return `<div style="font-size: 10px; color: #c8c8d8; display: flex; align-items: center; gap: 8px;"><span style="color: #7dd3fc; font-size: 8px;">◯</span> ${skillName}</div>`;
      }).join('')}
              </div>
            </div>
          `;
    })()}

          <!-- Languages / Certifications -->
          ${form.languages && form.languages[0] ? `
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Languages</div>
            <div style="font-size: 10px; color: #c8c8d8;">
              ${form.languages.map(lang => `<div style="margin-bottom: 4px;">• ${lang}</div>`).join('')}
            </div>
          </div>
          ` : ''}

          ${form.certifications && form.certifications[0] ? `
          <div style="margin-bottom: 32px;">
            <div style="font-size: 10px; font-weight: 600; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px;">Certifications</div>
            <div style="font-size: 10px; color: #c8c8d8;">
              ${form.certifications.map(cert => `<div style="margin-bottom: 4px;">• ${cert}</div>`).join('')}
            </div>
          </div>
          ` : ''}

        </div>

      </div>

      <div style="position: absolute; bottom: 16px; right: 24px; font-size: 10px; color: #444;">1</div>
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
          font-family: 'Georgia', serif;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 1 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 1 }) }); } catch (_) { }

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
  async function handleDownloadDOCX() {
    try {
      const tableRows = [];

      // Row 1: Header (Name & Tagline)
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${form.firstName || ''} ${form.lastName || ''}`.toUpperCase(),
                      color: 'FFFFFF',
                      size: 32 * 2,
                      bold: true,
                      font: 'Georgia',
                    }),
                  ],
                  spacing: { before: 400, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: (form.tagline || 'Professional').toUpperCase(),
                      color: 'B8B8C8',
                      size: 11 * 2,
                      font: 'Georgia',
                      characterSpacing: 40,
                    }),
                  ],
                  spacing: { after: 400 },
                }),
              ],
              shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              margins: { left: 800, right: 800 },
            }),
          ],
        })
      );

      // Row 2: Profile/Summary
      if (form.summary) {
        const parts = form.summary.split('.');
        const first = parts[0] + (parts.length > 1 ? '.' : '');
        const rest = parts.slice(1).join('.').trim();
        tableRows.push(
          new TableRow({
            children: [
              new TableCell({
                columnSpan: 2,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: 'PROFILE', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
                    spacing: { before: 200, after: 200 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: first, color: 'FFFFFF', bold: true, italics: true, size: 14 * 2, font: 'Georgia' }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: rest, color: 'C8C8D8', size: 10 * 2, font: 'Georgia' })],
                    spacing: { after: 400 },
                  }),
                ],
                shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                },
                margins: { left: 800, right: 800 },
              }),
            ],
          })
        );
      }

      // Columns Prep
      const mainContent = [];
      const sidebarContent = [];

      // Main Column: Employment
      if (form.employment && form.employment[0]?.jobTitle) {
        mainContent.push(
          new Paragraph({
            children: [new TextRun({ text: 'EMPLOYMENT HISTORY', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
            spacing: { before: 200, after: 200 },
          })
        );
        form.employment.forEach(job => {
          mainContent.push(
            new Paragraph({
              children: [
                new TextRun({ text: job.jobTitle, color: 'FFFFFF', bold: true, size: 11 * 2, font: 'Georgia' }),
                new TextRun({ text: ` at ${job.company || ''}`, color: 'C8C8D8', size: 11 * 2, font: 'Georgia' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${job.start || ''} — ${job.end || ''} | ${job.location || ''}`, color: '7DD3FC', size: 9 * 2, font: 'Georgia' }),
              ],
              spacing: { after: 100 },
            })
          );
          if (job.desc) {
            job.desc.split('\n').filter(l => l.trim()).forEach(line => {
              mainContent.push(new Paragraph({
                children: [
                  new TextRun({ text: '• ', color: '555555', size: 10 * 2 }),
                  new TextRun({ text: line.trim(), color: 'C8C8D8', size: 10 * 2, font: 'Georgia' }),
                ],
                indent: { left: 240 },
                spacing: { after: 60 },
              }));
            });
          }
          mainContent.push(new Paragraph({ spacing: { after: 200 } }));
        });
      }

      // Main Column: Education
      if (form.education && form.education[0]?.degree) {
        mainContent.push(
          new Paragraph({
            children: [new TextRun({ text: 'EDUCATION', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
            spacing: { before: 200, after: 200 },
          })
        );
        form.education.forEach(edu => {
          mainContent.push(
            new Paragraph({
              children: [
                new TextRun({ text: edu.degree || '', color: 'FFFFFF', bold: true, size: 11 * 2, font: 'Georgia' }),
                new TextRun({ text: ` — ${edu.school || ''}`, color: 'C8C8D8', size: 11 * 2, font: 'Georgia' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${edu.start || ''} — ${edu.end || ''} | ${edu.location || ''}`, color: '7DD3FC', size: 9 * 2, font: 'Georgia' }),
              ],
              spacing: { after: 200 },
            })
          );
        });
      }

      // Sidebar Column: Details
      sidebarContent.push(
        new Paragraph({
          children: [new TextRun({ text: 'DETAILS', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: `${form.address ? form.address + ', ' : ''}${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}`, color: 'C8C8D8', size: 10 * 2, font: 'Georgia' })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: form.phone || '', color: 'C8C8D8', size: 10 * 2, font: 'Georgia' })],
          spacing: { after: 60 },
        }),
        new Paragraph({
          children: [new TextRun({ text: form.email || '', color: '7DD3FC', size: 10 * 2, font: 'Georgia' })],
          spacing: { after: 400 },
        })
      );

      // Sidebar Column: Skills
      if (form.skills) {
        const skillsArray = Array.isArray(form.skills)
          ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
          : form.skills.split(',').map(s => s.trim()).filter(s => s);

        if (skillsArray.length > 0) {
          sidebarContent.push(
            new Paragraph({
              children: [new TextRun({ text: 'SKILLS', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
              spacing: { after: 200 },
            })
          );
          skillsArray.forEach(skill => {
            const name = typeof skill === 'string' ? skill : skill.name;
            sidebarContent.push(new Paragraph({
              children: [
                new TextRun({ text: '◯ ', color: '7DD3FC', size: 8 * 2, font: 'Georgia' }),
                new TextRun({ text: name, color: 'C8C8D8', size: 9 * 2, font: 'Georgia' }),
              ],
              spacing: { after: 120 },
            }));
          });
        }
      }

      // Sidebar Column: Projects
      if (form.projects && form.projects[0]?.name) {
        sidebarContent.push(
          new Paragraph({
            children: [new TextRun({ text: 'PROJECTS', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
            spacing: { before: 200, after: 200 },
          })
        );
        form.projects.forEach(proj => {
          sidebarContent.push(
            new Paragraph({
              children: [
                new TextRun({ text: proj.name, color: 'FFFFFF', bold: true, size: 11 * 2, font: 'Georgia' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: proj.desc || '', color: 'C8C8D8', size: 10 * 2, font: 'Georgia' }),
              ],
              spacing: { after: 200 },
            })
          );
        });
      }

      // Sidebar Column: Certifications
      if (form.certifications && form.certifications[0]) {
        sidebarContent.push(
          new Paragraph({
            children: [new TextRun({ text: 'CERTIFICATIONS', color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' })],
            spacing: { before: 200, after: 200 },
          })
        );
        form.certifications.forEach(cert => {
          sidebarContent.push(new Paragraph({
            children: [
              new TextRun({ text: '• ', color: '555555', size: 10 * 2 }),
              new TextRun({ text: cert, color: 'C8C8D8', size: 10 * 2, font: 'Georgia' }),
            ],
            indent: { left: 240 },
            spacing: { after: 60 },
          }));
        });
        sidebarContent.push(new Paragraph({ spacing: { after: 200 } }));
      }

      // Sidebar Column: Custom Sections
      customSections.forEach(custom => {
        const customData = form[custom.key];
        if (!customData) return;

        sidebarContent.push(
          new Paragraph({
            children: [
              new TextRun({ text: custom.label.toUpperCase(), color: 'FFFFFF', bold: true, size: 9 * 2, font: 'Georgia' }),
            ],
            spacing: { before: 200, after: 200 },
          })
        );

        if (Array.isArray(customData)) {
          customData.forEach(entry => {
            sidebarContent.push(
              new Paragraph({
                children: [
                  new TextRun({ text: entry.title || entry.name || '', color: 'FFFFFF', bold: true, size: 11 * 2, font: 'Georgia' }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: entry.description || '', color: 'C8C8D8', size: 10 * 2, font: 'Georgia' }),
                ],
                spacing: { after: 200 },
              })
            );
          });
        } else {
          sidebarContent.push(
            new Paragraph({
              children: [
                new TextRun({ text: String(customData), color: 'C8C8D8', size: 10 * 2, font: 'Georgia' }),
              ],
              spacing: { after: 200 },
            })
          );
        }
      });

      // Body Row (Main and Sidebar)
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              width: { size: 65, type: WidthType.PERCENTAGE },
              children: mainContent,
              shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              margins: { left: 800, right: 400 },
            }),
            new TableCell({
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: sidebarContent,
              shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              margins: { left: 400, right: 800 },
            }),
          ],
        })
      );

      // Filler Row to extend background
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [new Paragraph({ spacing: { before: 2400 } })],
              shading: { fill: '1A1A2E', type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
            }),
          ],
        })
      );

      const doc = new Document({
        background: {
          color: "1A1A2E",
        },
        sections: [{
          properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
              },
            }),
          ],
        }],
      });

      return await Packer.toBlob(doc);
    } catch (error) {
      console.error('DOCX Error:', error);
      return null;
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
                templateId="template-14"
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
                    background: "#1a1a2e",
                    borderRadius: 8,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)",
                    border: "1px solid #2d2d44",
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
                      fontFamily: "'Georgia', serif",
                      color: "#fff",
                      background: '#1a1a2e',
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
