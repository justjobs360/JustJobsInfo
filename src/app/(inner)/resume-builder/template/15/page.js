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
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, VerticalAlign, ImageRun } from 'docx';

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



  // Resume preview content (WYSIWYG) - Modern Creative Template
  const previewHtml = `
    <div style="position: relative; padding: 40px 40px 40px 60px; font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; min-height: 1040px; font-size: 11px; line-height: 1.5; background: #fff;">
      
      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
        <div style="flex: 1;">
          <h1 style="font-size: 32px; font-weight: 800; margin: 0; color: #000; letter-spacing: -0.5px; line-height: 1.1;">
            ${form.firstName || ''} ${form.lastName || ''}
          </h1>
          <div style="font-size: 18px; font-weight: 500; color: #444; margin-top: 4px; font-style: italic;">
            ${form.tagline || ''}
          </div>
          
          <!-- Contact Info Row -->
          <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; color: #444; font-size: 10px;">
            ${form.email ? `
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                ${form.email}
              </div>
            ` : ''}
            ${form.phone ? `
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                ${form.phone}
              </div>
            ` : ''}
            ${form.city || form.country ? `
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}
              </div>
            ` : ''}
            ${form.instagram ? `
              <div style="display: flex; align-items: center; gap: 5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                ${form.instagram}
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Profile Image -->
        ${form.profileImage ? `
          <div style="width: 100px; height: 100px; border-radius: 4px; overflow: hidden; background: #eee; flex-shrink: 0; margin-left: 20px;">
            <img src="${form.profileImage}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : `
          <div style="width: 100px; height: 100px; border-radius: 4px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #ccc; flex-shrink: 0; margin-left: 20px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1B4332" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
        `}
      </div>
      
      ${sections.map(section => {
    if (section === 'summary' && form.summary) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 5px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Profile</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form.summary}</div>
            </div>
          `;
    }
    if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Professional Experience</h2>
              ${form.employment.map((job, idx) => `
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="font-size: 12px; font-weight: 700; color: #000;">${job.company}${job.jobTitle ? `, <span style="font-weight: 500; font-style: italic; color: #444;">${job.jobTitle}</span>` : ''}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #333; text-align: right;">${job.start}${job.start && job.end ? ' – ' : ''}${job.end}</div>
                  </div>
                  <div style="display: flex; justify-content: flex-end; margin-bottom: 3px;">
                    <div style="font-size: 10px; color: #666;">${job.location || ''}</div>
                  </div>
                  <div style="font-size: 11px; color: #444; line-height: 1.5; margin-top: 2px;">
                    ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; position: relative; padding-left: 15px;"><span style="position: absolute; left: 0;">•</span> ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
    }
    if (section === 'education' && form.education && form.education[0].degree) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Education</h2>
              ${form.education.map((edu, idx) => `
                <div style="margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="font-size: 12px; font-weight: 700; color: #000;">${edu.school}${edu.degree ? `, <span style="font-weight: 500; font-style: italic; color: #444;">${edu.degree}</span>` : ''}</div>
                    <div style="font-size: 11px; font-weight: 600; color: #333; text-align: right;">${edu.start}${edu.start && edu.end ? ' – ' : ''}${edu.end || ''}</div>
                  </div>
                  <div style="display: flex; justify-content: flex-end; margin-bottom: 3px;">
                    <div style="font-size: 10px; color: #666;">${edu.location || ''}</div>
                  </div>
                  <div style="font-size: 11px; color: #444; line-height: 1.5; margin-top: 2px;">
                    ${edu.desc ? edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; position: relative; padding-left: 15px;"><span style="position: absolute; left: 0;">•</span> ${line.trim()}</div>`).join('') : ''}
                  </div>
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
        const midIndex = Math.ceil(skillsArray.length / 2);
        const col1 = skillsArray.slice(0, midIndex);
        const col2 = skillsArray.slice(midIndex);

        return `
              <div style="margin-bottom: 20px;">
                <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Skills</h2>
                <div style="display: flex; gap: 40px; margin-top: 10px;">
                  <div style="flex: 1;">
                    ${col1.map(skill => {
          const name = typeof skill === 'string' ? skill : skill.name;
          const level = typeof skill === 'string' ? '' : (skill.level ? ` <span style="color: #666; font-size: 10px;">(${skill.level})</span>` : '');
          return `<div style="font-size: 11px; font-weight: 700; color: #000; margin-bottom: 5px;">${name}${level}</div>`;
        }).join('')}
                  </div>
                  <div style="flex: 1;">
                    ${col2.map(skill => {
          const name = typeof skill === 'string' ? skill : skill.name;
          const level = typeof skill === 'string' ? '' : (skill.level ? ` <span style="color: #666; font-size: 10px;">(${skill.level})</span>` : '');
          return `<div style="font-size: 11px; font-weight: 700; color: #000; margin-bottom: 5px;">${name}${level}</div>`;
        }).join('')}
                  </div>
                </div>
              </div>
            `;
      }
    }
    if (section === 'certifications' && form.certifications && form.certifications[0]) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Certificates</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6; margin-top: 5px;">
                ${form.certifications.map(cert => `<span style="margin-right: 15px;">• ${cert}</span>`).join(' ')}
              </div>
            </div>
          `;
    }
    if (section === 'languages' && form.languages && form.languages[0]) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">Languages</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6; margin-top: 5px;">
                ${form.languages.map(lang => {
        const name = typeof lang === 'string' ? lang : lang.name;
        const level = typeof lang === 'string' ? '' : (lang.level ? ` <span style="color: #666; font-size: 10px;">(${lang.level})</span>` : '');
        return `<span style="margin-right: 15px; font-weight: 700; color: #000;">${name}${level}</span>`;
      }).join(' ')}
              </div>
            </div>
          `;
    }
    // Handle other sections as generic text for now
    const custom = customSections.find(cs => cs.key === section);
    if (custom && form[custom.key]) {
      return `
            <div style="margin-bottom: 20px;">
              <h2 style="font-size: 16px; font-weight: 700; color: #000; margin-bottom: 8px; border-bottom: 2px solid #1B4332; padding-bottom: 3px; text-transform: none;">${custom.label}</h2>
              <div style="font-size: 11px; color: #333; line-height: 1.6; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form[custom.key]}</div>
            </div>
          `;
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
      font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      padding: 40px 40px 40px 60px;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #fff;
      color: #1a1a1a;
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
          font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          line-height: 1.5;
          padding: 40px 40px 40px 60px;
          box-sizing: border-box;
          background: #fff;
          color: #1a1a1a;
          position: relative;
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

    // Wrap each page content with the vertical bar
    const finalizedPages = pages.map(pageContent => `
      <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 15px; background: #1B4332; z-index: 10;"></div>
      ${pageContent}
    `);

    // Clean up
    document.body.removeChild(tempContainer);

    console.log('Pages created:', finalizedPages.length);
    return finalizedPages.length > 0 ? finalizedPages : [`<div style="position: absolute; left: 0; top: 0; bottom: 0; width: 15px; background: #1B4332; z-index: 10;"></div>${content}`];
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

      // Pre-fetch profile image if available
      let profileImage = null;
      if (form.profileImage) {
        try {
          const response = await fetch(form.profileImage);
          profileImage = await response.arrayBuffer();
        } catch (e) {
          console.error("Error fetching profile image for DOCX:", e);
        }
      }

      // Header Section
      if (form.firstName) {
        // Table for Header: Left (Name/Title), Right (Image)
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${form.firstName} ${form.lastName || ''}`,
                            size: 32 * 2,
                            bold: true,
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 120 },
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: form.tagline || '',
                            size: 18 * 2,
                            bold: false,
                            italics: true,
                            color: '444444',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 240 },
                      }),
                      // Contact Info Row
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: [
                              form.email,
                              form.phone,
                              form.city || form.country ? `${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}` : '',
                              form.instagram ? `@${form.instagram}` : ''
                            ].filter(Boolean).join('  •  '),
                            size: 10 * 2,
                            color: '444444',
                            font: 'Arial',
                          }),
                        ],
                        spacing: { after: 360 },
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        children: [
                          profileImage ? new ImageRun({
                            data: profileImage,
                            transformation: {
                              width: 80,
                              height: 80,
                            },
                          }) : new TextRun({
                            text: '[ Profile Image ]',
                            size: 10 * 2,
                            color: 'CCCCCC',
                          })
                        ],
                        alignment: AlignmentType.CENTER,
                      })
                    ],
                  }),
                ],
              }),
            ],
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
          })
        );
      }

      // Process sections
      sections.forEach(section => {
        if (section === 'summary' && form.summary) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Profile',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                }),
              ],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '1B4332', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: form.summary,
                  size: 11 * 2,
                  font: 'Arial',
                }),
              ],
              spacing: { after: 240 },
            })
          );
        }

        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Professional Experience',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                }),
              ],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '1B4332', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            })
          );

          form.employment.forEach(job => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: job.company || '', size: 12 * 2, bold: true, font: 'Arial' }),
                  new TextRun({ text: job.jobTitle ? `, ${job.jobTitle}` : '', size: 12 * 2, italics: true, font: 'Arial' }),
                  new TextRun({ text: '\t', size: 11 * 2 }),
                  new TextRun({ text: `${job.start || ''} – ${job.end || ''}`, size: 11 * 2, bold: true, font: 'Arial' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10000 }],
                spacing: { before: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: job.location || '', size: 10 * 2, color: '666666', font: 'Arial' }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60 },
              })
            );

            if (job.desc) {
              job.desc.split('\n').filter(line => line.trim()).forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: '• ', size: 11 * 2, font: 'Arial' }),
                      new TextRun({ text: line.trim(), size: 11 * 2, font: 'Arial' }),
                    ],
                    indent: { left: 240 },
                    spacing: { after: 40 },
                  })
                );
              });
            }
          });
        }

        if (section === 'education' && form.education && form.education[0].degree) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Education',
                  size: 16 * 2,
                  bold: true,
                  font: 'Arial',
                }),
              ],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '1B4332', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            })
          );

          form.education.forEach(edu => {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: edu.school || '', size: 12 * 2, bold: true, font: 'Arial' }),
                  new TextRun({ text: edu.degree ? `, ${edu.degree}` : '', size: 12 * 2, italics: true, font: 'Arial' }),
                  new TextRun({ text: '\t', size: 11 * 2 }),
                  new TextRun({ text: `${edu.start || ''} – ${edu.end || ''}`, size: 11 * 2, bold: true, font: 'Arial' }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: 10000 }],
                spacing: { before: 120 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: edu.location || '', size: 10 * 2, color: '666666', font: 'Arial' }),
                ],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60 },
              })
            );

            if (edu.desc) {
              edu.desc.split('\n').filter(line => line.trim()).forEach(line => {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({ text: '• ', size: 11 * 2, font: 'Arial' }),
                      new TextRun({ text: line.trim(), size: 11 * 2, font: 'Arial' }),
                    ],
                    indent: { left: 240 },
                    spacing: { after: 40 },
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
            children.push(
              new Paragraph({
                children: [new TextRun({ text: 'Skills', size: 16 * 2, bold: true, font: 'Arial' })],
                spacing: { before: 240, after: 120 },
                border: { bottom: { color: '1B4332', space: 1, style: BorderStyle.SINGLE, size: 2 } },
              })
            );

            const mid = Math.ceil(skillsArray.length / 2);
            const tableRows = [];
            for (let i = 0; i < mid; i++) {
              tableRows.push(
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                      children: [new Paragraph({ children: [new TextRun({ text: typeof skillsArray[i] === 'string' ? skillsArray[i] : skillsArray[i].name, size: 11 * 2, bold: true, font: 'Arial' })], spacing: { after: 60 } })],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                      children: [
                        skillsArray[i + mid] ? new Paragraph({ children: [new TextRun({ text: typeof skillsArray[i + mid] === 'string' ? skillsArray[i + mid] : skillsArray[i + mid].name, size: 11 * 2, bold: true, font: 'Arial' })], spacing: { after: 60 } }) : new Paragraph({}),
                      ],
                    }),
                  ],
                })
              );
            }
            children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows, borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } } }));
          }
        }

        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'Certificates', size: 16 * 2, bold: true, font: 'Arial' })],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '1B4332', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            }),
            new Paragraph({
              children: form.certifications.map(cert => new TextRun({ text: `• ${cert}    `, size: 11 * 2, font: 'Arial' })),
              spacing: { after: 120 },
            })
          );
        }

        if (section === 'languages' && form.languages && form.languages[0]) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: 'Languages', size: 16 * 2, bold: true, font: 'Arial' })],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            }),
            new Paragraph({
              children: form.languages.map(lang => new TextRun({ text: `• ${typeof lang === 'string' ? lang : lang.name}    `, size: 11 * 2, bold: true, font: 'Arial' })),
              spacing: { after: 120 },
            })
          );
        }
        // Handle other sections as generic text
        const custom = customSections.find(cs => cs.key === section);
        if (custom && form[custom.key]) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: custom.label, size: 16 * 2, bold: true, font: 'Arial' })],
              spacing: { before: 240, after: 120 },
              border: { bottom: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 2 } },
            }),
            new Paragraph({
              children: [new TextRun({ text: form[custom.key], size: 11 * 2, font: 'Arial' })],
              spacing: { after: 240 },
            })
          );
        }
      });

      const doc = new Document({
        sections: [{
          properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
          children: [
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 4, type: WidthType.PERCENTAGE }, // Narrow bar
                      shading: { fill: '1B4332' },
                      children: [new Paragraph({ children: [] })], // Ensure cell has a child
                    }),
                    new TableCell({
                      width: { size: 96, type: WidthType.PERCENTAGE },
                      margins: { top: 720, bottom: 720, left: 600, right: 720 },
                      children: children,
                    }),
                  ],
                }),
              ],
            })
          ],
        }],
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
                templateId="template-15"
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
                      fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
                      color: "#1a1a1a",
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
