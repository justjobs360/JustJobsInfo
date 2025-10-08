"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeBuilderForm from "@/components/resume/ResumeBuilderForm";


import html2pdf from 'html2pdf.js';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType, ImageRun } from 'docx';

export default function ResumeEditorPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState({});
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState(["personal", "summary", "employment", "education", "skills"]);
  const [customSections, setCustomSections] = useState([]);
  const [step, setStep] = useState(0);

  // Convert base64 string to Uint8Array for browser compatibility
  const base64ToUint8Array = (base64) => {
    try {
      console.log('Converting base64 string of length:', base64.length);
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('Created Uint8Array of length:', bytes.length);
      
      // Validate that this looks like an image file
      if (bytes.length > 10) {
        const header = Array.from(bytes.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join('');
        console.log('Image header bytes:', header);
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
      console.log('Converting image source:', imageSrc.substring(0, 100));
      
      if (imageSrc.startsWith('data:image/')) {
        // Base64 image
        console.log('Processing base64 image');
        const base64Data = imageSrc.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 data');
        }
        const result = base64ToUint8Array(base64Data);
        console.log('Base64 conversion result:', result ? result.length : 'null');
        return result;
      } else if (imageSrc.startsWith('blob:')) {
        // Blob URL - convert to base64 first
        console.log('Processing blob URL');
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${response.status}`);
        }
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'type:', blob.type);
        
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        const base64Data = base64.split(',')[1];
        const result = base64ToUint8Array(base64Data);
        console.log('Blob conversion result:', result ? result.length : 'null');
        return result;
      } else {
        // Regular URL
        console.log('Processing regular URL');
        const response = await fetch(imageSrc);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const result = new Uint8Array(arrayBuffer);
        console.log('URL conversion result:', result.length);
        return result;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  // Create a circular-cropped PNG (Uint8Array) from any image source to match live preview avatar style
  const createCircularPngUint8 = async (imageSrc, size = 80) => {
    try {
      const img = new Image();
      if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('blob:')) {
        img.crossOrigin = 'anonymous';
      }
      const onLoad = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      img.src = imageSrc;
      await onLoad;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw circular clip
      ctx.clearRect(0, 0, size, size);
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw image covering the circle
      const scale = Math.max(size / img.width, size / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (size - dw) / 2;
      const dy = (size - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);

      const dataUrl = canvas.toDataURL('image/png');
      const base64 = dataUrl.split(',')[1];
      return base64ToUint8Array(base64);
    } catch (err) {
      console.warn('Circular crop failed, falling back to original image:', err);
      return imageToUint8Array(imageSrc);
    }
  };

  // Responsive preview scaling
  const previewWrapperRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const A4_WIDTH = 800; // Standard A4 width
  const A4_HEIGHT = Math.round(800 * 1.414); // Proper A4 aspect ratio (1:1.414)
  const A4_MARGIN = 20; // Reduced margin for better content utilization

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



  // Resume preview content (WYSIWYG) - Modern Two-Column Template (Matches DOCX exactly)
  const previewHtml = `
    <div style="display: flex; font-family: 'Arial', sans-serif; color: #000; height: 100%; font-size: 10px; line-height: 1.2;">
      
      <!-- Left Column - Dark Green Sidebar -->
      <div style="width: 35%; background-color: #10365C; color: white; padding: 28px 15px 16px 15px; box-sizing: border-box; height: 100%; display: flex; flex-direction: column;">
        
        <!-- Profile Picture -->
        <div style="text-align: center; margin-bottom: 18px; margin-top: 20px;">
          ${form.profileImage ? `
            <img 
              src="${form.profileImage}" 
              alt="Profile" 
              style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin: 6px auto 12px; display: block; "
            />
          ` : `
            <div style="width: 80px; height: 80px; border-radius: 50%; background-color: #f0f0f0; margin: 6px auto 12px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 12px;">
              Photo
            </div>
          `}
        </div>
        
        <!-- Name and Title -->
        ${form.firstName ? `
          <div style="text-align: center; margin-bottom: 16px;">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px; letter-spacing: 0.5px; line-height: 1.1;">${form.firstName} ${form.lastName || ''}</div>
            ${form.tagline ? `<div style="font-size: 12px; font-weight: normal; text-transform: uppercase; opacity: 0.9; line-height: 1.2;">${form.tagline}</div>` : ''}
          </div>
        ` : ''}
        
        <!-- Contact Details -->
        <div style="margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #4a7c59; padding-bottom: 5px; line-height: 1.1;">Details</div>
          <div style="font-size: 10px; line-height: 1.4;">
            ${form.address ? `<div style="margin-bottom: 8px;">${form.address}</div>` : ''}
            ${form.city ? `<div style="margin-bottom: 8px;">${form.city}${form.state ? ', ' + form.state : ''}</div>` : ''}
            ${form.country ? `<div style="margin-bottom: 8px;">${form.country}</div>` : ''}
            ${form.phone ? `<div style="margin-bottom: 8px;">${form.phone}</div>` : ''}
            ${form.email ? `<div style="margin-bottom: 8px;">${form.email}</div>` : ''}
            ${form.linkedin ? `<div style="margin-bottom: 8px;">${form.linkedin}</div>` : ''}
          </div>
        </div>
        
        <!-- Skills Section -->
        ${sections.includes('skills') && form.skills ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #4a7c59; padding-bottom: 5px; line-height: 1.1;">Skills</div>
            <div style="font-size: 10px; line-height: 1.4;">
              ${(() => {
                const skillsArray = Array.isArray(form.skills) 
                  ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
                  : form.skills.split(',').map(s => s.trim()).filter(s => s);
                
                return skillsArray.map(skill => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  const skillLevel = typeof skill === 'object' ? skill.level : 'Intermediate';
                  
                  // Calculate bar width based on skill level
                  let barWidth = '100%';
                  if (skillLevel === 'Basic') {
                    barWidth = '40%';
                  } else if (skillLevel === 'Intermediate') {
                    barWidth = '70%';
                  } else if (skillLevel === 'Expert') {
                    barWidth = '100%';
                  }
                  
                  return `<div style="margin-bottom: 8px;">
                    <div style="margin-bottom: 2px; font-weight: 500; line-height: 1.15;">${skillName}</div>
                    <div style="width: 100%; height: 6px; background-color:#787777;  position: relative; overflow: hidden;">
                      <div style="width: ${barWidth}; height: 100%; background-color: #fff;  position: absolute; left: 0; top: 0;"></div>
                    </div>
                  </div>`;
                }).join('');
              })()}
            </div>
          </div>
        ` : ''}
        
        <!-- Languages Section -->
        ${sections.includes('languages') && form.languages && form.languages[0] ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #4a7c59; padding-bottom: 5px; line-height: 1.1;">Languages</div>
            <div style="font-size: 10px; line-height: 1.4;">
              ${form.languages.map(lang => `<div style="margin-bottom: 8px;">• ${lang}</div>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- Certifications Section -->
        ${sections.includes('certifications') && form.certifications && form.certifications[0] ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #4a7c59; padding-bottom: 5px; line-height: 1.1;">Certifications</div>
            <div style="font-size: 10px; line-height: 1.4;">
              ${form.certifications.map(cert => `<div style="margin-bottom: 8px;">• ${cert}</div>`).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- References Section -->
        ${sections.includes('references') && form.references && form.references[0] ? `
          <div style="margin-bottom: 14px;">
            <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 12px; border-bottom: 1px solid #4a7c59; padding-bottom: 5px; line-height: 1.1;">References</div>
            <div style="font-size: 10px; line-height: 1.4;">
              ${form.references.map(ref => `<div style="margin-bottom: 8px;">• ${ref.name || ref}</div>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- Right Column - White Content Area -->
      <div style="width: 65%; background-color: white; padding: 16px 16px; box-sizing: border-box; height: 100%;">
        
        ${sections.map(section => {
        if (section === 'summary' && form.summary) {
          return `
            <div style="margin-bottom: 14px; margin-top: 20px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #10365C; line-height: 1.1;">Profile</div>
              <div style="font-size: 11px; line-height: 1.45; color: #333; text-align: justify; margin-bottom: 0;">${form.summary}</div>
            </div>
          `;
        }
        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          return `
            <div style="margin-bottom: 14px; margin-top: 20px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #10365C; line-height: 1.1;">Employment History</div>
              ${form.employment.map((job, idx) => `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <div style="font-size: 12px; font-weight: bold; color: #10365C; line-height: 1.2;">${job.jobTitle}, ${job.company}</div>
                    <div style="font-size: 10px; color: #666; text-transform: uppercase; line-height: 1.1;">${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</div>
                  </div>
                  <div style="font-size: 10px; color: #666; margin-bottom: 6px; font-style: italic; line-height: 1.15;">${job.location || ''}</div>
                  <div style="font-size: 10px; line-height: 1.35; color: #333; margin-left: 15px;">
                    ${job.desc ? job.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; line-height: 1.25;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'education' && form.education && form.education[0].degree) {
          return `
            <div style="margin-bottom: 14px; margin-top: 20px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #10365C; line-height: 1.1;">Education</div>
              ${form.education.map((edu, idx) => `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <div style="font-size: 12px; font-weight: bold; color: #10365C; line-height: 1.2;">${edu.degree}, ${edu.school}</div>
                    <div style="font-size: 10px; color: #666; text-transform: uppercase; line-height: 1.1;">${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}</div>
                  </div>
                  <div style="font-size: 10px; color: #666; margin-bottom: 6px; font-style: italic; line-height: 1.15;">${edu.location || ''}</div>
                  <div style="font-size: 10px; line-height: 1.35; color: #333; margin-left: 15px;">
                    ${edu.desc ? edu.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; line-height: 1.25;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'skills' && form.skills) {
          // Skills are now displayed in the left sidebar, so skip here
          return '';
        }
        if (section === 'projects' && form.projects && form.projects[0].name) {
          return `
            <div style="margin-bottom: 14px; margin-top: 20px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #10365C; line-height: 1.1;">Projects</div>
              ${form.projects.map((proj, idx) => `
                <div style="margin-bottom: 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                    <div style="font-size: 12px; font-weight: bold; color: #10365C; line-height: 1.2;">${proj.name}</div>
                    <div style="font-size: 10px; color: #666; line-height: 1.1;">${proj.date || ''}</div>
                  </div>
                  <div style="font-size: 10px; line-height: 1.35; color: #333; margin-left: 15px;">
                    ${proj.desc ? proj.desc.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; line-height: 1.25;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        }
        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          // Certifications are now displayed in the left sidebar, so skip here
          return '';
        }
        if (section === 'languages' && form.languages && form.languages[0]) {
          // Languages are now displayed in the left sidebar, so skip here
          return '';
        }
        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          // Check if custom section has structured data (like employment/education format)
          const customData = form[custom.key];
          if (customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
            // Structured format with multiple entries
          return `
              <div style="margin-bottom: 14px; margin-top: 20px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #10365C; line-height: 1.1;">${custom.label}</div>
                ${customData.map((entry, idx) => `
                  <div style="margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
                      <div style="font-size: 12px; font-weight: bold; color: #10365C; line-height: 1.2;">${entry.title || entry.name || ''}</div>
                      <div style="font-size: 10px; color: #666; line-height: 1.1;">${entry.date || entry.start || ''}${(entry.date || entry.start) && (entry.end) ? ' - ' : ''}${entry.end || ''}</div>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-bottom: 8px; font-style: italic; line-height: 1.2;">${entry.subtitle || entry.company || entry.institution || ''}</div>
                                      <div style="font-size: 10px; line-height: 1.35; color: #333; margin-left: 15px;">
                    ${entry.description ? entry.description.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 2px; line-height: 1.25;">• ${line.trim()}</div>`).join('') : ''}
                  </div>
                  </div>
                `).join('')}
              </div>
            `;
          } else {
            // Simple text format
            return `
              <div style="margin-bottom: 14px; margin-top: 20px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #10365C; line-height: 1.1;">${custom.label}</div>
                <div style="font-size: 11px; line-height: 1.45; color: #333; text-align: justify; margin-bottom: 0;">${customData}</div>
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
      font-family: 'Arial', sans-serif;
      font-size: 10px;
      line-height: 1.2;
      padding: 0px;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT; // Full-height content area with 0 page margins
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
          font-size: 10px;
          line-height: 1.2;
          padding: 0px;
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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 3 }) }); } catch (_) {}

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 3 }) }); } catch (_) {}

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

  // Helper function to create left sidebar cell with dark background
  async function createLeftSidebarCell(profileImageData) {
    const sidebarContent = [
      // Profile Picture
      ...(profileImageData ? [new Paragraph({
        children: [
          new ImageRun({
            data: profileImageData,
            transformation: {
              width: 80,
              height: 80,
            },
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 360 }, // 20px before, 18px after (matching live preview)
      })] : []),

      // Name and Title
      ...(form.firstName ? [
        new Paragraph({
          children: [
            new TextRun({
              text: `${form.firstName} ${form.lastName || ''}`,
              size: 18 * 2,
              bold: true,
              color: 'FFFFFF',
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 }, // 8px margin-bottom (matching live preview) // 4px margin-bottom (matching live preview)
        }),
        ...(form.tagline ? [new Paragraph({
          children: [
            new TextRun({
              text: form.tagline.toUpperCase(),
              size: 12 * 2,
              color: 'FFFFFF',
              font: 'Arial',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 320 }, // 16px margin-bottom (matching live preview)
        })] : [])
      ] : []),

      // DETAILS Section
      new Paragraph({
        children: [
          new TextRun({
            text: 'DETAILS',
            size: 12 * 2,
            bold: true,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 240 }, // 12px margin-bottom + 5px padding-bottom (matching live preview)
        borders: {
          bottom: {
            color: '4a7c59',
            space: 100, // 5px padding-bottom
            style: BorderStyle.SINGLE,
            size: 4,
          },
        },
      }),

      // Contact Details
      ...(form.address ? [new Paragraph({
        children: [
          new TextRun({
            text: form.address,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
      })] : []),

      ...(form.city ? [new Paragraph({
        children: [
          new TextRun({
            text: `${form.city}${form.state ? ', ' + form.state : ''}`,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
      })] : []),

      ...(form.country ? [new Paragraph({
        children: [
          new TextRun({
            text: form.country,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
      })] : []),

      ...(form.phone ? [new Paragraph({
        children: [
          new TextRun({
            text: form.phone,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
      })] : []),

      ...(form.email ? [new Paragraph({
        children: [
          new TextRun({
            text: form.email,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
      })] : []),

      ...(form.linkedin ? [new Paragraph({
        children: [
          new TextRun({
            text: form.linkedin,
            size: 10 * 2,
            color: 'FFFFFF',
            font: 'Arial',
          }),
        ],
        spacing: { after: 200 },
      })] : [])
    ];

    // Add skills section
    if (sections.includes('skills') && form.skills) {
      const skillsArray = Array.isArray(form.skills) 
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim()))) 
        : form.skills.split(',').map(s => s.trim()).filter(s => s);
      
      if (skillsArray.length > 0) {
        sidebarContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'SKILLS',
                size: 12 * 2,
                bold: true,
                color: 'FFFFFF',
                font: 'Arial',
              }),
            ],
            spacing: { after: 120 },
            borders: {
              bottom: {
                color: '4a7c59',
                space: 0,
                style: BorderStyle.SINGLE,
                size: 4,
              },
            },
          })
        );

        skillsArray.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          const skillLevel = typeof skill === 'object' ? skill.level : 'Intermediate';
          
          // Skill name paragraph
          sidebarContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: skillName,
                  size: 10 * 2,
                  bold: true, // Bold to match font-weight: 500 from live preview
                  color: 'FFFFFF',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 40 }, // 2px margin-bottom (matching live preview)
            })
          );
          
          // Skill level blocks on separate line
          const totalBlocks = 40;
          let filledBlocks;
          
          // Calculate filled blocks based on skill level
          if (skillLevel === 'Expert') {
            filledBlocks = Math.round(totalBlocks * 0.9); // 90% for Expert (36 blocks)
          } else if (skillLevel === 'Intermediate') {
            filledBlocks = Math.round(totalBlocks * 0.7); // 70% for Intermediate (28 blocks)
          } else { // Basic
            filledBlocks = Math.round(totalBlocks * 0.4); // 40% for Basic (16 blocks)
          }
          
          const emptyBlocks = totalBlocks - filledBlocks;
          
          sidebarContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}`,
                  size: 8 * 2, // Reduced size for thinner blocks (better height)
                  color: 'FFFFFF',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
            })
          );
        });
      }
    }

    // Add other sidebar sections (languages, certifications, references)
    addOtherSidebarSections(sidebarContent);

    return new TableCell({
      children: sidebarContent,
      width: { size: 35, type: WidthType.PERCENTAGE },
      margins: { top: 320, bottom: 320, left: 300, right: 300 }, // padding: 28px 15px 16px 15px (matching live preview)
      shading: { fill: '10365C' }, // Dark green background
      verticalAlign: "top",
    });
  }

  // Helper function to add other sidebar sections
  function addOtherSidebarSections(sidebarContent) {
    // LANGUAGES Section
    if (sections.includes('languages') && form.languages && form.languages[0]) {
      sidebarContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'LANGUAGES',
              size: 12 * 2,
              bold: true,
              color: 'FFFFFF',
              font: 'Arial',
            }),
          ],
          spacing: { after: 120 },
          borders: {
            bottom: {
              color: '4a7c59',
              space: 0,
              style: BorderStyle.SINGLE,
              size: 4,
            },
          },
        })
      );

      form.languages.forEach(lang => {
        sidebarContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${lang}`,
                size: 10 * 2,
                color: 'FFFFFF',
                font: 'Arial',
              }),
            ],
            spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
          })
        );
      });
    }

    // CERTIFICATIONS Section
    if (sections.includes('certifications') && form.certifications && form.certifications[0]) {
      sidebarContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'CERTIFICATIONS',
              size: 12 * 2,
              bold: true,
              color: 'FFFFFF',
              font: 'Arial',
            }),
          ],
          spacing: { after: 120 },
          borders: {
            bottom: {
              color: '4a7c59',
              space: 0,
              style: BorderStyle.SINGLE,
              size: 4,
            },
          },
        })
      );

      form.certifications.forEach(cert => {
        sidebarContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${cert}`,
                size: 10 * 2,
                color: 'FFFFFF',
                font: 'Arial',
              }),
            ],
            spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
          })
        );
      });
    }

    // REFERENCES Section
    if (sections.includes('references') && form.references && form.references[0]) {
      sidebarContent.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'REFERENCES',
              size: 12 * 2,
              bold: true,
              color: 'FFFFFF',
              font: 'Arial',
            }),
          ],
          spacing: { after: 120 },
          borders: {
            bottom: {
              color: '4a7c59',
              space: 0,
              style: BorderStyle.SINGLE,
              size: 4,
            },
          },
        })
      );

      form.references.forEach(ref => {
        sidebarContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${ref.name || ref}`,
                size: 10 * 2,
                color: 'FFFFFF',
                font: 'Arial',
              }),
            ],
            spacing: { after: 160 }, // 8px margin-bottom (matching live preview)
          })
        );
      });
    }
  }

  // Helper function to create right content cell with white background
  async function createRightContentCell() {
    const contentArray = [];

    // PROFILE Section
    if (sections.includes('summary') && form.summary) {
      contentArray.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROFILE',
              size: 16 * 2,
              bold: true,
              color: '10365C',
              font: 'Arial',
            }),
          ],
          spacing: { before: 400, after: 160 }, // margin-top: 20px, margin-bottom: 8px (matching live preview)
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: form.summary,
              size: 11 * 2,
              color: '333333',
              font: 'Arial',
            }),
          ],
          spacing: { after: 280 }, // margin-bottom: 14px (matching live preview)
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    // EMPLOYMENT HISTORY Section
    if (sections.includes('employment') && form.employment && form.employment[0].jobTitle) {
      contentArray.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EMPLOYMENT HISTORY',
              size: 16 * 2,
              bold: true,
              color: '10365C',
              font: 'Arial',
            }),
          ],
          spacing: { before: 400, after: 200 }, // margin-top: 20px, margin-bottom: 10px (matching live preview)
        })
      );

      form.employment.forEach(job => {
        // Job title and company with dates
        contentArray.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${job.jobTitle}, ${job.company}`,
                size: 12 * 2,
                bold: true,
                color: '10365C',
                font: 'Arial',
              }),
              new TextRun({
                text: '\t',
                size: 12 * 2,
              }),
              new TextRun({
                text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                size: 10 * 2,
                color: '666666',
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 }, // 5px margin-bottom (matching live preview)
            tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
          })
        );

        // Location
        if (job.location) {
          contentArray.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: job.location,
                  size: 10 * 2,
                  italics: true,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 120 }, // 6px margin-bottom (matching live preview)
            })
          );
        }

        // Job description bullets
        if (job.desc) {
          const lines = job.desc.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            contentArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${line.trim()}`,
                    size: 10 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 300 },
              })
            );
          });
        }

        contentArray.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 1 })],
            spacing: { after: 280 }, // 14px margin-bottom (matching live preview)
          })
        );
      });
    }

    // EDUCATION Section
    if (sections.includes('education') && form.education && form.education[0].degree) {
      contentArray.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'EDUCATION',
              size: 16 * 2,
              bold: true,
              color: '10365C',
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );

      form.education.forEach(edu => {
        // Degree and school with dates
        contentArray.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree}, ${edu.school}`,
                size: 12 * 2,
                bold: true,
                color: '10365C',
                font: 'Arial',
              }),
              new TextRun({
                text: '\t',
                size: 12 * 2,
              }),
              new TextRun({
                text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                size: 10 * 2,
                color: '666666',
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
            tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
          })
        );

        // Location
        if (edu.location) {
          contentArray.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.location,
                  size: 10 * 2,
                  italics: true,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }

        // Education description bullets
        if (edu.desc) {
          const lines = edu.desc.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            contentArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${line.trim()}`,
                    size: 10 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 300 },
              })
            );
          });
        }

        contentArray.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 1 })],
            spacing: { after: 280 }, // 14px margin-bottom (matching live preview)
          })
        );
      });
    }

    // PROJECTS Section
    if (sections.includes('projects') && form.projects && form.projects[0].name) {
      contentArray.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PROJECTS',
              size: 16 * 2,
              bold: true,
              color: '10365C',
              font: 'Arial',
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );

      form.projects.forEach(proj => {
        // Project name and date
        contentArray.push(
          new Paragraph({
            children: [
              new TextRun({
                text: proj.name,
                size: 12 * 2,
                bold: true,
                color: '10365C',
                font: 'Arial',
              }),
              new TextRun({
                text: '\t',
                size: 12 * 2,
              }),
              new TextRun({
                text: proj.date || '',
                size: 10 * 2,
                color: '666666',
                font: 'Arial',
              }),
            ],
            spacing: { after: 100 },
            tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
          })
        );

        // Project description bullets
        if (proj.desc) {
          const lines = proj.desc.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            contentArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `• ${line.trim()}`,
                    size: 10 * 2,
                    color: '333333',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 300 },
              })
            );
          });
        }

        contentArray.push(
          new Paragraph({
            children: [new TextRun({ text: '', size: 1 })],
            spacing: { after: 280 }, // 14px margin-bottom (matching live preview)
          })
        );
      });
    }

    // Custom Sections
    customSections.forEach(custom => {
      const customData = form[custom.key];
      if (!customData) return;

      if (typeof customData === 'object' && Array.isArray(customData) && customData.length > 0) {
        // Structured format
        contentArray.push(
          new Paragraph({
            children: [
              new TextRun({
                text: custom.label.toUpperCase(),
                size: 16 * 2,
                bold: true,
                color: '10365C',
                font: 'Arial',
              }),
            ],
            spacing: { before: 300, after: 200 },
          })
        );

        customData.forEach(entry => {
          contentArray.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: entry.title || entry.name || '',
                  size: 12 * 2,
                  bold: true,
                  color: '10365C',
                  font: 'Arial',
                }),
                new TextRun({
                  text: '\t',
                  size: 12 * 2,
                }),
                new TextRun({
                  text: `${entry.date || entry.start || ''}${(entry.date || entry.start) && entry.end ? ' - ' : ''}${entry.end || ''}`,
                  size: 10 * 2,
                  color: '666666',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 100 },
              tabStops: [{ type: TabStopType.RIGHT, position: 7200 }],
            })
          );

          if (entry.subtitle || entry.company || entry.institution) {
            contentArray.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: entry.subtitle || entry.company || entry.institution,
                    size: 10 * 2,
                    italics: true,
                    color: '666666',
                    font: 'Arial',
                  }),
                ],
                spacing: { after: 120 },
              })
            );
          }

          if (entry.description) {
            const lines = entry.description.split('\n').filter(line => line.trim());
            lines.forEach(line => {
              contentArray.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${line.trim()}`,
                      size: 10 * 2,
                      color: '333333',
                      font: 'Arial',
                    }),
                  ],
                  spacing: { after: 40 },
                  indent: { left: 300 },
                })
              );
            });
          }

          contentArray.push(
            new Paragraph({
              children: [new TextRun({ text: '', size: 1 })],
              spacing: { after: 280 }, // 14px margin-bottom (matching live preview)
            })
          );
        });
      } else {
        // Simple text format
        contentArray.push(
          new Paragraph({
            children: [
              new TextRun({
                text: custom.label.toUpperCase(),
                size: 16 * 2,
                bold: true,
                color: '10365C',
                font: 'Arial',
              }),
            ],
            spacing: { before: 300, after: 160 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: customData,
                size: 11 * 2,
                color: '333333',
                font: 'Arial',
              }),
            ],
            spacing: { after: 280 }, // 14px margin-bottom (matching live preview)
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    });

    return new TableCell({
      children: contentArray,
      width: { size: 65, type: WidthType.PERCENTAGE },
      margins: { top: 320, bottom: 320, left: 320, right: 320 }, // padding: 16px 16px (matching live preview)
      verticalAlign: "top",
    });
  }

  // Helper function to create the two-column layout for DOCX
  async function createTwoColumnLayout(profileImageData) {
    return new Table({
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
            // Left Column - Dark Sidebar (35% width)
            await createLeftSidebarCell(profileImageData),
            // Right Column - White Content Area (65% width)
            await createRightContentCell()
          ]
        })
      ]
    });
  }

  // DOCX download handler for Modern Two-Column Template
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

      // Create the two-column layout structure
      const mainTable = await createTwoColumnLayout(profileImageData);
      children.push(mainTable);

      // Create and return the document
      const doc = new Document({
        sections: [{
          children: children,
          properties: {
            page: {
              margin: {
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              },
            },
          },
        }],
      });

      const blob = await Packer.toBlob(doc);
      return blob;

    } catch (error) {
      console.error('DOCX generation error:', error);
      return null;
    }
  }

  return (
    <>
      <HeaderOne />
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
              templateId="template-3" 
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
                  padding: '0px',
                }}
              >
                <div
                  id="cv-preview-export"
                  className="rb-preview-scale cv-template-3"
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
                      padding: '0px',
                      fontFamily: "'Arial', sans-serif",
                      color: "#000",
                      background: '#fff',
                      fontSize: 10,
                      lineHeight: 1.2,
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
