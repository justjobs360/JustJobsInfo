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
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun, VerticalAlign, ShadingType, HeightRule, TextAlignment, SectionType } from 'docx';

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



  // Resume preview content (WYSIWYG) - Template 11: Sebastian Wilder (Yellow Header)
  const previewHtml = `
    <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; min-height: 1040px; font-size: 11px; line-height: 1.4; background: #fff;">
      
      <!-- Header Section: Yellow Block and Photo -->
      <div style="display: flex; height: 140px; margin-bottom: 20px;">
        <div style="width: 140px; height: 140px; background: #eee; flex-shrink: 0;">
          ${form.profileImage ? `
            <img src="${form.profileImage}" style="width: 100%; height: 100%; object-fit: cover;" />
          ` : `
            <div style="width: 100%; height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          `}
        </div>
        <div style="flex: 1; background: #fee21e; padding: 20px 30px; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 34px; font-weight: 850; color: #000; text-transform: uppercase; letter-spacing: 0.5px; line-height: 0.9; margin-bottom: 8px;">
            ${form.firstName || 'SEBASTIAN'}<br/>${form.lastName || 'WILDER'}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #000; opacity: 1;">
            ${form.tagline || ''}
          </div>
        </div>
      </div>

      <div style="padding: 0 40px 40px 40px;">
        <!-- Details Section -->
        <div style="margin-bottom: 20px; padding: 0 5px;">
          <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;">Details</div>
          <div style="color: #444; font-size: 11px; line-height: 1.6;">
            ${form.address ? `<div>${form.address}</div>` : ''}
            <div>${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}${form.postalCode ? `, ${form.postalCode}` : ''}</div>
            ${form.email ? `<div style="color: #000; font-weight: 600;">${form.email}</div>` : ''}
            ${form.phone ? `<div>${form.phone}</div>` : ''}
          </div>
        </div>

        <!-- Profile / Summary -->
        ${form.summary ? `
          <div style="margin-bottom: 15px; padding: 0 5px;">
            <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;">Profile</div>
            <div style="font-size: 11px; color: #444; line-height: 1.5; text-align: justify; letter-spacing: 0.1px;">${form.summary}</div>
          </div>
        ` : ''}

        ${sections.map(section => {
    if (section === 'education' && form.education && form.education[0].school) {
      return `
              <div style="margin-bottom: 15px; padding: 0 5px;">
                <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Education</div>
                ${form.education.map(edu => `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; font-weight: 800; color: #000; margin-bottom: 3px;">${edu.degree ? edu.degree + ', ' : ''}${edu.school}, ${edu.location || ''}</div>
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 5px; font-weight: 600; letter-spacing: 0.5px;">${edu.start} — ${edu.end || 'Present'}</div>
                    ${edu.desc ? `
                      <div style="font-size: 11px; color: #444; margin-left: 15px; display: flex; gap: 8px;">
                        <span style="color: #000;">•</span>
                        <span>${edu.desc}</span>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>
            `;
    }
    if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
      return `
              <div style="margin-bottom: 15px; padding: 0 5px;">
                <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Employment History</div>
                ${form.employment.map(job => `
                  <div style="margin-bottom: 15px;">
                    <div style="font-size: 12px; font-weight: 800; color: #000; margin-bottom: 3px;">${job.jobTitle}, ${job.company}, ${job.location || ''}</div>
                    <div style="font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px; font-weight: 600; letter-spacing: 0.5px;">${job.start} — ${job.end || 'Present'}</div>
                    ${job.desc ? `
                      <div style="font-size: 11px; color: #444; line-height: 1.5;">
                        ${job.desc.split('\n').filter(line => line.trim()).map(line => `
                          <div style="margin-bottom: 3px; display: flex; gap: 8px; align-items: flex-start;">
                            <span style="color: #000; flex-shrink: 0;">•</span>
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
    if (section === 'skills' && form.skills) {
      const skillsArray = Array.isArray(form.skills)
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
        : form.skills.split(',').map(s => s.trim()).filter(s => s);

      if (skillsArray.length > 0) {
        return `
                <div style="margin-bottom: 15px; padding: 0 5px;">
                  <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Skills</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; column-gap: 40px; color: #000; font-size: 11px; font-weight: 700;">
                    ${skillsArray.map(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return `<div style="border-bottom: 3.5px solid #000; padding: 6px 0 3px 0;">${skillName}</div>`;
        }).join('')}
                  </div>
                </div>
              `;
      }
    }
    if (section === 'languages' && form.languages) {
      const langs = Array.isArray(form.languages) ? form.languages : [];
      if (langs.length > 0) {
        return `
                <div style="margin-bottom: 15px; padding: 0 5px;">
                  <div style="display: inline-block; background: #000; color: #fff; padding: 3px 9px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Languages</div>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; row-gap: 12px; column-gap: 40px;">
                    ${langs.map(l => `
                      <div>
                        <div style="font-size: 11px; font-weight: 700; margin-bottom: 5px;">${l.name}</div>
                        <div style="height: 5px; background: #f0f0f0; width: 100%;">
                          <div style="height: 100%; background: #000; width: ${l.level === 'Native' ? '100%' : l.level === 'Professional' ? '80%' : l.level === 'Intermediate' ? '60%' : '40%'}"></div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `;
      }
    }
    return '';
  }).join('')}
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
      line-height: 1.4;
      padding: 0;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT - 45; // Account for bottom padding + buffer
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
          min-height: ${A4_HEIGHT}px;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          padding: 40px 40px;
          box-sizing: border-box;
          background: #fff;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 11 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 11 }) }); } catch (_) { }

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
  // Helper for circular image processing
  const getCircularImage = async (url, size) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();

        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;
        if (aspectRatio > 1) {
          drawHeight = size;
          drawWidth = size * aspectRatio;
          offsetX = -(drawWidth - size) / 2;
          offsetY = 0;
        } else {
          drawWidth = size;
          drawHeight = size / aspectRatio;
          offsetX = 0;
          offsetY = -(drawHeight - size) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        canvas.toBlob((blob) => {
          if (blob) blob.arrayBuffer().then(resolve);
          else reject(new Error('Canvas toBlob failed'));
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  };

  async function handleDownloadDOCX() {
    try {
      const children = [];

      // --- Header Section: Table for Profile Image and Yellow Name Block ---
      const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            height: { value: 140 * 15, rule: HeightRule.EXACT }, // Reduced from 160px
            children: [
              // Profile Image Cell
              new TableCell({
                width: { size: 140 * 15, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: 'EEEEEE', type: ShadingType.CLEAR },
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [
                  form.profileImage ? new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        data: await getCircularImage(form.profileImage, 320),
                        transformation: { width: 140, height: 140 },
                      }),
                    ],
                  }) : new Paragraph({}),
                ],
              }),
              // Name and Tagline Cell (Yellow Background)
              new TableCell({
                width: { size: (A4_WIDTH - 140) * 15, type: WidthType.DXA },
                verticalAlign: VerticalAlign.CENTER,
                shading: { fill: 'FEE21E', type: ShadingType.CLEAR },
                margins: { left: 400, right: 400 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: (form.firstName || 'SEBASTIAN').toUpperCase(),
                        size: 30 * 2,
                        bold: true,
                        font: 'Inter',
                      }),
                      new TextRun({ break: 1 }),
                      new TextRun({
                        text: (form.lastName || 'WILDER').toUpperCase(),
                        size: 30 * 2,
                        bold: true,
                        font: 'Inter',
                      }),
                    ],
                    spacing: { after: 100, line: 550, lineRule: HeightRule.EXACT },
                  }),
                  form.tagline ? new Paragraph({
                    children: [
                      new TextRun({
                        text: form.tagline.toUpperCase(),
                        size: 11 * 2,
                        bold: true,
                        font: 'Inter',
                        color: '000000',
                      }),
                    ],
                  }) : new Paragraph({}),
                ],
              }),
            ],
          }),
        ],
      });
      children.push(headerTable);

      // --- Body Indentation Constant (Twips) ---
      const BODY_MARGIN = 720; // 0.5 inch

      // --- Helper to create labeled section titles ---
      const createSectionTitle = (text) => {
        return new Paragraph({
          shading: { fill: '000000', type: ShadingType.CLEAR },
          children: [
            new TextRun({ text: ` ${text.toUpperCase()} `, size: 11 * 2, bold: true, color: 'FFFFFF', font: 'Inter' }),
          ],
          spacing: { before: 150, after: 120 },
          indent: { left: BODY_MARGIN, right: BODY_MARGIN },
        });
      };

      // --- Details Section ---
      children.push(createSectionTitle('Details'));

      const contactData = [];
      if (form.address) contactData.push(form.address);
      if (form.city || form.country) contactData.push(`${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}${form.postalCode ? `, ${form.postalCode}` : ''}`);
      if (form.email) contactData.push(form.email);
      if (form.phone) contactData.push(form.phone);

      contactData.forEach(text => {
        children.push(new Paragraph({
          children: [new TextRun({ text, size: 11 * 2, font: 'Inter', color: '444444', bold: text === form.email })],
          spacing: { after: 50 },
          indent: { left: BODY_MARGIN, right: BODY_MARGIN },
        }));
      });
      children.push(new Paragraph({ spacing: { after: 250 }, indent: { left: BODY_MARGIN } }));

      // --- Profile / Summary Section ---
      if (form.summary) {
        children.push(createSectionTitle('Profile'));
        children.push(new Paragraph({
          children: [new TextRun({ text: form.summary, size: 11 * 2, font: 'Inter', color: '444444' })],
          spacing: { after: 250 },
          alignment: AlignmentType.BOTH,
          indent: { left: BODY_MARGIN, right: BODY_MARGIN },
        }));
      }

      // --- Main Sections ---
      sections.forEach(section => {
        if (section === 'education' && form.education && form.education[0].school) {
          children.push(createSectionTitle('Education'));

          form.education.forEach(edu => {
            children.push(new Paragraph({
              children: [new TextRun({ text: `${edu.degree ? edu.degree + ', ' : ''}${edu.school}, ${edu.location || ''}`, size: 12 * 2, bold: true, font: 'Inter' })],
              spacing: { after: 50 },
              indent: { left: BODY_MARGIN, right: BODY_MARGIN },
            }));
            children.push(new Paragraph({
              children: [new TextRun({ text: `${edu.start} — ${edu.end || 'Present'}`, size: 10 * 2, font: 'Inter', color: '888888', allCaps: true, bold: true })],
              spacing: { after: 100 },
              indent: { left: BODY_MARGIN, right: BODY_MARGIN },
            }));
            if (edu.desc) {
              children.push(new Paragraph({
                children: [
                  new TextRun({ text: '• ', size: 11 * 2, font: 'Inter', color: '000000' }),
                  new TextRun({ text: edu.desc, size: 11 * 2, font: 'Inter', color: '444444' }),
                ],
                spacing: { after: 120 },
                indent: { left: BODY_MARGIN + 240, right: BODY_MARGIN },
              }));
            }
          });
          children.push(new Paragraph({ spacing: { after: 150 }, indent: { left: BODY_MARGIN } }));
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          children.push(createSectionTitle('Employment History'));

          form.employment.forEach(job => {
            children.push(new Paragraph({
              children: [new TextRun({ text: `${job.jobTitle}, ${job.company}, ${job.location || ''}`, size: 12 * 2, bold: true, font: 'Inter' })],
              spacing: { after: 50 },
              indent: { left: BODY_MARGIN, right: BODY_MARGIN },
            }));
            children.push(new Paragraph({
              children: [new TextRun({ text: `${job.start} — ${job.end || 'Present'}`, size: 10 * 2, font: 'Inter', color: '888888', allCaps: true, bold: true })],
              spacing: { after: 100 },
              indent: { left: BODY_MARGIN, right: BODY_MARGIN },
            }));
            if (job.desc) {
              job.desc.split('\n').filter(line => line.trim()).forEach(line => {
                children.push(new Paragraph({
                  children: [
                    new TextRun({ text: '• ', size: 11 * 2, font: 'Inter', color: '000000' }),
                    new TextRun({ text: line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim(), size: 11 * 2, font: 'Inter', color: '444444' }),
                  ],
                  spacing: { after: 50 },
                  indent: { left: BODY_MARGIN + 240, right: BODY_MARGIN },
                }));
              });
              children.push(new Paragraph({ spacing: { after: 100 }, indent: { left: BODY_MARGIN } }));
            }
          });
        }

        if (section === 'skills' && form.skills) {
          const skillsArray = Array.isArray(form.skills)
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
            : form.skills.split(',').map(s => s.trim()).filter(s => s);

          if (skillsArray.length > 0) {
            children.push(createSectionTitle('Skills'));

            const skillRows = [];
            for (let i = 0; i < skillsArray.length; i += 2) {
              const skill1 = typeof skillsArray[i] === 'string' ? skillsArray[i] : skillsArray[i].name;
              const skill2 = (i + 1 < skillsArray.length) ? (typeof skillsArray[i + 1] === 'string' ? skillsArray[i + 1] : skillsArray[i + 1].name) : '';

              skillRows.push(new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { style: BorderStyle.SINGLE, size: 28, color: '000000' },
                      top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                    },
                    children: [new Paragraph({ children: [new TextRun({ text: skill1, size: 11 * 2, font: 'Inter', bold: true })], spacing: { after: 100, before: 120 } })],
                  }),
                  new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, children: [] }),
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { style: BorderStyle.SINGLE, size: 28, color: '000000' },
                      top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                    },
                    children: [skill2 ? new Paragraph({ children: [new TextRun({ text: skill2, size: 11 * 2, font: 'Inter', bold: true })], spacing: { after: 100, before: 120 } }) : new Paragraph({})],
                  }),
                ],
              }));
            }

            children.push(new Table({
              width: { size: 82, type: WidthType.PERCENTAGE }, // Simulates margins (100 - (7.5*2) = ~85, but with Word's oddities, 82 is safer)
              alignment: AlignmentType.CENTER,
              borders: {
                insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              rows: skillRows,
            }));
            children.push(new Paragraph({ spacing: { after: 250 }, indent: { left: BODY_MARGIN } }));
          }
        }

        if (section === 'languages' && form.languages && form.languages.length > 0) {
          children.push(createSectionTitle('Languages'));

          const langRows = [];
          for (let i = 0; i < form.languages.length; i += 2) {
            const l1 = form.languages[i];
            const l2 = form.languages[i + 1];

            const createLangCell = (l) => {
              if (!l) return new TableCell({ children: [] });
              const width = l.level === 'Native' ? 100 : l.level === 'Professional' ? 80 : l.level === 'Intermediate' ? 60 : 40;
              return new TableCell({
                width: { size: 45, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({ children: [new TextRun({ text: l.name, size: 11 * 2, font: 'Inter', bold: true })], spacing: { after: 80 } }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
                      top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            width: { size: width, type: WidthType.PERCENTAGE },
                            shading: { fill: '000000', type: ShadingType.CLEAR },
                            children: [],
                            height: { value: 80, rule: HeightRule.EXACT },
                          }),
                          new TableCell({
                            width: { size: 100 - width, type: WidthType.PERCENTAGE },
                            shading: { fill: 'F0F0F0', type: ShadingType.CLEAR },
                            children: [],
                            height: { value: 80, rule: HeightRule.EXACT },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
                margins: { bottom: 200 },
              });
            };

            langRows.push(new TableRow({ children: [createLangCell(l1), new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [] }), createLangCell(l2)] }));
          }

          children.push(new Table({
            width: { size: 82, type: WidthType.PERCENTAGE },
            alignment: AlignmentType.CENTER,
            borders: {
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            },
            rows: langRows,
          }));
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 0, right: 0, bottom: 720, left: 0 },
              },
            },
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      return blob;
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Error generating DOCX file. Please try again.');
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
                templateId="template-11"
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
