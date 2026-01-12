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
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun, VerticalAlign, ShadingType, HeightRule } from 'docx';

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



  // Dynamic section numbering helper
  let sectionIdx = 0;
  const getSectionNum = () => ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'][sectionIdx++] || '';

  // Data helpers
  const hasProfile = !!form.summary;
  const skillList = (Array.isArray(form.skills) ? form.skills : (form.skills?.split(',') || [])).map(s => typeof s === 'string' ? { name: s.trim(), level: 5 } : s).filter(s => s.name);
  const langList = (form.languages || []).map(l => typeof l === 'string' ? { name: l.trim(), level: 'Intermediate' } : l).filter(l => l.name);
  const hasSkillsOrLangs = skillList.length > 0 || langList.length > 0;
  const hasEmployment = form.employment && form.employment[0]?.jobTitle;
  const hasEducation = form.education && form.education[0]?.degree;

  // Resume preview content (WYSIWYG) - Template 12: Jack Farrell (Classic Serif Style)
  const previewHtml = `
    <div style="padding: 30px 40px; font-family: 'Inter', sans-serif; color: #000; min-height: 1040px; font-size: 11px; line-height: 1.3; background: #fff;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .serif-font { font-family: 'Playfair Display', serif; }
        .section-number { font-size: 18px; vertical-align: middle; margin-right: 8px; font-weight: normal; }
        .section-title { font-size: 20px; font-weight: normal; display: flex; align-items: center; margin-bottom: 15px; border-bottom: none; }
        .dot { height: 7px; width: 7px; border-radius: 50%; display: inline-block; margin-right: 4px; border: 1px solid #000; }
        .dot-filled { background-color: #000; }
      </style>
      
      <!-- Top Header: Name and Profile Photo -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
        <div style="flex: 1;">
          <div class="serif-font" style="font-size: 40px; line-height: 1.1; margin-bottom: 10px; text-transform: uppercase;">
            ${(form.firstName || 'JACK').split(' ').map(n => `<div>${n}</div>`).join('')}
            ${form.lastName ? `<div>${form.lastName}</div>` : '<div>FARRELL</div>'}
          </div>
          <div style="font-size: 12px; color: #444; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${form.tagline || 'Warehouse Worker'}</div>
          <div style="display: flex; gap: 30px; font-size: 11px; color: #444;">
             <div>
               ${form.address ? `<div>${form.address}</div>` : ''}
               ${form.city || form.country ? `<div>${form.city}${form.city && form.country ? ', ' : ''}${form.country}</div>` : ''}
             </div>
             <div>
               ${form.phone ? `<div>${form.phone}</div>` : ''}
               ${form.email ? `<div>${form.email}</div>` : ''}
             </div>
          </div>
        </div>
        ${form.profileImage ? `
          <div style="width: 150px; height: 150px; margin-top: -5px;">
            <img src="${form.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        ` : ''}
      </div>

      <!-- Profile Section -->
      ${hasProfile ? `
        <div style="margin-bottom: 25px;">
          <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> PROFILE</div>
          <div style="font-size: 11px; color: #333; line-height: 1.5;">${form.summary}</div>
        </div>
      ` : ''}

      <!-- Grid for Skills and Languages -->
      ${hasSkillsOrLangs ? `
        <div style="display: flex; gap: 40px; margin-bottom: 25px;">
          <!-- Skills -->
          ${skillList.length > 0 ? `
            <div style="flex: 1;">
              <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> SKILLS</div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${skillList.map(skill => {
    const level = typeof skill.level === 'string' ? (skill.level === 'Expert' ? 5 : skill.level === 'Experienced' ? 4 : skill.level === 'Skillful' ? 3 : skill.level === 'Intermediate' ? 2 : 1) : skill.level;
    return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 11px;">${skill.name}</div>
                      <div style="display: flex;">
                        ${[1, 2, 3, 4, 5].map(i => `<span class="dot ${i <= level ? 'dot-filled' : ''}"></span>`).join('')}
                      </div>
                    </div>
                  `;
  }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Languages -->
          ${langList.length > 0 ? `
            <div style="flex: 1;">
              <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> LANGUAGES</div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${langList.map(lang => {
    const levelStr = lang.level || 'Intermediate';
    const level = levelStr === 'Native' ? 5 : levelStr === 'Professional' ? 4 : levelStr === 'Intermediate' ? 3 : 2;
    return `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div style="font-size: 11px;">${lang.name}</div>
                      <div style="display: flex;">
                        ${[1, 2, 3, 4, 5].map(i => `<span class="dot ${i <= level ? 'dot-filled' : ''}"></span>`).join('')}
                      </div>
                    </div>
                  `;
  }).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Employment History Section -->
      ${hasEmployment ? `
        <div style="margin-bottom: 30px;">
          <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> EMPLOYMENT HISTORY</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            ${form.employment.map(job => `
              <div>
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${job.jobTitle}</div>
                <div style="font-size: 12px; color: #444; margin-bottom: 8px;">${job.company}${job.location ? ', ' + job.location : ''}</div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 10px; text-transform: uppercase;">${job.start} — ${job.end || 'Present'}</div>
                <div style="font-size: 11px; color: #444; line-height: 1.6;">
                  ${job.desc ? job.desc.split('\n').filter(l => l.trim()).map(l => `<div style="margin-bottom: 4px; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${l.trim()}</div>`).join('') : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Education Section (if exists) -->
      ${hasEducation ? `
        <div style="margin-bottom: 30px;">
          <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> EDUCATION</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            ${form.education.map(edu => `
              <div>
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${edu.degree}</div>
                <div style="font-size: 12px; color: #444; margin-bottom: 8px;">${edu.school}${edu.location ? ', ' + edu.location : ''}</div>
                <div style="font-size: 11px; font-weight: 600; color: #666; margin-bottom: 10px; text-transform: uppercase;">${edu.start} — ${edu.end || 'Present'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Custom Sections -->
      ${customSections.map(custom => {
    const customData = form[custom.key];
    if (!customData || (Array.isArray(customData) && customData.length === 0)) return '';
    return `
          <div style="margin-bottom: 30px;">
            <div class="section-title serif-font"><span class="section-number">${getSectionNum()}</span> ${custom.label.toUpperCase()}</div>
            <div style="font-size: 11px; color: #444; line-height: 1.6;">
              ${Array.isArray(customData) ? customData.map(entry => `
                <div style="margin-bottom: 10px;">
                  <div style="font-size: 12px; font-weight: 600;">${entry.title || entry.name || ''}</div>
                  <div style="font-size: 11px;">${entry.description || ''}</div>
                </div>
              `).join('') : `<div>${customData}</div>`}
            </div>
          </div>
        `;
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
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      line-height: 1.3;
      padding: 30px 40px;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT - 20; // Small buffer
    const totalHeight = tempContainer.offsetHeight;

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
          line-height: 1.3;
          padding: 30px 40px;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 12 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 12 }) }); } catch (_) { }

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
  // DOCX download handler - REDESIGNED
  async function handleDownloadDOCX() {
    try {
      // Create document sections
      const children = [];

      // HELPER: Create Section Title
      const createSectionTitle = (number, title) => {
        return new Paragraph({
          children: [
            new TextRun({ text: number, size: 18 * 2, font: 'Times New Roman' }),
            new TextRun({ text: ` ${title}`, size: 16 * 2, font: 'Times New Roman', bold: true }),
          ],
          spacing: { before: 300, after: 150 },
          keepWithNext: true,
        });
      };

      // HELPER: Create dot indicators
      const createDots = (level) => {
        const dots = [];
        for (let i = 1; i <= 5; i++) {
          dots.push(new TextRun({
            text: i <= level ? '●' : '○',
            size: 8 * 2,
            font: 'Arial',
          }));
        }
        return dots;
      };

      // Dynamic numbering for DOCX
      let docxSectionIdx = 0;
      const getDocxSectionNum = () => ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'][docxSectionIdx++] || '';

      // 1. Header: Name and Photo
      const headerCells = [];
      const nameLines = [];
      const fullName = (form.firstName || 'JACK') + ' ' + (form.lastName || 'FARRELL');
      fullName.split(' ').forEach(part => {
        nameLines.push(new Paragraph({
          children: [new TextRun({ text: part.toUpperCase(), size: 32 * 2, font: 'Times New Roman', bold: true })],
          spacing: { line: 240 },
        }));
      });

      // Name and Contact info cell
      const infoChildren = [...nameLines];
      infoChildren.push(new Paragraph({
        children: [new TextRun({ text: form.tagline || 'Warehouse Worker', size: 12 * 2, bold: true, color: '444444' })],
        spacing: { before: 200, after: 100 },
      }));

      const contactLine1 = [];
      if (form.address) contactLine1.push(form.address);
      if (form.city || form.country) contactLine1.push(`${form.city}${form.city && form.country ? ', ' : ''}${form.country}`);

      const contactLine2 = [];
      if (form.phone) contactLine2.push(form.phone);
      if (form.email) contactLine2.push(form.email);

      if (contactLine1.length > 0) {
        infoChildren.push(new Paragraph({
          children: [new TextRun({ text: contactLine1.join(', '), size: 10 * 2, color: '444444' })],
          spacing: { line: 240 },
        }));
      }
      if (contactLine2.length > 0) {
        infoChildren.push(new Paragraph({
          children: [new TextRun({ text: contactLine2.join(' | '), size: 10 * 2, color: '444444' })],
          spacing: { line: 240 },
        }));
      }

      headerCells.push(new TableCell({
        children: infoChildren,
        width: { size: 70, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
      }));

      // Photo cell
      const photoChildren = [];
      if (form.profileImage) {
        try {
          const response = await fetch(form.profileImage);
          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();
          photoChildren.push(new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                transformation: { width: 150, height: 150 },
              }),
            ],
            alignment: AlignmentType.RIGHT,
          }));
        } catch (e) { console.error('Image load error', e); }
      }

      headerCells.push(new TableCell({
        children: photoChildren,
        width: { size: 30, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.TOP,
        borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
      }));

      children.push(new Table({
        rows: [new TableRow({ children: headerCells })],
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
        }
      }));

      // 2. Profile
      if (form.summary) {
        children.push(createSectionTitle(getDocxSectionNum(), 'PROFILE'));
        children.push(new Paragraph({
          children: [new TextRun({ text: form.summary, size: 10 * 2, font: 'Times New Roman' })],
          spacing: { line: 300, after: 200 },
        }));
      }

      // 3. Skills and Languages Grid
      const skillsLanguagesCells = [];

      // Skills column
      const skillsArray = (Array.isArray(form.skills) ? form.skills : (form.skills?.split(',') || [])).map(s => typeof s === 'string' ? { name: s.trim(), level: 5 } : s).filter(s => s.name);
      if (skillsArray.length > 0) {
        const skillsChildren = [createSectionTitle(getDocxSectionNum(), 'SKILLS')];
        skillsArray.forEach(skill => {
          const level = typeof skill.level === 'number' ? skill.level : (skill.level === 'Expert' ? 5 : skill.level === 'Experienced' ? 4 : skill.level === 'Skillful' ? 3 : skill.level === 'Intermediate' ? 2 : 1);
          skillsChildren.push(new Paragraph({
            children: [
              new TextRun({ text: skill.name, size: 9 * 2, font: 'Times New Roman' }),
              new TextRun({ text: '\t', size: 9 * 2 }),
              ...createDots(level)
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 4500 }],
            spacing: { after: 80 },
          }));
        });
        skillsLanguagesCells.push(new TableCell({
          children: skillsChildren,
          width: { size: 50, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.TOP,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
        }));
      }

      // Languages column
      const docxLangs = (form.languages || []).map(l => typeof l === 'string' ? { name: l.trim(), level: 'Intermediate' } : l).filter(l => l.name);
      if (docxLangs.length > 0) {
        const langChildren = [createSectionTitle(getDocxSectionNum(), 'LANGUAGES')];
        docxLangs.forEach(lang => {
          const levelStr = lang.level || 'Intermediate';
          const level = levelStr === 'Native' ? 5 : levelStr === 'Professional' ? 4 : levelStr === 'Intermediate' ? 3 : 2;
          langChildren.push(new Paragraph({
            children: [
              new TextRun({ text: lang.name, size: 9 * 2, font: 'Times New Roman' }),
              new TextRun({ text: '\t', size: 9 * 2 }),
              ...createDots(level)
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: 4500 }],
            spacing: { after: 80 },
          }));
        });
        skillsLanguagesCells.push(new TableCell({
          children: langChildren,
          width: { size: 50, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.TOP,
          borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
        }));
      }

      if (skillsLanguagesCells.length > 0) {
        // If only one exists, add an empty cell to maintain grid if needed (or just push the table)
        if (skillsLanguagesCells.length === 1) {
          skillsLanguagesCells.push(new TableCell({
            children: [],
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
          }));
        }

        children.push(new Table({
          rows: [new TableRow({ children: skillsLanguagesCells })],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
          }
        }));
      }

      // 4. Employment History Grid
      if (form.employment && form.employment[0]?.jobTitle) {
        children.push(createSectionTitle(getDocxSectionNum(), 'EMPLOYMENT HISTORY'));
        const jobRows = [];
        for (let i = 0; i < form.employment.length; i += 2) {
          const cells = [];
          [i, i + 1].forEach(index => {
            const job = form.employment[index];
            if (job) {
              const jobChildren = [
                new Paragraph({ children: [new TextRun({ text: job.jobTitle, size: 11 * 2, bold: true, font: 'Times New Roman' })], spacing: { after: 40 } }),
                new Paragraph({ children: [new TextRun({ text: job.company + (job.location ? ', ' + job.location : ''), size: 10 * 2, color: '444444', font: 'Times New Roman' })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: `${job.start} — ${job.end || 'Present'}`, size: 9 * 2, bold: true, color: '666666', allCaps: true, font: 'Times New Roman' })], spacing: { after: 100 } }),
              ];
              if (job.desc) {
                job.desc.split('\n').filter(l => l.trim()).forEach(l => {
                  jobChildren.push(new Paragraph({
                    children: [new TextRun({ text: '• ' + l.trim(), size: 10 * 2, color: '444444', font: 'Times New Roman' })],
                    spacing: { after: 40 },
                    indent: { left: 240 },
                  }));
                });
              }
              cells.push(new TableCell({
                children: jobChildren,
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                margins: { right: 400, bottom: 200 }
              }));
            } else {
              cells.push(new TableCell({
                children: [],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
              }));
            }
          });
          jobRows.push(new TableRow({ children: cells }));
        }
        children.push(new Table({
          rows: jobRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
          }
        }));
      }

      // 5. Education Grid
      if (form.education && form.education[0]?.degree) {
        children.push(createSectionTitle(getDocxSectionNum(), 'EDUCATION'));
        const eduRows = [];
        for (let i = 0; i < form.education.length; i += 2) {
          const cells = [];
          [i, i + 1].forEach(index => {
            const edu = form.education[index];
            if (edu) {
              const eduChildren = [
                new Paragraph({ children: [new TextRun({ text: edu.degree, size: 11 * 2, bold: true, font: 'Times New Roman' })], spacing: { after: 40 } }),
                new Paragraph({ children: [new TextRun({ text: edu.school + (edu.location ? ', ' + edu.location : ''), size: 10 * 2, color: '444444', font: 'Times New Roman' })], spacing: { after: 80 } }),
                new Paragraph({ children: [new TextRun({ text: `${edu.start} — ${edu.end || 'Present'}`, size: 9 * 2, bold: true, color: '666666', allCaps: true, font: 'Times New Roman' })], spacing: { after: 100 } }),
              ];
              cells.push(new TableCell({
                children: eduChildren,
                width: { size: 50, type: WidthType.PERCENTAGE },
                verticalAlign: VerticalAlign.TOP,
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                margins: { right: 400, bottom: 200 }
              }));
            } else {
              cells.push(new TableCell({
                children: [],
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
              }));
            }
          });
          eduRows.push(new TableRow({ children: cells }));
        }
        children.push(new Table({
          rows: eduRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
          }
        }));
      }

      // Custom Sections
      customSections.forEach(custom => {
        const customData = form[custom.key];
        if (!customData || (Array.isArray(customData) && customData.length === 0)) return;

        children.push(createSectionTitle(getDocxSectionNum(), custom.label.toUpperCase()));

        if (Array.isArray(customData)) {
          customData.forEach(entry => {
            children.push(new Paragraph({
              children: [new TextRun({ text: entry.title || entry.name || '', size: 11 * 2, bold: true, font: 'Times New Roman' })],
              spacing: { after: 40 }
            }));
            if (entry.description) {
              children.push(new Paragraph({
                children: [new TextRun({ text: entry.description, size: 10 * 2, font: 'Times New Roman' })],
                spacing: { after: 100 }
              }));
            }
          });
        } else {
          children.push(new Paragraph({
            children: [new TextRun({ text: customData, size: 11 * 2, font: 'Times New Roman' })],
            spacing: { after: 200 }
          }));
        }
      });

      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children: children,
        }],
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
                templateId="template-12"
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
                      padding: '30px 40px',
                      fontFamily: "'Inter', sans-serif",
                      color: "#000",
                      background: '#fff',
                      fontSize: 11,
                      lineHeight: 1.3,
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
