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



  // Resume preview content (WYSIWYG) - Template 13: Daryl Banks (Centered Dark Header)
  const previewHtml = `
    <div style="font-family: 'Inter', sans-serif; color: #333; min-height: 1040px; font-size: 11px; line-height: 1.4; background: #fff;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .serif-font { font-family: 'Playfair Display', serif; }
        .section-title { font-size: 16px; font-weight: 700; color: #000; margin-bottom: 4px; margin-top: 8px; }
        .progress-bar-bg { height: 5px; background: #e5e7eb; border-radius: 3px; position: relative; margin-top: 5px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: #1a1a1a; border-radius: 3px; }
        .contact-icon { width: 14px; height: 14px; vertical-align: middle; margin-right: 6px; filter: invert(1); }
      </style>
      
      <!-- Dark Header Wrapper -->
      <div style="background: #1a1a1a; color: #fff; padding: 25px 40px 15px 40px; text-align: center; margin: 0; border: none;">
        ${form.profileImage ? `
          <div style="margin-bottom: 12px;">
            <div style="width: 85px; height: 85px; border-radius: 50%; overflow: hidden; margin: 0 auto; border: 2px solid #333;">
              <img src="${form.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </div>
        ` : ''}
        
        <div class="serif-font" style="font-size: 34px; font-weight: 700; margin-bottom: 4px; letter-spacing: 1px; color: #fff;">
          ${form.firstName || 'Daryl'} ${form.lastName || 'Banks'}
        </div>
        <div style="font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 2px; color: #999;">
          ${form.tagline || 'DRIVER'}
        </div>
      </div>

      <!-- Contact Bar -->
      <div style="background: #262626; color: rgba(255,255,255,0.9); padding: 10px 40px; display: flex; justify-content: center; gap: 20px; font-size: 9.5px; flex-wrap: wrap;">
        ${form.email ? `
          <div style="display: flex; align-items: center;">
            <img src="https://cdn-icons-png.flaticon.com/512/542/542689.png" class="contact-icon" />
            ${form.email}
          </div>
        ` : ''}
        ${form.address || form.city ? `
          <div style="display: flex; align-items: center;">
            <img src="https://cdn-icons-png.flaticon.com/512/447/447031.png" class="contact-icon" />
            ${form.address ? form.address + ', ' : ''}${form.city || ''}${form.country ? ', ' + form.country : ''}
          </div>
        ` : ''}
        ${form.phone ? `
          <div style="display: flex; align-items: center;">
            <img src="https://cdn-icons-png.flaticon.com/512/455/455705.png" class="contact-icon" />
            ${form.phone}
          </div>
        ` : ''}
      </div>

      <!-- Main Body Padding -->
      <div style="padding: 20px 45px;">
        
        <!-- Profile Section -->
        ${form.summary ? `
          <div style="margin-bottom: 12px;">
            <div class="section-title serif-font">Profile</div>
            <div style="font-size: 11.5px; color: #444; line-height: 1.6; text-align: justify;">${form.summary}</div>
          </div>
        ` : ''}

        <!-- Employment History -->
        ${(form.employment && form.employment[0]?.jobTitle) ? `
          <div style="margin-bottom: 12px;">
            <div class="section-title serif-font">Employment History</div>
            ${form.employment.map(job => `
              <div style="margin-bottom: 12px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #000;">${job.jobTitle}, ${job.company}${job.location ? ', ' + job.location : ''}</div>
                <div style="font-size: 11px; color: #666; margin-bottom: 6px; font-weight: 500;">${job.start} — ${job.end || 'Present'}</div>
                <div style="font-size: 11px; color: #444;">
                  ${job.desc ? job.desc.split('\n').filter(l => l.trim()).map(l => `<div style="margin-bottom: 4px; padding-left: 12px; position: relative;"><span style="position: absolute; left: 0;">•</span>${l.trim()}</div>`).join('') : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Education -->
        ${(form.education && form.education[0]?.degree) ? `
          <div style="margin-bottom: 12px;">
            <div class="section-title serif-font">Education</div>
            ${form.education.map(edu => `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 12.5px; font-weight: 700; color: #000;">${edu.degree}, ${edu.school}${edu.location ? ', ' + edu.location : ''}</div>
                <div style="font-size: 11px; color: #666; font-weight: 500;">${edu.start} ${edu.end ? ' — ' + edu.end : ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Skills -->
        ${form.skills ? `
          <div style="margin-bottom: 12px;">
            <div class="section-title serif-font">Skills</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px 40px;">
              ${(Array.isArray(form.skills) ? form.skills : (form.skills?.split(',') || [])).map(skill => {
    const name = typeof skill === 'string' ? skill.trim() : skill.name;
    const level = typeof skill === 'string' ? 5 : (skill.level === 'Expert' ? 5 : skill.level === 'Experienced' ? 4 : skill.level === 'Skillful' ? 3 : skill.level === 'Intermediate' ? 2 : 1);
    if (!name) return '';
    return `
                  <div>
                    <div style="font-size: 11.5px; font-weight: 500; color: #333;">${name}</div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" style="width: ${level * 20}%;"></div>
                    </div>
                  </div>
                `;
  }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Custom Sections -->
        ${customSections.map(custom => {
    const customData = form[custom.key];
    if (!customData || (Array.isArray(customData) && customData.length === 0)) return '';
    return `
            <div style="margin-bottom: 12px;">
              <div class="section-title serif-font">${custom.label}</div>
              <div style="font-size: 11px; color: #444;">
                ${Array.isArray(customData) ? customData.map(entry => `
                  <div style="margin-bottom: 10px;">
                    <div style="font-size: 12px; font-weight: 700;">${entry.title || entry.name || ''}</div>
                    <div style="font-size: 11px;">${entry.description || ''}</div>
                  </div>
                `).join('') : `<div>${customData}</div>`}
              </div>
            </div>
          `;
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
      line-height: 1.5;
      padding: 0;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT - 60; // Increased usable height for full-bleed layout
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 13 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 13 }) }); } catch (_) { }

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

  // DOCX download handler
  async function handleDownloadDOCX() {
    try {
      const children = [];
      const BODY_INDENT = 720; // 0.5 inch indentation for body content

      // 1. Dark Header Section
      const headerRows = [];

      // Profile Image Row
      if (form.profileImage) {
        try {
          const buffer = await getCircularImage(form.profileImage, 180); // Higher res for DOCX
          headerRows.push(
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new ImageRun({
                          data: buffer,
                          transformation: { width: 95, height: 95 }, // Increased size
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200 },
                    }),
                  ],
                  shading: { fill: '1A1A1A', type: ShadingType.CLEAR, color: 'auto' },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                }),
              ],
            })
          );
        } catch (e) { console.error("Circular image processing failed", e); }
      }

      // Name Row
      headerRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${form.firstName || 'Daryl'} ${form.lastName || 'Banks'}`,
                      size: 36 * 2,
                      bold: true,
                      color: 'FFFFFF',
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 100, after: 60 },
                }),
              ],
              shading: { fill: '1A1A1A', type: ShadingType.CLEAR, color: 'auto' },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
            }),
          ],
        })
      );

      // Tagline Row
      headerRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: (form.tagline || 'DRIVER').toUpperCase(),
                      size: 11 * 2,
                      color: '999999',
                      font: 'Arial',
                      allCaps: true,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                }),
              ],
              shading: { fill: '1A1A1A', type: ShadingType.CLEAR, color: 'auto' },
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
            }),
          ],
        })
      );

      children.push(
        new Table({
          rows: headerRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );

      // 2. Contact Bar
      const contactInfo = [
        form.email,
        form.address || form.city ? `${form.address ? form.address + ', ' : ''}${form.city || ''}${form.country ? ', ' + form.country : ''}` : null,
        form.phone
      ].filter(Boolean).join('   •   ');

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: contactInfo,
                          size: 9 * 2,
                          color: 'FFFFFF',
                          font: 'Arial',
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 120, after: 120 },
                    }),
                  ],
                  shading: { fill: '262626', type: ShadingType.CLEAR, color: 'auto' },
                  borders: {
                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                  },
                }),
              ],
            }),
          ],
        })
      );

      // Section Title Helper
      const createSectionTitle = (text) => {
        return new Paragraph({
          children: [
            new TextRun({
              text: text,
              size: 17 * 2,
              bold: true,
              font: 'Times New Roman',
              color: '000000',
            }),
          ],
          indent: { left: BODY_INDENT, right: BODY_INDENT },
          spacing: { before: 200, after: 100 },
          keepWithNext: true,
        });
      };

      // 3. Profile
      if (form.summary) {
        children.push(createSectionTitle('Profile'));
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: form.summary,
                size: 11 * 2,
                font: 'Arial',
                color: '333333',
              }),
            ],
            indent: { left: BODY_INDENT, right: BODY_INDENT },
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }

      // 4. Employment History
      if (form.employment && form.employment[0]?.jobTitle) {
        children.push(createSectionTitle('Employment History'));
        form.employment.forEach(job => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${job.jobTitle}, ${job.company}${job.location ? ', ' + job.location : ''}`,
                  size: 12 * 2,
                  bold: true,
                  color: '000000',
                  font: 'Arial',
                }),
              ],
              indent: { left: BODY_INDENT, right: BODY_INDENT },
              spacing: { before: 100 },
            })
          );
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${job.start} — ${job.end || 'Present'}`,
                  size: 10 * 2,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              indent: { left: BODY_INDENT, right: BODY_INDENT },
              spacing: { after: 50 },
            })
          );
          if (job.desc) {
            job.desc.split('\n').filter(l => l.trim()).forEach(line => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '• ',
                      size: 11 * 2,
                      font: 'Arial',
                    }),
                    new TextRun({
                      text: line.trim(),
                      size: 11 * 2,
                      font: 'Arial',
                    }),
                  ],
                  indent: { left: BODY_INDENT + 240, right: BODY_INDENT },
                  spacing: { after: 40 },
                })
              );
            });
          }
        });
      }

      // 5. Education
      if (form.education && form.education[0]?.degree) {
        children.push(createSectionTitle('Education'));
        form.education.forEach(edu => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.degree}, ${edu.school}${edu.location ? ', ' + edu.location : ''}`,
                  size: 12 * 2,
                  bold: true,
                  font: 'Arial',
                }),
              ],
              indent: { left: BODY_INDENT, right: BODY_INDENT },
              spacing: { before: 80 },
            })
          );
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${edu.start} ${edu.end ? ' — ' + edu.end : ''}`,
                  size: 10 * 2,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              indent: { left: BODY_INDENT, right: BODY_INDENT },
              spacing: { after: 60 },
            })
          );
        });
      }

      // 6. Skills with Progress Bars
      if (form.skills) {
        children.push(createSectionTitle('Skills'));
        const skillList = (Array.isArray(form.skills) ? form.skills : (form.skills?.split(',') || [])).map(s => typeof s === 'string' ? { name: s.trim(), level: 5 } : s).filter(s => s.name);

        const skillRows = [];
        for (let i = 0; i < skillList.length; i += 2) {
          const s1 = skillList[i];
          const s2 = skillList[i + 1];

          const createSkillCell = (skill) => {
            if (!skill) return new TableCell({ children: [], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } } });
            const level = skill.level === 'Expert' ? 5 : skill.level === 'Experienced' ? 4 : skill.level === 'Skillful' ? 3 : skill.level === 'Intermediate' ? 2 : (typeof skill.level === 'number' ? skill.level : 1);

            return new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: skill.name, size: 10 * 2, font: 'Arial' })],
                  spacing: { after: 40 },
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [],
                          width: { size: level * 20, type: WidthType.PERCENTAGE },
                          shading: { fill: '1A1A1A' },
                          borders: {
                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                          },
                        }),
                        new TableCell({
                          children: [],
                          width: { size: (5 - level) * 20, type: WidthType.PERCENTAGE },
                          shading: { fill: 'E5E7EB' },
                          borders: {
                            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                          },
                        }),
                      ],
                      height: { value: 60, rule: HeightRule.EXACT },
                    }),
                  ],
                }),
              ],
              borders: {
                top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              },
              margins: { right: 400, bottom: 200 },
            });
          };

          skillRows.push(new TableRow({
            children: [createSkillCell(s1), createSkillCell(s2)],
          }));
        }

        children.push(
          new Table({
            rows: skillRows,
            width: { size: 10466, type: WidthType.DXA }, // Fixed width to fit within indent (11906 - 1440)
            indent: { size: BODY_INDENT, type: WidthType.DXA },
            borders: {
              top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
            },
          })
        );
      }

      // 7. Custom Sections
      customSections.forEach(custom => {
        const customData = form[custom.key];
        if (!customData || (Array.isArray(customData) && customData.length === 0)) return;

        children.push(createSectionTitle(custom.label));
        if (Array.isArray(customData)) {
          customData.forEach(entry => {
            children.push(new Paragraph({
              children: [new TextRun({ text: entry.title || entry.name || '', size: 11 * 2, bold: true, font: 'Arial' })],
              indent: { left: BODY_INDENT, right: BODY_INDENT },
              spacing: { before: 120 },
            }));
            if (entry.description) {
              children.push(new Paragraph({
                children: [new TextRun({ text: entry.description, size: 10 * 2, font: 'Arial' })],
                indent: { left: BODY_INDENT, right: BODY_INDENT },
                spacing: { after: 120 },
              }));
            }
          });
        } else {
          children.push(new Paragraph({
            children: [new TextRun({ text: String(customData), size: 10 * 2, font: 'Arial' })],
            indent: { left: BODY_INDENT, right: BODY_INDENT },
          }));
        }
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: { margin: { top: 0, right: 0, bottom: 1440, left: 0 } },
          },
          children: children,
        }],
      });

      return await Packer.toBlob(doc);
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
                templateId="template-13"
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
                      color: "#000",
                      background: '#fff',
                      fontSize: 10,
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
