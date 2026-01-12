"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import Breadcrumb from "@/components/common/Breadcrumb";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";
import { useTailoredCVData } from "@/utils/useTailoredCVData";

import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun } from 'docx';

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

  // Convert base64 string to Uint8Array for browser compatibility
  const base64ToUint8Array = (base64) => {
    try {
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } catch (error) {
      console.error('Error converting base64 to Uint8Array:', error);
      return null;
    }
  };

  // Convert any image source to Uint8Array
  const imageToUint8Array = async (imageSrc) => {
    try {
      if (imageSrc.startsWith('data:image/')) {
        // Base64 image
        const base64Data = imageSrc.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 data');
        }
        return base64ToUint8Array(base64Data);
      } else if (imageSrc.startsWith('blob:')) {
        // Blob URL - convert to base64 first
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status}`);
        }
        const blob = await response.blob();
        
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const base64Data = base64.split(',')[1];
        return base64ToUint8Array(base64Data);
      } else {
        // Regular URL
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  // Create a circular-cropped PNG from any image source
  const createCircularPngUint8 = async (imageSrc, size = 80) => {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          // Create canvas for circular crop
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = size;
          canvas.height = size;
          
          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
          ctx.clip();
          
          // Calculate scaling to fill circle
          const scale = Math.max(size / img.width, size / img.height);
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;
          const offsetX = (size - scaledWidth) / 2;
          const offsetY = (size - scaledHeight) / 2;
          
          // Draw image
          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
          
          // Convert to PNG blob then to Uint8Array
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
              const base64Data = reader.result.split(',')[1];
              const uint8Array = base64ToUint8Array(base64Data);
              resolve(uint8Array);
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          }, 'image/png');
        };
        
        img.onerror = () => resolve(null);
        img.src = imageSrc;
      });
    } catch (error) {
      console.error('Error creating circular PNG:', error);
      return null;
    }
  };

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



  // Resume preview content (WYSIWYG) - Modern Professional Design with Harvard Font Sizing
  const previewHtml = `
    <div style="font-family: 'Arial', sans-serif; color: #000; min-height: 1040px; background: #fff; font-size: 11pt; line-height: 1.0;">
      
      <!-- Modern Header with Accent Strip -->
      <div style="background: #2c3e50; padding: 0; margin: 0; height: 3px;"></div>
      
      <div style="padding: 40px 50px 30px 50px;">
        <!-- Header Section - Modern Layout with Harvard Sizing -->
      ${form.firstName ? `
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px; border-bottom: 1px solid #e1e8ed; padding-bottom: 12px;">
            <!-- Profile Photo - Modern Style -->
            <div style="width: 60px; height: 60px; border-radius: 12px; ${form.profileImage ? `background-image: url('${form.profileImage}'); background-size: cover; background-position: center;` : 'background: #2c3e50;'} flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 16pt; font-weight: bold; margin-right: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 3px solid #fff;">
              ${!form.profileImage ? (form.firstName ? form.firstName.charAt(0) : '') + (form.lastName ? form.lastName.charAt(0) : '') : ''}
            </div>
            
            <!-- Name and Contact Section -->
            <div style="flex: 1;">
              <!-- Name and Title -->
              <div style="margin-bottom: 8px;">
                <h1 style="font-size: 17pt; font-weight: bold; color: #000; margin: 0 0 4px 0; line-height: 1.2;">${form.firstName} ${form.lastName || ''}</h1>
                ${form.tagline ? `<div style="font-size: 11pt; color: #333; font-weight: normal; margin-bottom: 0;">${form.tagline}</div>` : ''}
              </div>
              
              <!-- Contact Information - Clean List -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 4px; font-size: 10pt; color: #333;">
                ${form.email ? `<div>${form.email}</div>` : ''}
                ${form.phone ? `<div>${form.phone}</div>` : ''}
                ${(form.city || form.country) ? `<div>${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}</div>` : ''}
                ${form.linkedin ? `<div>${form.linkedin}</div>` : ''}
              </div>
          </div>
        </div>
      ` : ''}
      
        <!-- Professional Summary Section -->
        ${form.summary ? `
          <div style="margin-bottom: 10px;">
            <h2 style="font-size: 12pt; font-weight: bold; color: #000; margin: 0 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
              SUMMARY
            </h2>
            <p style="font-size: 11pt; line-height: 1.0; color: #000; margin: 4px 0 0 0; text-align: left; word-wrap: break-word; overflow-wrap: break-word; white-space: pre-wrap;">${form.summary}</p>
          </div>
        ` : ''}
      
        <!-- Main Content Sections -->
        
        <!-- Skills Section -->
        ${(() => {
          const skillsArray = Array.isArray(form.skills) 
            ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
            : (form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : []);
          
          if (skillsArray.length > 0) {
            // Split skills into 3 columns like Harvard template
            const column1 = skillsArray.slice(0, Math.ceil(skillsArray.length / 3));
            const column2 = skillsArray.slice(Math.ceil(skillsArray.length / 3), Math.ceil(skillsArray.length * 2 / 3));
            const column3 = skillsArray.slice(Math.ceil(skillsArray.length * 2 / 3));
            
          return `
                <div style="margin-bottom: 10px;">
                  <h2 style="font-size: 12pt; font-weight: bold; color: #000; margin: 0 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
                    SKILLS
                  </h2>
                  <div style="display: flex; margin-top: 4px;">
                    <div style="flex: 1; margin-right: 16px;">
                      ${column1.map(skill => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        return `<div style="font-size: 11pt; margin-bottom: 1px;">• ${skillName}</div>`;
                      }).join('')}
                    </div>
                    <div style="flex: 1; margin-right: 16px;">
                      ${column2.map(skill => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        return `<div style="font-size: 11pt; margin-bottom: 1px;">• ${skillName}</div>`;
                      }).join('')}
                    </div>
                    <div style="flex: 1;">
                      ${column3.map(skill => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        return `<div style="font-size: 11pt; margin-bottom: 1px;">• ${skillName}</div>`;
                      }).join('')}
                    </div>
                  </div>
            </div>
          `;
        }
          return '';
        })()}
        
        <!-- Employment History Section -->
        ${form.employment && form.employment[0] && form.employment[0].jobTitle ? `
          <div style="margin-bottom: 10px;">
            <h2 style="font-size: 12pt; font-weight: bold; color: #000; margin: 0 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
              EXPERIENCE
            </h2>
              ${form.employment.map((job, idx) => `
              <div style="margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px;">
                    <div style="font-size: 11pt; font-weight: bold;">${job.jobTitle}</div>
                    <div style="font-size: 11pt;">${job.start}${job.start && job.end ? ' - ' : ''}${job.end || 'Present'}</div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                    <div style="font-size: 11pt; font-style: italic;">${job.company}</div>
                    <div style="font-size: 11pt;">${job.location || ''}</div>
                  </div>
                ${job.desc ? `
                  <div style="font-size: 10pt; margin-left: 16px;">
                    ${job.desc.split('\n').filter(line => line.trim()).map(line => `
                      <div style="margin-bottom: 1px;">• ${line.trim()}</div>
                    `).join('')}
                  </div>
                ` : ''}
                </div>
              `).join('')}
            </div>
        ` : ''}
        
        <!-- Education Section -->
        ${form.education && form.education[0] && form.education[0].degree ? `
          <div style="margin-bottom: 10px;">
            <h2 style="font-size: 12pt; font-weight: bold; color: #000; margin: 0 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
              EDUCATION
            </h2>
            ${form.education.map((edu, idx) => `
              <div style="margin-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1px;">
                  <div style="font-size: 11pt; font-weight: bold;">${edu.school}</div>
                  <div style="font-size: 11pt;">${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <div style="font-size: 11pt; font-style: italic;">${edu.degree}</div>
                  <div style="font-size: 10pt;">${edu.location || ''}</div>
                </div>
                ${edu.desc ? `
                  <div style="font-size: 10pt; margin-left: 16px;">
                    ${edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
              `).join('')}
            </div>
        ` : ''}
        
        <!-- Projects Section -->
        ${form.projects && form.projects[0] && form.projects[0].name ? `
          <div style="margin-bottom: 10px;">
            <h2 style="font-size: 12pt; font-weight: bold; color: #000; margin: 0 0 4px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
              PROJECTS
            </h2>
            ${form.projects.map((proj, idx) => `
              <div style="margin-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <div style="font-size: 11pt; font-weight: bold;">${proj.name}</div>
                  <div style="font-size: 11pt;">${proj.date || ''}</div>
                </div>
                ${proj.desc ? `
                  <div style="font-size: 10pt; margin-left: 16px;">
                    ${proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 1px;">• ${line.trim()}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

              </div>
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
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.0;
      padding: 40px 40px;
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
          font-family: 'Arial', sans-serif;
          font-size: 11pt;
          line-height: 1.0;
          padding: 40px 40px;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 7 }) }); } catch (_) {}

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 7 }) }); } catch (_) {}

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

      // Process profile image if exists
      let profileImageData = null;
      if (form.profileImage) {
        try {
          profileImageData = await createCircularPngUint8(form.profileImage, 80);
        } catch (error) {
          console.error('Error processing profile image for DOCX:', error);
        }
      }

      // Add blue-greyish accent line at the top (matching live preview)
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '', size: 1 })],
          spacing: { after: 0 },
          borders: {
            top: {
              color: '2c3e50', // Blue-greyish color matching live preview
              space: 0,
              style: BorderStyle.SINGLE,
              size: 18, // Thicker line to match the accent strip
            },
          },
        })
      );

      // Modern Header Section with Professional Layout
      if (form.firstName) {
        // Header table for modern layout
        const headerTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                // Profile photo cell
                new TableCell({
                  children: [
                    ...(profileImageData ? [new Paragraph({
                      children: [
                        new ImageRun({
                          data: profileImageData,
                          transformation: {
                            width: 60,
                            height: 60,
                          },
                        }),
                      ],
                      spacing: { after: 0 },
                    })] : [new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.firstName ? form.firstName.charAt(0) : ''}${form.lastName ? form.lastName.charAt(0) : ''}`,
                          size: 32 * 2,
                          bold: true,
                          color: 'FFFFFF',
                        }),
                      ],
                      spacing: { after: 0 },
                      alignment: AlignmentType.CENTER,
                    })]),
                  ],
                  width: { size: 15, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  verticalAlign: "top",
                  margins: { right: 400 }
                }),
                // Name and contact information cell
                new TableCell({
                  children: [
                    // Name
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${form.firstName} ${form.lastName || ''}`,
                          size: 17 * 2,
                          bold: true,
                          color: '000000',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 80 },
                    }),
                    // Tagline
                    ...(form.tagline ? [new Paragraph({
                      children: [
                        new TextRun({
                          text: form.tagline,
                          size: 11 * 2,
                          color: '333333',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 200 },
                    })] : []),
                    
                    // Contact info in true 3-column layout like live preview
                    new Paragraph({
                      children: [
                        ...(form.email ? [
                          new TextRun({
                            text: form.email,
                            size: 10 * 2,
                            color: '333333',
                            font: 'Arial',
                          }),
                          new TextRun({
                            text: '\t',
                            size: 10 * 2,
                          })
                        ] : []),
                        ...(form.phone ? [
                          new TextRun({
                            text: form.phone,
                            size: 10 * 2,
                            color: '333333',
                            font: 'Arial',
                          }),
                          new TextRun({
                            text: '\t',
                            size: 10 * 2,
                          })
                        ] : []),
                        ...((form.city || form.country) ? [
                          new TextRun({
                            text: `${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}`,
                            size: 10 * 2,
                            color: '333333',
                            font: 'Arial',
                          })
                        ] : [])
                      ],
                      spacing: { after: 80 },
                      tabStops: [
                        { type: TabStopType.LEFT, position: 2400 },
                        { type: TabStopType.LEFT, position: 4800 }
                      ],
                    }),
                    // LinkedIn on separate line if needed
                    ...(form.linkedin ? [new Paragraph({
                      children: [
                        new TextRun({
                          text: form.linkedin,
                          size: 10 * 2,
                          color: '333333',
                          font: 'Arial',
                        })
                      ],
                      spacing: { after: 0 },
                    })] : []),
                  ],
                  width: { size: 85, type: WidthType.PERCENTAGE },
                  borders: {
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
        });
        
        children.push(headerTable);
        
        // Add separator line to match live preview
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 1 })],
            spacing: { after: 240 },
            borders: {
              bottom: {
                color: 'e1e8ed',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 4,
              },
            },
          })
        );
      }

      // Professional Summary (only if summary exists and is enabled)
      if (sections.includes('summary') && form.summary) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'SUMMARY',
                size: 12 * 2,
                bold: true,
                color: '000000',
                font: 'Arial',
                allCaps: true,
              }),
            ],
            spacing: { after: 120 },
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
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: form.summary,
                size: 11 * 2,
                color: '000000',
                font: 'Arial',
              }),
            ],
            spacing: { after: 240 },
          })
        );
      }

      // Modern Content Sections
      const skillsArray = Array.isArray(form.skills) 
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
        : (form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : []);
      
      // Skills Section (only if skills exist and are enabled)
      if (sections.includes('skills') && skillsArray.length > 0) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                size: 12 * 2,
                bold: true,
                color: '000000',
                font: 'Arial',
                allCaps: true,
              }),
            ],
            spacing: { after: 120 },
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
        
        // Skills in 3 columns for DOCX (like HTML preview)
        const column1 = skillsArray.slice(0, Math.ceil(skillsArray.length / 3));
        const column2 = skillsArray.slice(Math.ceil(skillsArray.length / 3), Math.ceil(skillsArray.length * 2 / 3));
        const column3 = skillsArray.slice(Math.ceil(skillsArray.length * 2 / 3));
        
        const skillsTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: column1.map(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${skillName}`,
                          size: 11 * 2,
                          color: '000000',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 20 },
                    });
                  }),
                  width: { size: 33.33, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  verticalAlign: "top"
                }),
                new TableCell({
                  children: column2.map(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${skillName}`,
                          size: 11 * 2,
                          color: '000000',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 20 },
                    });
                  }),
                  width: { size: 33.33, type: WidthType.PERCENTAGE },
                  borders: {
                    top: { style: BorderStyle.NONE },
                    bottom: { style: BorderStyle.NONE },
                    left: { style: BorderStyle.NONE },
                    right: { style: BorderStyle.NONE }
                  },
                  verticalAlign: "top"
                }),
                new TableCell({
                  children: column3.map(skill => {
                    const skillName = typeof skill === 'string' ? skill : skill.name;
                    return new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${skillName}`,
                          size: 11 * 2,
                          color: '000000',
                          font: 'Arial',
                        }),
                      ],
                      spacing: { after: 20 },
                    });
                  }),
                  width: { size: 33.33, type: WidthType.PERCENTAGE },
                  borders: {
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
        });
        
        children.push(skillsTable);
        
        // Add spacing after skills table
        children.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 1 })],
            spacing: { after: 240 },
          })
        );
      }
      
      // Employment History Section (only if employment exists and is enabled)
      if (sections.includes('employment') && form.employment && form.employment[0] && form.employment[0].jobTitle) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'EXPERIENCE',
                size: 12 * 2,
                bold: true,
                color: '000000',
                font: 'Arial',
                allCaps: true,
              }),
            ],
            spacing: { after: 120 },
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
          // Job title and date
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: job.jobTitle,
                  size: 11 * 2,
                  bold: true,
                  color: '000000',
                  font: 'Arial',
                }),
                new TextRun({
                  text: '\t',
                  size: 11 * 2,
                }),
                new TextRun({
                  text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end || 'Present'}`,
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 80 },
              tabStops: [{ type: TabStopType.RIGHT, position: 8500 }],
            })
          );
          
          // Company and location
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: job.company,
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                  italics: true,
                }),
                new TextRun({
                  text: '\t',
                  size: 11 * 2,
                }),
                new TextRun({
                  text: job.location || '',
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 80 },
              tabStops: [{ type: TabStopType.RIGHT, position: 8500 }],
            })
          );
          
          // Job description
          if (job.desc) {
            job.desc.split('\n').filter(line => line.trim()).forEach(line => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${line.trim()}`,
                      size: 10 * 2,
                      color: '000000',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 120 },
                })
              );
            });
          }
          
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 1 })],
              spacing: { after: 80 },
            })
          );
        });
      }
      
      // Education Section (only if education exists and is enabled)
      if (sections.includes('education') && form.education && form.education[0] && form.education[0].degree) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'EDUCATION',
                size: 12 * 2,
                bold: true,
                color: '000000',
                font: 'Arial',
                allCaps: true,
              }),
            ],
            spacing: { after: 120 },
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
          // School and date (following Harvard format)
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.school,
                  size: 11 * 2,
                  bold: true,
                  color: '000000',
                  font: 'Arial',
                }),
                new TextRun({
                  text: '\t',
                  size: 11 * 2,
                }),
                new TextRun({
                  text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 20 },
              tabStops: [{ type: TabStopType.RIGHT, position: 8500 }],
            })
          );
          
          // Degree and location
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree,
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                  italics: true,
                }),
                new TextRun({
                  text: '\t',
                  size: 11 * 2,
                }),
                new TextRun({
                  text: edu.location || '',
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 80 },
              tabStops: [{ type: TabStopType.RIGHT, position: 8500 }],
            })
          );
          
          // Description
          if (edu.desc) {
            edu.desc.split('\n').filter(line => line.trim()).forEach(line => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${line.trim()}`,
                      size: 10 * 2,
                      color: '000000',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 20 },
                })
              );
            });
          }
          
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 1 })],
              spacing: { after: 80 },
            })
          );
        });
      }
      
      // Projects Section (only if projects exist and are enabled)
      if (sections.includes('projects') && form.projects && form.projects[0] && form.projects[0].name) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'PROJECTS',
                size: 12 * 2,
                bold: true,
                color: '000000',
                font: 'Arial',
                allCaps: true,
              }),
            ],
            spacing: { after: 120 },
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
        
        form.projects.forEach(proj => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: proj.name,
                  size: 11 * 2,
                  bold: true,
                  color: '000000',
                  font: 'Arial',
                }),
                ...(proj.date ? [
                  new TextRun({
                    text: '\t',
                    size: 10 * 2,
                  }),
                  new TextRun({
                                      text: proj.date,
                  size: 11 * 2,
                  color: '000000',
                  font: 'Arial',
                  }),
                ] : []),
              ],
              spacing: { after: 160 },
              tabStops: [{ type: TabStopType.RIGHT, position: 8500 }],
            })
          );
          
          if (proj.desc) {
            proj.desc.split('\n').filter(line => line.trim()).forEach(line => {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${line.trim()}`,
                      size: 10 * 2,
                      color: '000000',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 20 },
                })
              );
            });
          }
          
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 1 })],
              spacing: { after: 80 },
            })
          );
        });
      }


      // Create the document
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 720, // 0.5 inch
                  right: 720, // 0.5 inch
                  bottom: 720, // 0.5 inch
                  left: 720, // 0.5 inch
                },
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
              templateId="template-7" 
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
                      color: "#000",
                      background: '#fff',
                      fontSize: '11pt',
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


