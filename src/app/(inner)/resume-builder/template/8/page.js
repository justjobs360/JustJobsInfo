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
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, TabStopType } from 'docx';

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



  // Resume preview content (WYSIWYG) - Template 8: Jordan Smith Style
  const previewHtml = `
    <div style="font-family: 'Arial', sans-serif; color: #000; min-height: 1040px; max-height: 1131px; font-size: 10px; line-height: 1.4; overflow: hidden; padding: 40px; box-sizing: border-box;">
      
      <!-- Header Section -->
      <div style="margin-bottom: 25px;">
        <div style="font-size: 28px; font-weight: 800; color: #000; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">
          ${form.firstName || 'JORDAN'} ${form.lastName || 'SMITH'}
        </div>
        <div style="font-size: 14px; color: #3b82f6; font-weight: 600; margin-bottom: 12px;">
          ${form.tagline || 'Experienced Technology Executive'}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 15px; color: #666; font-size: 9px; align-items: center;">
          ${form.phone ? `<div style="display: flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.11-2.12a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${form.phone}</div>` : ''}
          ${form.email ? `<div style="display: flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ${form.email}</div>` : ''}
          ${form.linkedin ? `<div style="display: flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> ${form.linkedin}</div>` : ''}
          ${form.city || form.country ? `<div style="display: flex; align-items: center; gap: 4px;"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${form.city ? form.city : ''}${form.city && form.country ? ', ' : ''}${form.country ? form.country : ''}</div>` : ''}
        </div>
      </div>

      <div style="display: flex; gap: 40px;">
        <!-- Left Column (Main Content) -->
        <div style="flex: 1.6;">
          
          <!-- Summary Section -->
          ${form.summary ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">Summary</div>
              <div style="font-size: 10px; line-height: 1.6; color: #333;">${form.summary}</div>
            </div>
          ` : ''}

          <!-- Experience Section -->
          ${form.employment && form.employment[0]?.jobTitle ? `
            <div style="margin-bottom: 25px;">
              <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Experience</div>
              ${form.employment.map((job, idx) => `
                <div style="margin-bottom: 15px;">
                  <div style="font-size: 12px; font-weight: 700; color: #000; margin-bottom: 2px;">${job.jobTitle}</div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 10px; font-weight: 600; color: #3b82f6;">${job.company}</span>
                    <span style="font-size: 9px; color: #888;">|</span>
                    <span style="font-size: 9px; color: #888; display: flex; align-items: center; gap: 3px;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</span>
                    ${job.location ? `
                      <span style="font-size: 9px; color: #888;">|</span>
                      <span style="font-size: 9px; color: #888; display: flex; align-items: center; gap: 3px;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${job.location}</span>
                    ` : ''}
                  </div>
                  ${job.desc ? `
                    <div style="font-size: 9.5px; color: #444; line-height: 1.5; margin-left: 0px;">
                      ${job.desc.split('\n').filter(line => line.trim()).map(line => `
                        <div style="margin-bottom: 4px; display: flex; gap: 8px;">
                          <span style="color: #3b82f6;">•</span>
                          <span>${line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim()}</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Education Section -->
          ${form.education && form.education[0]?.degree ? `
            <div style="margin-bottom: 20px;">
              <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Education</div>
              ${form.education.map((edu, idx) => `
                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; font-weight: 700; color: #000; margin-bottom: 2px;">${edu.degree}</div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                    <span style="font-size: 10px; font-weight: 600; color: #3b82f6;">${edu.school}</span>
                    <span style="font-size: 9px; color: #888;">|</span>
                    <span style="font-size: 9px; color: #888; display: flex; align-items: center; gap: 3px;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> ${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}</span>
                    ${edu.location ? `
                      <span style="font-size: 9px; color: #888;">|</span>
                      <span style="font-size: 9px; color: #888; display: flex; align-items: center; gap: 3px;"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${edu.location}</span>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Dynamic Sections on Left (Projects, Certifications, Custom) -->
          ${sections.map(section => {
    if (['summary', 'employment', 'education', 'skills', 'languages'].includes(section)) return '';
    const customSection = customSections.find(cs => cs.key === section);
    if (customSection) {
      const customData = form[customSection.key];
      return `
                <div style="margin-bottom: 25px;">
                  <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">${customSection.label}</div>
                  <div style="font-size: 9.5px; color: #444; line-height: 1.5;">${typeof customData === 'string' ? customData : JSON.stringify(customData)}</div>
                </div>
              `;
    }
    if (section === 'projects' && form.projects && form.projects[0]?.name) {
      return `
                <div style="margin-bottom: 25px;">
                  <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Projects</div>
                  ${form.projects.map(proj => `
                    <div style="margin-bottom: 12px;">
                      <div style="font-size: 12px; font-weight: 700; color: #000; margin-bottom: 2px;">${proj.name}</div>
                      ${proj.desc ? `<div style="font-size: 9px; color: #666; line-height: 1.4;">${proj.desc}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              `;
    }
    return '';
  }).join('')}
        </div>

        <!-- Right Column (Sidebar) -->
        <div style="flex: 1;">
          
          <!-- Philosophy Section -->
          <div style="margin-bottom: 25px;">
            <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 10px; letter-spacing: 0.5px;">My Life Philosophy</div>
            <div style="font-size: 11px; color: #3b82f6; font-style: italic; font-weight: 500; line-height: 1.5; margin-bottom: 4px;">
              "${form.philosophy || 'Technology, like art, is a soaring exercise of the human imagination'}"
            </div>
            <div style="font-size: 9px; color: #666; text-align: right;">- ${form.philosophyAuthor || 'Daniel Bell'}</div>
          </div>

          <!-- Strengths Section -->
          <div style="margin-bottom: 25px;">
            <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Strengths</div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start;">
              <div style="width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #3b82f6; margin-top: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #000; margin-bottom: 2px;">Strategic Planning</div>
                <div style="font-size: 9px; color: #666; line-height: 1.4;">Led a team of 20+ in developing and executing strategic plans.</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start;">
              <div style="width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #3b82f6; margin-top: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.3 1 4.4 2.6 5.8.6.5 1 1.2 1 2h8.8c.1-.8.4-1.5 1-2C20 13.4 21 11.3 21 9a7 7 0 0 0-7-7z"></path></svg>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #000; margin-bottom: 2px;">Collaboration</div>
                <div style="font-size: 9px; color: #666; line-height: 1.4;">Worked closely with cross-functional teams to drive project success.</div>
              </div>
            </div>
          </div>

          <!-- Skills Section -->
          ${form.skills ? (() => {
      const skillsArray = Array.isArray(form.skills)
        ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
        : form.skills.split(',').map(s => s.trim()).filter(s => s);

      if (skillsArray.length > 0) {
        return `
                <div style="margin-bottom: 25px;">
                  <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 12px; letter-spacing: 0.5px;">Skills</div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${skillsArray.slice(0, 15).map(skill => {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          return `
                        <div style="display: flex; align-items: flex-start; gap: 8px;">
                          <span style="color: #3b82f6; font-size: 10px;">•</span>
                          <span style="font-size: 9.5px; color: #333; font-weight: 600; line-height: 1.2;">${skillName}</span>
                        </div>
                      `;
        }).join('')}
                  </div>
                </div>
              `;
      }
      return '';
    })() : ''}

          <!-- Achievements Section -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 15px; letter-spacing: 0.5px;">Achievements</div>
            
            <div style="display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start;">
              <div style="width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #3b82f6; margin-top: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #000; margin-bottom: 2px;">Client Retention Rate</div>
                <div style="font-size: 9px; color: #666; line-height: 1.4;">Achieved a client retention rate of over 90% throughout my career.</div>
              </div>
            </div>

            <div style="display: flex; gap: 12px; margin-bottom: 15px; align-items: flex-start;">
              <div style="width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #3b82f6; margin-top: 2px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10"></path><path d="M17 4v8a5 5 0 0 1-10 0V4"></path><path d="M5 9h2"></path><path d="M17 9h2"></path></svg>
              </div>
              <div>
                <div style="font-size: 10px; font-weight: 700; color: #000; margin-bottom: 2px;">Team Leadership</div>
                <div style="font-size: 9px; color: #666; line-height: 1.4;">Successfully led diverse teams in high-pressure environments.</div>
              </div>
            </div>
          </div>

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
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      padding: 40px;
      box-sizing: border-box;
      white-space: pre-wrap;
      word-wrap: break-word;
    `;
    document.body.appendChild(tempContainer);

    const pageHeight = A4_HEIGHT - 100; // Account for margins
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
    // Note: For Template 8's two-column layout, splitting is limited to top-level children.
    const childrenNodes = Array.from(tempContainer.children);
    const pages = [];
    let currentPage = document.createElement('div');
    currentPage.style.cssText = `
      width: ${A4_WIDTH}px;
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      padding: 40px;
      box-sizing: border-box;
    `;
    let currentHeight = 0;

    for (let i = 0; i < childrenNodes.length; i++) {
      const section = childrenNodes[i];
      const sectionHeight = section.offsetHeight;

      if (currentHeight + sectionHeight > pageHeight && currentPage.children.length > 0) {
        pages.push(currentPage.innerHTML);
        currentPage = document.createElement('div');
        currentPage.style.cssText = `
          width: ${A4_WIDTH}px;
          font-family: Arial, sans-serif;
          font-size: 11px;
          line-height: 1.4;
          padding: 40px;
          box-sizing: border-box;
        `;
        currentHeight = 0;
      }

      currentPage.appendChild(section.cloneNode(true));
      currentHeight += sectionHeight;
    }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 8 }) }); } catch (_) { }

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
      try { fetch('/api/admin/resume-templates/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId: 8 }) }); } catch (_) { }

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

      // --- Header Section ---
      // Name (Uppercase, Bold)
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${form.firstName || 'JORDAN'} ${form.lastName || 'SMITH'}`.toUpperCase(),
              size: 28 * 2,
              bold: true,
              font: 'Arial',
              color: '000000',
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { after: 120 },
        })
      );

      // Tagline (Blue, Boldish)
      if (form.tagline || true) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: form.tagline || 'Experienced Technology Executive',
                size: 14 * 2,
                bold: true,
                font: 'Arial',
                color: '3b82f6', // Equivalent to #3b82f6
              }),
            ],
            alignment: AlignmentType.LEFT,
            spacing: { after: 240 },
          })
        );
      }

      // Contact Info
      const contactInfo = [];
      if (form.phone) contactInfo.push(new TextRun({ text: "☎ ", color: "3b82f6", font: "Arial", size: 9 * 2 }), new TextRun({ text: form.phone + "   ", size: 9 * 2, font: "Arial", color: "666666" }));
      if (form.email) contactInfo.push(new TextRun({ text: "✉ ", color: "3b82f6", font: "Arial", size: 9 * 2 }), new TextRun({ text: form.email + "   ", size: 9 * 2, font: "Arial", color: "666666" }));
      if (form.linkedin) contactInfo.push(new TextRun({ text: "🔗 ", color: "3b82f6", font: "Arial", size: 9 * 2 }), new TextRun({ text: form.linkedin + "   ", size: 9 * 2, font: "Arial", color: "666666" }));
      if (form.city || form.country) contactInfo.push(new TextRun({ text: "⌖ ", color: "3b82f6", font: "Arial", size: 9 * 2 }), new TextRun({ text: `${form.city || ''}${form.city && form.country ? ', ' : ''}${form.country || ''}`, size: 9 * 2, font: "Arial", color: "666666" }));

      if (contactInfo.length > 0) {
        children.push(
          new Paragraph({
            children: contactInfo,
            alignment: AlignmentType.LEFT,
            spacing: { after: 300 },
          })
        );
      }

      // --- Two-Column Layout (Main Content) ---
      const leftColumn = [];
      const rightColumn = [];

      // -- Left Column Sections --
      // Summary
      if (form.summary) {
        leftColumn.push(createDOCXSectionTitle('SUMMARY'));
        leftColumn.push(
          new Paragraph({
            children: [
              new TextRun({
                text: form.summary,
                size: 10 * 2,
                font: 'Arial',
                color: '333333',
              }),
            ],
            spacing: { after: 300 },
            alignment: AlignmentType.LEFT,
          })
        );
      }

      // Experience
      if (form.employment && form.employment[0]?.jobTitle) {
        leftColumn.push(createDOCXSectionTitle('EXPERIENCE'));
        form.employment.forEach(job => {
          leftColumn.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: job.jobTitle,
                  size: 12 * 2,
                  bold: true,
                  font: 'Arial',
                  color: '000000',
                }),
              ],
              spacing: { before: 120, after: 40 },
            })
          );
          leftColumn.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: job.company || '',
                  size: 10 * 2,
                  bold: true,
                  font: 'Arial',
                  color: '3b82f6',
                }),
                new TextRun({ text: '  |  ', color: '888888', size: 9 * 2 }),
                new TextRun({
                  text: `${job.start}${job.start && job.end ? ' - ' : ''}${job.end}`,
                  size: 9 * 2,
                  font: 'Arial',
                  color: '888888',
                }),
                job.location ? new TextRun({ text: '  |  ', color: '888888', size: 9 * 2 }) : null,
                job.location ? new TextRun({
                  text: `⌖ `,
                  size: 9 * 2,
                  font: 'Arial',
                  color: '3b82f6',
                }) : null,
                job.location ? new TextRun({
                  text: `${job.location}`,
                  size: 9 * 2,
                  font: 'Arial',
                  color: '888888',
                }) : null,
              ].filter(Boolean),
              spacing: { after: 80 },
            })
          );

          if (job.desc) {
            const lines = job.desc.split('\n').filter(line => line.trim());
            lines.forEach(line => {
              leftColumn.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: '• ',
                      color: '3b82f6',
                      size: 10 * 2,
                    }),
                    new TextRun({
                      text: line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim(),
                      size: 9.5 * 2,
                      font: 'Arial',
                      color: '444444',
                    }),
                  ],
                  spacing: { after: 40 },
                  indent: { left: 240 },
                })
              );
            });
          }
        });
      }

      // Education
      if (form.education && form.education[0]?.degree) {
        leftColumn.push(createDOCXSectionTitle('EDUCATION'));
        form.education.forEach(edu => {
          leftColumn.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.degree,
                  size: 12 * 2,
                  bold: true,
                  font: 'Arial',
                  color: '000000',
                }),
              ],
              spacing: { before: 120, after: 40 },
            })
          );
          leftColumn.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: edu.school || '',
                  size: 10 * 2,
                  bold: true,
                  font: 'Arial',
                  color: '3b82f6',
                }),
                new TextRun({ text: '  |  ', color: '888888', size: 9 * 2 }),
                new TextRun({
                  text: `${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end || ''}`,
                  size: 9 * 2,
                  font: 'Arial',
                  color: '888888',
                }),
              ],
              spacing: { after: 80 },
            })
          );
        });
      }

      // Dynamic sections on Left (Projects, etc.)
      sections.forEach(section => {
        if (['summary', 'employment', 'education', 'skills', 'languages'].includes(section)) return;
        const customSection = customSections.find(cs => cs.key === section);
        if (customSection) {
          const customData = form[customSection.key];
          leftColumn.push(createDOCXSectionTitle(customSection.label.toUpperCase()));
          leftColumn.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: typeof customData === 'string' ? customData : JSON.stringify(customData),
                  size: 9.5 * 2,
                  font: 'Arial',
                  color: '444444',
                }),
              ],
              spacing: { after: 300 },
            })
          );
        }
        if (section === 'projects' && form.projects && form.projects[0]?.name) {
          leftColumn.push(createDOCXSectionTitle('PROJECTS'));
          form.projects.forEach(proj => {
            leftColumn.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: proj.name,
                    size: 12 * 2,
                    bold: true,
                    font: 'Arial',
                    color: '000000',
                  }),
                ],
                spacing: { before: 120, after: 40 },
              })
            );
            if (proj.desc) {
              leftColumn.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: proj.desc,
                      size: 9 * 2,
                      font: 'Arial',
                      color: '666666',
                    }),
                  ],
                  spacing: { after: 120 },
                })
              );
            }
          });
        }
      });

      // -- Right Column Sections --
      // Philosophy
      rightColumn.push(createDOCXSectionTitle('MY LIFE PHILOSOPHY'));
      rightColumn.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `"${form.philosophy || 'Technology, like art, is a soaring exercise of the human imagination'}"`,
              size: 11 * 2,
              font: 'Arial',
              italics: true,
              color: '3b82f6',
            }),
          ],
          spacing: { after: 40 },
        })
      );
      rightColumn.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `- ${form.philosophyAuthor || 'Daniel Bell'}`,
              size: 9 * 2,
              font: 'Arial',
              color: '666666',
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { after: 300 },
        })
      );

      // Strengths
      rightColumn.push(createDOCXSectionTitle('STRENGTHS'));
      const strengthData = [
        { symbol: '👤', title: 'Strategic Planning', desc: 'Led a team of 20+ in developing and executing strategic plans.' },
        { symbol: '💡', title: 'Collaboration', desc: 'Worked closely with cross-functional teams to drive project success.' }
      ];
      strengthData.forEach(item => {
        rightColumn.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.symbol + ' ', size: 10 * 2, color: '3b82f6', font: 'Arial' }),
              new TextRun({ text: item.title, size: 10 * 2, bold: true, font: 'Arial' }),
            ],
            spacing: { before: 120, after: 40 },
          })
        );
        rightColumn.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.desc, size: 9 * 2, font: 'Arial', color: '666666' }),
            ],
            spacing: { after: 120, left: 280 },
          })
        );
      });

      // Skills
      if (form.skills) {
        const skillsArray = Array.isArray(form.skills)
          ? form.skills.filter(s => s && (typeof s === 'string' ? s.trim() : (s.name && s.name.trim())))
          : form.skills.split(',').map(s => s.trim()).filter(s => s);

        if (skillsArray.length > 0) {
          rightColumn.push(createDOCXSectionTitle('SKILLS'));
          skillsArray.slice(0, 15).forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill.name;
            rightColumn.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: '• ',
                    color: '3b82f6',
                    size: 10 * 2,
                  }),
                  new TextRun({
                    text: skillName,
                    size: 9.5 * 2,
                    font: 'Arial',
                    bold: true,
                    color: '333333',
                  }),
                ],
                spacing: { after: 40 },
                indent: { left: 140 },
              })
            );
          });
          rightColumn.push(new Paragraph({ spacing: { after: 200 } })); // spacer
        }
      }

      // Achievements
      rightColumn.push(createDOCXSectionTitle('ACHIEVEMENTS'));
      const achievementData = [
        { symbol: '⭐️', title: 'Client Retention Rate', desc: 'Achieved a client retention rate of over 90% throughout my career.' },
        { symbol: '🏆', title: 'Team Leadership', desc: 'Successfully led diverse teams in high-pressure environments.' }
      ];
      achievementData.forEach(item => {
        rightColumn.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.symbol + ' ', size: 10 * 2, color: '3b82f6', font: 'Arial' }),
              new TextRun({ text: item.title, size: 10 * 2, bold: true, font: 'Arial' }),
            ],
            spacing: { before: 120, after: 40 },
          })
        );
        rightColumn.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.desc, size: 9 * 2, font: 'Arial', color: '666666' }),
            ],
            spacing: { after: 120, left: 280 },
          })
        );
      });

      // --- Create the main table ---
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 61.5, type: WidthType.PERCENTAGE },
                  children: leftColumn,
                }),
                new TableCell({
                  width: { size: 38.5, type: WidthType.PERCENTAGE },
                  children: rightColumn,
                  margins: { left: 400 },
                }),
              ],
            }),
          ],
        })
      );

      // Helper function to create section titles with bottom border
      function createDOCXSectionTitle(title) {
        return new Paragraph({
          children: [
            new TextRun({
              text: title,
              size: 10 * 2,
              bold: true,
              color: '888888',
              font: 'Arial',
            }),
          ],
          spacing: { before: 240, after: 120 },
          border: {
            bottom: { color: 'CCCCCC', space: 2, style: BorderStyle.SINGLE, size: 1 },
          },
        });
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
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
                templateId="template-8"
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
