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
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun } from 'docx';

export default function ResumeEditorPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState(["personal", "summary", "employment", "education", "skills"]);
  const [customSections, setCustomSections] = useState([]);
  const [step, setStep] = useState(0);
  
  // Get tailored CV data from job fit analysis
  const { initialFormData, initialSections, hasLoadedInitialData } = useTailoredCVData();
  
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



  // Resume preview content (WYSIWYG) - Template 9: Mia Wyatt (Professional ATS)
  const previewHtml = `
    <div style="padding: 40px 50px; font-family: 'Arial', sans-serif; color: #333; min-height: 1040px; font-size: 10px; line-height: 1.4; background: #fff;">
      
      <!-- Header Section -->
      <div style="text-align: center; margin-bottom: 30px;">
        ${form.profileImage ? `
          <div style="margin-bottom: 15px; display: flex; justify-content: center;">
            <img src="${form.profileImage}" style="width: 85px; height: 85px; object-fit: cover; border: 1px solid #eee; border-radius: 4px;" />
          </div>
        ` : `
          <div style="margin-bottom: 15px; display: flex; justify-content: center;">
            <div style="width: 85px; height: 85px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; border: 1px solid #eee; border-radius: 4px;">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        `}
        <div style="font-size: 24px; font-weight: 800; color: #000; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 1px;">
          ${form.firstName || 'VIOLET'} ${form.lastName || 'RODRIGUEZ'}
        </div>
        <div style="font-size: 13px; color: #3b82f6; font-weight: 600; margin-bottom: 10px;">
          ${form.tagline || 'Bi-lingual Interactor | Acting & Improv'}
        </div>
        <div style="display: center; justify-content: center; flex-wrap: wrap; gap: 12px; color: #666; font-size: 9.5px;">
          ${form.email ? `<span>${form.email}</span>` : ''}
          ${form.email && form.linkedin ? '<span>•</span>' : ''}
          ${form.linkedin ? `<span>${form.linkedin}</span>` : ''}
          ${(form.email || form.linkedin) && (form.city || form.country) ? '<span>•</span>' : ''}
          ${form.city || form.country ? `<span>${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}</span>` : ''}
        </div>
      </div>

      ${sections.map(section => {
    if (section === 'summary' && form.summary) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 12px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Summary</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              <div style="font-size: 10px; color: #444; line-height: 1.6; text-align: left;">${form.summary}</div>
            </div>
          `;
    }
    if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Experience</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              ${form.employment.map((job, idx) => `
                <div style="margin-bottom: 18px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <div style="font-size: 12px; color: #888;">${job.jobTitle}</div>
                    <div style="font-size: 10px; color: #888;">${job.location || ''}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <div style="font-size: 11px; font-weight: 700; color: #000;">${job.company}</div>
                    <div style="font-size: 10px; font-weight: 710; color: #888;">${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</div>
                  </div>
                  ${job.desc ? `
                    <div style="font-size: 9.5px; color: #444; line-height: 1.5; margin-left: 0px;">
                      ${job.desc.split('\n').filter(line => line.trim()).map(line => `
                        <div style="margin-bottom: 4px; display: flex; gap: 8px;">
                          <span style="color: #888;">•</span>
                          <span>${line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim()}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
    }
    if (section === 'education' && form.education && form.education[0].degree) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Education</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              ${form.education.map((edu, idx) => `
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <div style="font-size: 12px; color: #888;">${edu.school}</div>
                    <div style="font-size: 10px; color: #888;">${edu.location || ''}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <div style="font-size: 11px; font-weight: 700; color: #000;">${edu.degree}</div>
                    <div style="font-size: 10px; color: #888;">${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}</div>
                  </div>
                  ${edu.desc ? `<div style="font-size: 9px; color: #666; margin-top: 4px;">${edu.desc}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
    }
    if (section === 'skills' && form.skills) {
      const skillsArray = Array.isArray(form.skills)
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
        : form.skills.split(',').map(s => s.trim()).filter(s => s);

      if (skillsArray.length > 0) {
        return `
              <div style="margin-bottom: 25px;">
                <div style="text-align: center; margin-bottom: 15px;">
                  <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Skills</div>
                  <div style="height: 1px; background: #ccc; width: 100%;"></div>
                </div>
                <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; row-gap: 5px; color: #444; font-size: 10px;">
                  ${skillsArray.map((skill, idx) => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return `
                      <span>${skillName}</span>
                      ${idx < skillsArray.length - 1 ? '<span style="color: #ccc;">•</span>' : ''}
                    `;
        }).join('')}
                </div>
              </div>
            `;
      }
      return '';
    }
    if (section === 'certifications' && form.certifications && form.certifications[0]) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Certification</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              ${form.certifications.map(cert => `
                <div style="font-size: 10px; color: #444; margin-bottom: 10px; display: flex; align-items: flex-start; gap: 8px;">
                  <span style="color: #888;">—</span>
                  <span>${cert}</span>
                </div>
              `).join('')}
            </div>
          `;
    }
    if (section === 'projects' && form.projects && form.projects[0].name) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Projects</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              ${form.projects.map(proj => `
                <div style="margin-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <div style="font-size: 11px; font-weight: 700; color: #000;">${proj.name}</div>
                    <div style="font-size: 10px; color: #888;">${proj.date || ''}</div>
                  </div>
                  ${proj.desc ? `<div style="font-size: 9.5px; color: #666; line-height: 1.4;">${proj.desc}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `;
    }
    if (section === 'languages' && form.languages && form.languages[0]) {
      return `
            <div style="margin-bottom: 25px;">
              <div style="text-align: center; margin-bottom: 12px;">
                <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">Languages</div>
                <div style="height: 1px; background: #ccc; width: 100%;"></div>
              </div>
              <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; color: #444; font-size: 10px;">
                ${form.languages.map((lang, idx) => `
                  <span>${lang}</span>
                  ${idx < form.languages.length - 1 ? '<span style="color: #ccc;">•</span>' : ''}
                `).join('')}
              </div>
            </div>
          `;
    }
    const custom = customSections.find(cs => cs.key === section);
    if (custom) {
      const customData = form[custom.key];
      if (customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
        return `
              <div style="margin-bottom: 25px;">
                <div style="text-align: center; margin-bottom: 15px;">
                  <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">${custom.label}</div>
                  <div style="height: 1px; background: #ccc; width: 100%;"></div>
                </div>
                ${customData.map((entry, idx) => `
                  <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                      <div style="font-size: 11px; color: #888;">${entry.title || entry.name || ''}</div>
                      <div style="font-size: 10px; color: #888;">${entry.date || entry.start || ''}${(entry.date || entry.start) && (entry.end) ? ' - ' : ''}${entry.end || ''}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <div style="font-size: 11px; font-weight: 700; color: #000;">${entry.subtitle || entry.company || entry.institution || ''}</div>
                      <div style="font-size: 10px; color: #888;">${entry.location || ''}</div>
                    </div>
                    <div style="font-size: 9.5px; color: #444; line-height: 1.5; margin-left: 0px;">
                      ${entry.description ? entry.description.split('\n').filter(line => line.trim()).map(line => `
                        <div style="margin-bottom: 4px; display: flex; gap: 8px;">
                          <span style="color: #888;">•</span>
                          <span>${line.trim()}</span>
                        </div>
                      `).join('') : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
      } else {
        return `
              <div style="margin-bottom: 25px;">
                <div style="text-align: center; margin-bottom: 15px;">
                  <div style="font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px;">${custom.label}</div>
                  <div style="height: 1px; background: #ccc; width: 100%;"></div>
                </div>
                <div style="font-size: 10px; color: #444; line-height: 1.6;">${form[custom.key] || ''}</div>
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
  // DOCX download handler
  async function handleDownloadDOCX() {
    try {
      const children = [];

      // Header Section - Centered with Name, Tagline, and Contact Info
      if (form.profileImage) {
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: await fetch(form.profileImage).then(r => r.arrayBuffer()),
                transformation: { width: 85, height: 85 },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      }

      if (form.firstName) {
        // Name - 24pt, Bold, Centered, Uppercase
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${form.firstName} ${form.lastName || ''}`.toUpperCase(),
                size: 24 * 2,
                bold: true,
                font: 'Arial',
                color: '000000',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          })
        );

        // Tagline - 13pt, Blue, Centered
        if (form.tagline) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: form.tagline,
                  size: 13 * 2,
                  bold: true,
                  color: '3b82f6',
                  font: 'Arial',
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            })
          );
        }

        // Contact Info - Centered
        const contactParts = [
          form.email,
          form.linkedin,
          form.city && form.country ? `${form.city}, ${form.country}` : form.city || form.country
        ].filter(Boolean);

        if (contactParts.length > 0) {
          children.push(
            new Paragraph({
              children: contactParts.map((part, i) => [
                new TextRun({ text: part, size: 9.5 * 2, color: '666666', font: 'Arial' }),
                i < contactParts.length - 1 ? new TextRun({ text: '  •  ', size: 9.5 * 2, color: 'CCCCCC', font: 'Arial' }) : null
              ]).flat().filter(Boolean),
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            })
          );
        }
      }

      // Helper for Section Titles
      const createSectionTitle = (text) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: text,
              size: 13 * 2,
              bold: true,
              color: '333333',
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 80 },
          border: {
            bottom: { color: 'CCCCCC', space: 4, style: BorderStyle.SINGLE, size: 1 },
          },
        });
      };

      sections.forEach(section => {
        if (section === 'summary' && form.summary) {
          children.push(createSectionTitle('Summary'));
          children.push(
            new Paragraph({
              children: [new TextRun({ text: form.summary, size: 10 * 2, font: 'Arial', color: '444444' })],
              spacing: { after: 300, line: 360 }, // 1.5 line spacing
              alignment: AlignmentType.LEFT,
            })
          );
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          children.push(createSectionTitle('Experience'));
          form.employment.forEach(job => {
            // Line 1: Job Title (Grey) and Location (Right, Grey)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: job.jobTitle, size: 12 * 2, font: 'Arial', color: '888888' }),
                  new TextRun({ text: '\t' + (job.location || ''), size: 10 * 2, font: 'Arial', color: '888888' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                spacing: { after: 40 },
              })
            );

            // Line 2: Company (Bold, Black) and Dates (Right, Grey)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: job.company, size: 11 * 2, bold: true, font: 'Arial', color: '000000' }),
                  new TextRun({ text: '\t' + `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`, size: 10 * 2, font: 'Arial', color: '888888' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                spacing: { after: 120 },
              })
            );

            // Description
            if (job.desc) {
              const lines = job.desc.split('\n').filter(line => line.trim());
              lines.forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: '• ', size: 10 * 2, color: '888888' }),
                      new TextRun({
                        text: line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim(),
                        size: 9.5 * 2,
                        font: 'Arial',
                        color: '444444',
                      }),
                    ],
                    spacing: { after: 60 },
                    indent: { left: 240 },
                  })
                );
              });
              children.push(new Paragraph({ spacing: { after: 120 } }));
            }
          });
        }

        if (section === 'education' && form.education && form.education[0].degree) {
          children.push(createSectionTitle('Education'));
          form.education.forEach(edu => {
            // Line 1: School (Grey) and Location (Right, Grey)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: edu.school, size: 12 * 2, font: 'Arial', color: '888888' }),
                  new TextRun({ text: '\t' + (edu.location || ''), size: 10 * 2, font: 'Arial', color: '888888' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                spacing: { after: 40 },
              })
            );

            // Line 2: Degree (Bold, Black) and Dates (Right, Grey)
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, size: 11 * 2, bold: true, font: 'Arial', color: '000000' }),
                  new TextRun({ text: '\t' + `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`, size: 10 * 2, font: 'Arial', color: '888888' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                spacing: { after: 120 },
              })
            );
          });
        }

        if (section === 'skills' && form.skills) {
          const skillsArray = Array.isArray(form.skills)
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
            : form.skills.split(',').map(s => s.trim()).filter(s => s);

          if (skillsArray.length > 0) {
            children.push(createSectionTitle('Skills'));
            children.push(
              new Paragraph({
                children: skillsArray.map((skill, i) => [
                  new TextRun({ text: typeof skill === 'string' ? skill : skill.name, size: 10 * 2, color: '444444', font: 'Arial' }),
                  i < skillsArray.length - 1 ? new TextRun({ text: '  •  ', size: 10 * 2, color: 'CCCCCC', font: 'Arial' }) : null
                ]).flat().filter(Boolean),
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 },
              })
            );
          }
        }

        if (section === 'projects' && form.projects && form.projects[0].name) {
          children.push(createSectionTitle('Projects'));
          form.projects.forEach(proj => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: proj.name, size: 11 * 2, bold: true, font: 'Arial' }),
                  new TextRun({ text: '\t' + (proj.date || ''), size: 10 * 2, font: 'Arial', color: '888888' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                spacing: { after: 120 },
              })
            );
            if (proj.desc) {
              children.push(new Paragraph({ children: [new TextRun({ text: proj.desc, size: 9.5 * 2, font: 'Arial', color: '444444' })], spacing: { after: 120 } }));
            }
          });
        }

        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          children.push(createSectionTitle('Certification'));
          form.certifications.forEach(cert => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: '— ', size: 10 * 2, color: '888888' }),
                  new TextRun({ text: cert, size: 10 * 2, font: 'Arial', color: '444444' }),
                ],
                spacing: { after: 80 },
              })
            );
          });
        }

        if (section === 'languages' && form.languages && form.languages[0]) {
          children.push(createSectionTitle('Languages'));
          children.push(
            new Paragraph({
              children: form.languages.map((lang, i) => [
                new TextRun({ text: lang, size: 10 * 2, color: '444444', font: 'Arial' }),
                i < form.languages.length - 1 ? new TextRun({ text: '  •  ', size: 10 * 2, color: 'CCCCCC', font: 'Arial' }) : null
              ]).flat().filter(Boolean),
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            })
          );
        }

        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          const customData = form[custom.key];
          children.push(createSectionTitle(custom.label));
          if (Array.isArray(customData)) {
            customData.forEach(entry => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: entry.title || entry.name || '', size: 11 * 2, bold: true, font: 'Arial' }),
                    new TextRun({ text: '\t' + (entry.date || entry.start || ''), size: 10 * 2, font: 'Arial', color: '888888' }),
                  ],
                  tabStops: [{ type: TabStopType.RIGHT, position: 10500 }],
                  spacing: { after: 120 },
                })
              );
              if (entry.description) {
                children.push(new Paragraph({ children: [new TextRun({ text: entry.description, size: 9.5 * 2, font: 'Arial', color: '444444' })], spacing: { after: 120 } }));
              }
            });
          } else {
            children.push(new Paragraph({ children: [new TextRun({ text: form[custom.key] || '', size: 10 * 2, font: 'Arial', color: '444444' })], spacing: { after: 300 } }));
          }
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 },
              },
            },
            children: children,
          },
        ],
      });

      return await Packer.toBlob(doc);
    } catch (error) {
      console.error('DOCX generation error:', error);
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
                initialSections={initialSections}
                hasTailoredDataLoaded={hasLoadedInitialData}
                templateId="template-9"
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
                      fontFamily: "'Arial', sans-serif",
                      color: "#333",
                      background: '#fff',
                      fontSize: 10,
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
