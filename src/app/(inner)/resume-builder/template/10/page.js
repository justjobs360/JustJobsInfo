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



  // Resume preview content (WYSIWYG) - Template 10: Greta Mae Evans (Beige Sidebar)
  // Resume preview content (WYSIWYG) - Template 10: Ava Williams (Modern Two-Column)
  const previewHtml = `
    <div style="padding: 40px; font-family: 'Inter', sans-serif; color: #333; min-height: 1040px; font-size: 11px; line-height: 1.5; background: #fff;">
      
      <!-- Top Section: Name and Photo -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <div style="flex: 1;">
          <div style="font-size: 36px; font-weight: 800; color: #1a2a4e; text-transform: uppercase; line-height: 1.1; margin-bottom: 8px;">
            ${form.firstName || 'AVA'} ${form.lastName || 'WILLIAMS'}
          </div>
          <div style="font-size: 16px; font-weight: 600; color: #d4a373; margin-bottom: 15px;">
            ${form.tagline || 'Senior UX/UI Designer | User Research | Web Prototyping'}
          </div>
          <div style="display: flex; gap: 15px; color: #666; font-size: 10px; flex-wrap: wrap;">
            ${form.email ? `<div style="display: flex; align-items: center; gap: 4px;"><span>✉️</span> ${form.email}</div>` : ''}
            ${form.linkedin ? `<div style="display: flex; align-items: center; gap: 4px;"><span>🔗</span> ${form.linkedin}</div>` : ''}
            ${form.city || form.country ? `<div style="display: flex; align-items: center; gap: 4px;"><span>📍</span> ${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}</div>` : ''}
          </div>
        </div>
        <div style="position: relative; width: 120px; height: 120px; display: flex; justify-content: flex-end;">
          ${form.profileImage ? `
            <img src="${form.profileImage}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 2;" />
            <div style="position: absolute; top: 0; right: 0; width: 100px; height: 100px; background: #e2e8f0; border-radius: 50%; z-index: 1; opacity: 0.5;"></div>
          ` : `
            <div style="width: 100px; height: 100px; border-radius: 50%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af; border: 4px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          `}
        </div>
      </div>

      <div style="display: flex; gap: 40px;">
        <!-- Left Column (65%) -->
        <div style="flex: 6.5;">
          ${sections.filter(s => ['summary', 'employment', 'projects'].includes(s)).map(section => {
    if (section === 'summary' && form.summary) {
      return `
              <div style="margin-bottom: 25px;">
                <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 0.5px;">Summary</div>
                <div style="font-size: 10.5px; color: #444; line-height: 1.6; text-align: justify;">${form.summary}</div>
              </div>
            `;
    }
    if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
      return `
              <div style="margin-bottom: 25px;">
                <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Experience</div>
                ${form.employment.map((job, idx) => `
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px;">
                      <div style="font-size: 13px; font-weight: 700; color: #000;">${job.jobTitle}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <div style="font-size: 11px; font-weight: 600; color: #d4a373;">${job.company}</div>
                      <div style="font-size: 10px; color: #666; display: flex; align-items: center; gap: 8px;">
                        <span>📅 ${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</span>
                        ${job.location ? `<span>📍 ${job.location}</span>` : ''}
                      </div>
                    </div>
                    ${job.desc ? `
                      <div style="font-size: 10px; color: #444; line-height: 1.6; margin-left: 0px;">
                        ${job.desc.split('\n').filter(line => line.trim()).map(line => `
                          <div style="margin-bottom: 4px; display: flex; gap: 8px;">
                            <span style="color: #d4a373;">•</span>
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
    if (section === 'projects' && form.projects && form.projects[0].name) {
      return `
              <div style="margin-bottom: 25px;">
                <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Projects</div>
                ${form.projects.map(proj => `
                  <div style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                      <div style="font-size: 12.5px; font-weight: 700; color: #000;">${proj.name}</div>
                      <div style="font-size: 10px; color: #666;">${proj.date || ''}</div>
                    </div>
                    ${proj.desc ? `<div style="font-size: 10px; color: #444; line-height: 1.5; text-align: justify;">${proj.desc}</div>` : ''}
                  </div>
                `).join('')}
              </div>
            `;
    }
    return '';
  }).join('')}
        </div>

        <!-- Right Column (Sidebar - 35%) -->
        <div style="flex: 3.5;">
          ${sections.filter(s => ['skills', 'education', 'certifications'].includes(s)).map(section => {
    if (section === 'skills' && form.skills) {
      const skillsArray = Array.isArray(form.skills)
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
        : form.skills.split(',').map(s => s.trim()).filter(s => s);

      if (skillsArray.length > 0) {
        return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Skills</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; color: #444; font-size: 10.5px;">
                    ${skillsArray.map(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return `
                        <div style="border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; padding-top: 4px;">${skillName}</div>
                      `;
        }).join('')}
                  </div>
                </div>
              `;
      }
    }
    if (section === 'certifications' && form.certifications && form.certifications[0]) {
      return `
              <div style="margin-bottom: 30px;">
                <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Certification</div>
                ${form.certifications.map(cert => `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 700; color: #d4a373;">${cert}</div>
                    <div style="font-size: 9.5px; color: #666; margin-top: 2px;">A comprehensive certification in modern UX design principles.</div>
                  </div>
                `).join('')}
              </div>
            `;
    }
    if (section === 'education' && form.education && form.education[0].degree) {
      return `
              <div style="margin-bottom: 30px;">
                <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Education</div>
                ${form.education.map(edu => `
                  <div style="margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #000;">${edu.degree}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #d4a373; margin-top: 2px;">${edu.school}</div>
                    <div style="font-size: 9.5px; color: #888; margin-top: 4px; display: flex; justify-content: space-between;">
                      <span>📅 ${edu.start} - ${edu.end || 'Present'}</span>
                      <span>📍 ${edu.location || ''}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
    }
    return '';
  }).join('')}
          
          <!-- Custom Sections in Sidebar if specifically aimed there, or just follow order -->
          ${sections.filter(s => !['summary', 'employment', 'projects', 'skills', 'education', 'certifications'].includes(s)).map(section => {
    const custom = customSections.find(cs => cs.key === section);
    if (custom) {
      const customData = form[custom.key];
      return `
                <div style="margin-bottom: 30px;">
                  <div style="font-size: 13px; font-weight: 700; color: #1a2a4e; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">${custom.label}</div>
                  <div style="font-size: 10px; color: #444;">
                    ${Array.isArray(customData) ? customData.map(entry => `
                      <div style="margin-bottom: 10px;">
                        <div style="font-weight: 700;">${entry.title || entry.name || ''}</div>
                        <div style="font-size: 9px; color: #666;">${entry.description || ''}</div>
                      </div>
                    `).join('') : customData}
                  </div>
                </div>
              `;
    }
    return '';
  }).join('')}
        </div>
      </div>
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
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      line-height: 1.5;
      padding: 40px;
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
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          line-height: 1.5;
          padding: 40px;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 10 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 10 }) }); } catch (_) { }

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

      // Top Section: Name and Photo
      const headerCells = [
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${form.firstName || 'AVA'} ${form.lastName || 'WILLIAMS'}`.toUpperCase(),
                  size: 36 * 2,
                  bold: true,
                  font: 'Inter',
                  color: '1a2a4e',
                }),
              ],
              spacing: { after: 120 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: form.tagline || 'Senior UX/UI Designer | User Research | Web Prototyping',
                  size: 16 * 2,
                  bold: true,
                  color: 'd4a373',
                  font: 'Inter',
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                form.email ? new TextRun({ text: `✉ ${form.email}   `, size: 10 * 2, color: '666666', font: 'Inter' }) : null,
                form.linkedin ? new TextRun({ text: `🔗 ${form.linkedin}   `, size: 10 * 2, color: '666666', font: 'Inter' }) : null,
                form.city || form.country ? new TextRun({ text: `📍 ${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}`, size: 10 * 2, font: 'Inter', color: '666666' }) : null,
              ].filter(Boolean),
            }),
          ],
          width: { size: 75, type: WidthType.PERCENTAGE },
          borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE },
        }),
      ];

      if (form.profileImage) {
        try {
          const imageBuffer = await fetch(form.profileImage).then(r => r.arrayBuffer());
          headerCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageBuffer,
                      transformation: { width: 90, height: 90 },
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              width: { size: 25, type: WidthType.PERCENTAGE },
              borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE },
            })
          );
        } catch (e) { console.error("Image fetch error:", e); }
      }

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE, insideHorizontal: BorderStyle.NONE, insideVertical: BorderStyle.NONE },
          rows: [new TableRow({ children: headerCells })],
        })
      );

      children.push(new Paragraph({ spacing: { after: 400 } }));

      // Main Content Table (65/35)
      const leftColumnContent = [];
      const rightColumnContent = [];

      // Helper for Section Titles
      const createGoldSectionTitle = (text) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: text.toUpperCase(),
              size: 13 * 2,
              bold: true,
              color: '1a2a4e',
              font: 'Inter',
            }),
          ],
          spacing: { before: 200, after: 150 },
          border: { bottom: { color: 'EEEEEE', space: 4, style: BorderStyle.SINGLE, size: 12 } },
        });
      };

      // Process LEFT column
      sections.filter(s => ['summary', 'employment', 'projects'].includes(s)).forEach(section => {
        if (section === 'summary' && form.summary) {
          leftColumnContent.push(createGoldSectionTitle('Summary'));
          leftColumnContent.push(new Paragraph({
            children: [new TextRun({ text: form.summary, size: 10.5 * 2, font: 'Inter', color: '444444' })],
            spacing: { after: 250, line: 360 },
            alignment: AlignmentType.JUSTIFY,
          }));
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          leftColumnContent.push(createGoldSectionTitle('Experience'));
          form.employment.forEach(job => {
            leftColumnContent.push(new Paragraph({
              children: [new TextRun({ text: job.jobTitle, size: 13 * 2, bold: true, font: 'Inter', color: '000000' })],
              spacing: { after: 40 },
            }));
            leftColumnContent.push(new Paragraph({
              children: [
                new TextRun({ text: job.company, size: 11 * 2, bold: true, color: 'd4a373', font: 'Inter' }),
                new TextRun({ text: '\t' + `📅 ${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`, size: 10 * 2, font: 'Inter', color: '666666' }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: 7500 }],
              spacing: { after: 120 },
            }));
            if (job.desc) {
              job.desc.split('\n').filter(line => line.trim()).forEach(line => {
                leftColumnContent.push(new Paragraph({
                  children: [
                    new TextRun({ text: '• ', size: 10 * 2, color: 'd4a373' }),
                    new TextRun({ text: line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim(), size: 10 * 2, font: 'Inter', color: '444444' }),
                  ],
                  spacing: { after: 60 },
                  indent: { left: 240 },
                }));
              });
            }
            leftColumnContent.push(new Paragraph({ spacing: { after: 200 } }));
          });
        }

        if (section === 'projects' && form.projects && form.projects[0].name) {
          leftColumnContent.push(createGoldSectionTitle('Projects'));
          form.projects.forEach(proj => {
            leftColumnContent.push(new Paragraph({
              children: [
                new TextRun({ text: proj.name, size: 12.5 * 2, bold: true, font: 'Inter', color: '000000' }),
                new TextRun({ text: '\t' + (proj.date || ''), size: 10 * 2, font: 'Inter', color: '666666' }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: 7500 }],
              spacing: { after: 100 },
            }));
            if (proj.desc) {
              leftColumnContent.push(new Paragraph({
                children: [new TextRun({ text: proj.desc, size: 10 * 2, font: 'Inter', color: '444444' })],
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFY,
              }));
            }
          });
        }
      });

      // Process RIGHT column
      sections.filter(s => ['skills', 'education', 'certifications'].includes(s)).forEach(section => {
        if (section === 'skills' && form.skills) {
          const skillsArray = Array.isArray(form.skills)
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
            : form.skills.split(',').map(s => s.trim()).filter(s => s);

          if (skillsArray.length > 0) {
            rightColumnContent.push(createGoldSectionTitle('Skills'));

            const skillRows = [];
            for (let i = 0; i < skillsArray.length; i += 2) {
              const s1 = typeof skillsArray[i] === 'string' ? skillsArray[i] : skillsArray[i].name;
              const s2 = skillsArray[i + 1] ? (typeof skillsArray[i + 1] === 'string' ? skillsArray[i + 1] : skillsArray[i + 1].name) : null;

              skillRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: s1, size: 10 * 2, font: 'Inter', color: '444444' })],
                          spacing: { before: 100, after: 100 },
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { bottom: { color: 'F0F0F0', style: BorderStyle.SINGLE, size: 4 }, top: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [s2 ? new TextRun({ text: s2, size: 10 * 2, font: 'Inter', color: '444444' }) : null].filter(Boolean),
                          spacing: { before: 100, after: 100 },
                        }),
                      ],
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { bottom: { color: 'F0F0F0', style: BorderStyle.SINGLE, size: 4 }, top: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE },
                      margins: { left: 200 },
                    }),
                  ],
                })
              );
            }

            rightColumnContent.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE, insideHorizontal: BorderStyle.NONE, insideVertical: BorderStyle.NONE },
                rows: skillRows,
              })
            );
            rightColumnContent.push(new Paragraph({ spacing: { after: 200 } }));
          }
        }

        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          rightColumnContent.push(createGoldSectionTitle('Certification'));
          form.certifications.forEach(cert => {
            rightColumnContent.push(new Paragraph({
              children: [new TextRun({ text: cert, size: 11 * 2, bold: true, color: 'd4a373', font: 'Inter' })],
              spacing: { before: 100, after: 40 },
            }));
            rightColumnContent.push(new Paragraph({
              children: [new TextRun({ text: 'A comprehensive certification in modern UX design principles.', size: 9.5 * 2, color: '666666', font: 'Inter' })],
              spacing: { after: 200 },
            }));
          });
        }

        if (section === 'education' && form.education && form.education[0].degree) {
          rightColumnContent.push(createGoldSectionTitle('Education'));
          form.education.forEach(edu => {
            rightColumnContent.push(new Paragraph({
              children: [new TextRun({ text: edu.degree, size: 12 * 2, bold: true, color: '000000', font: 'Inter' })],
              spacing: { before: 150, after: 40 },
            }));
            rightColumnContent.push(new Paragraph({
              children: [new TextRun({ text: edu.school, size: 11 * 2, bold: true, color: 'd4a373', font: 'Inter' })],
              spacing: { after: 40 },
            }));
            rightColumnContent.push(new Paragraph({
              children: [
                new TextRun({ text: '📅 ', size: 10 * 2 }),
                new TextRun({ text: `${edu.start} - ${edu.end || 'Present'}`, size: 9.5 * 2, color: '888888', font: 'Inter' })
              ],
              spacing: { after: 150 },
            }));
          });
        }
      });

      // Custom Sections
      sections.filter(s => !['summary', 'employment', 'projects', 'skills', 'education', 'certifications'].includes(s)).forEach(section => {
        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          const customData = form[custom.key];
          rightColumnContent.push(createGoldSectionTitle(custom.label));
          if (Array.isArray(customData)) {
            customData.forEach(entry => {
              rightColumnContent.push(new Paragraph({
                children: [new TextRun({ text: entry.title || entry.name || '', size: 10 * 2, bold: true, font: 'Inter' })],
                spacing: { before: 100, after: 40 },
              }));
              if (entry.description) {
                rightColumnContent.push(new Paragraph({
                  children: [new TextRun({ text: entry.description, size: 9 * 2, color: '666666', font: 'Inter' })],
                  spacing: { after: 150 },
                }));
              }
            });
          } else {
            rightColumnContent.push(new Paragraph({
              children: [new TextRun({ text: form[custom.key] || '', size: 10 * 2, color: '444444', font: 'Inter' })],
              spacing: { after: 200 },
            }));
          }
        }
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: BorderStyle.NONE, bottom: BorderStyle.NONE, left: BorderStyle.NONE, right: BorderStyle.NONE, insideHorizontal: BorderStyle.NONE, insideVertical: BorderStyle.NONE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: leftColumnContent, width: { size: 65, type: WidthType.PERCENTAGE }, margins: { right: 400 } }),
                new TableCell({ children: rightColumnContent, width: { size: 35, type: WidthType.PERCENTAGE } }),
              ],
            }),
          ],
        })
      );

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
  @media(max - width: 1200px) {
            .rb - two - col {
      gap: 20px!important;
      padding: 0 20px!important;
    }
            .rb - preview - col {
      flex: 1!important;
      min - width: 600px!important;
    }
  }

  @media(max - width: 1024px) {
            .rb - two - col {
      flex - direction: column!important;
      gap: 24px!important;
      padding: 0 16px!important;
    }
            .rb - form - col {
      width: 100 % !important;
      order: 1;
      min - width: 0!important;
    }
            .rb - preview - col {
      width: 100 % !important;
      min - width: 100 % !important;
      order: 2;
    }
            .rb - preview - wrapper {
      height: 600px!important;
    }
  }

  @media(max - width: 768px) {
            .rb - two - col {
      padding: 0 12px!important;
      gap: 20px!important;
    }
            .rb - preview - col {
      min - width: 100 % !important;
    }
            .rb - preview - wrapper {
      height: 500px!important;
    }
            .rb - preview - scale {
      transform: scale(0.8)!important;
    }
  }

  @media(max - width: 640px) {
            .rb - two - col {
      padding: 0 8px!important;
      gap: 16px!important;
    }
            .rb - form - col {
      width: 100 % !important;
      min - width: 0!important;
    }
            .rb - form - col > div {
      padding: 20px!important;
    }
            .rb - preview - wrapper {
      height: 400px!important;
    }
            .rb - preview - scale {
      transform: scale(0.7)!important;
    }
  }

  @media(max - width: 480px) {
            .rb - two - col {
      padding: 0 4px!important;
      gap: 12px!important;
    }
            .rb - form - col {
      width: 100 % !important;
      min - width: 0!important;
    }
            .rb - preview - wrapper {
      height: 350px!important;
    }
            .rb - preview - scale {
      transform: scale(0.6)!important;
    }
  }

  /* Hide preview on very small screens but keep download buttons accessible */
  @media(max - width: 480px) {
            .rb - preview - col {
      display: none!important;
    }
            .rb - two - col {
      gap: 0!important;
    }
  }

  /* Download section responsiveness */
  @media(max - width: 768px) {
            .rb - download - section {
      padding: 20px!important;
      margin: 32px 16px 24px 16px!important;
    }
            .rb - download - section > div: first - child > div: first - child {
      font - size: 18px!important;
    }
            .rb - download - section > div: first - child > div: last - child {
      font - size: 13px!important;
    }
  }

  @media(max - width: 480px) {
            .rb - download - section {
      padding: 16px!important;
      margin: 24px 8px 20px 8px!important;
      border - radius: 12px!important;
    }
            .rb - download - section > div: first - child > div: first - child {
      font - size: 16px!important;
    }
            .rb - download - section > div: first - child > div: last - child {
      font - size: 12px!important;
    }
            .rb - download - section button {
      padding: 14px 24px!important;
      font - size: 15px!important;
      min - width: 140px!important;
    }
  }

  /* Topbar responsiveness */
  @media(max - width: 1023px) {
            .rb - topbar {
      height: auto!important;
      padding: 8px 16px!important;
      gap: 8px!important;
      flex - wrap: wrap!important;
    }
            .rb - progress - percent {
      font - size: 14px!important;
      margin - right: 8px!important;
    }
            .rb - progress - wrap {
      flex: 1 1 100 % !important;
      height: 6px!important;
      margin - right: 0!important;
      order: 3;
    }
            .rb - step - text {
      font - size: 13px!important;
      margin - right: 8px!important;
      order: 2;
    }
            .rb - change - template - btn {
      padding: 8px 14px!important;
      font - size: 13px!important;
      order: 1;
    }
  }

  @media(max - width: 640px) {
            .rb - topbar {
      padding: 8px 12px!important;
    }
            .rb - change - template - btn {
      width: 100 % !important;
      text - align: center!important;
      order: 4;
    }
  }
  `}</style>
        <div style={{ maxWidth: 1800, margin: "0 auto", flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
          {/* Progress Bar */}
          <div className="rb-topbar" style={{ height: 48, background: "#fff", borderBottom: "1.5px solid #E3E8F0", display: "flex", alignItems: "center", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
            <div className="rb-progress-percent" style={{ fontWeight: 700, color: "#F36", fontSize: 16, marginRight: 18 }}>{progress}%</div>
            <div className="rb-progress-wrap" style={{ flex: 1, height: 6, background: "#F3E6E6", borderRadius: 4, overflow: "hidden", marginRight: 18 }}>
              <div className="rb-progress-fill" style={{ width: `${progress}% `, height: "100%", background: "#F36", borderRadius: 4, transition: "width 0.3s" }} />
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
                templateId="template-10"
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
                      fontFamily: "'Inter', sans-serif",
                      color: "#333",
                      background: '#fff',
                      fontSize: 11,
                      lineHeight: 1.5,
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
