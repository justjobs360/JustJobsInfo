"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderOne from "@/components/header/HeaderOne";
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import html2pdf from 'html2pdf.js';
import htmlDocx from 'html-docx-js/dist/html-docx';

const SECTION_OPTIONS = [
  { key: "personal", label: "Personal Details" },
  { key: "summary", label: "Summary" },
  { key: "employment", label: "Employment History" },
  { key: "education", label: "Education" },
  { key: "skills", label: "Skills" },
  { key: "certifications", label: "Certifications" },
  { key: "languages", label: "Languages" },
  { key: "projects", label: "Projects" },
];

const initialForm = {
  jobTitle: "",
  firstName: "",
  lastName: "",
  tagline: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  moreDetails: false,
  summary: "",
  summaryLines: [],
  employment: [{ jobTitle: "", company: "", start: "", end: "", desc: "", lines: [] }],
  education: [{ degree: "", school: "", start: "", end: "", lines: [] }],
  skills: "",
  skillsLines: [],
  certifications: [""],
  certificationsLines: [],
  languages: [""],
  languagesLines: [],
  projects: [{ name: "", desc: "", lines: [] }],
};

const DEFAULT_SECTIONS = ["personal", "summary", "employment", "education", "skills"];

export default function ResumeEditorPage({ params }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...initialForm, tagline: "", firstName: "annedithB" });
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(true);
  const [sections, setSections] = useState([...DEFAULT_SECTIONS]);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  // 1. Add state for custom sections and custom section naming
  const [customSections, setCustomSections] = useState([]); // [{ key, label }]
  const [newCustomSectionName, setNewCustomSectionName] = useState("");

  // Responsive preview scaling
  const previewWrapperRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const A4_WIDTH = 900; // Increased width
  const A4_HEIGHT = Math.round(900 * 1.414); // Maintain A4 aspect ratio

  useEffect(() => {
    function updateScale() {
      if (!previewWrapperRef.current) return;
      const { height } = previewWrapperRef.current.getBoundingClientRect();
      // Use 90% of the available height for the preview
      const scale = Math.min((height * 0.9) / A4_HEIGHT, 1);
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

  // Progress calculation
  const REVIEW_TAB_KEY = "review";
  const allSectionsWithReview = [...sections, REVIEW_TAB_KEY];
  const progress = allSectionsWithReview.length === 1 ? 100 : Math.round((step / (allSectionsWithReview.length - 1)) * 100);

  // Section navigation
  const goNext = () => { if (step < allSectionsWithReview.length - 1) setStep(step + 1); };
  const goBack = () => { if (step > 0) setStep(step - 1); };

  // Add section
  const handleAddSection = (key) => {
    if (!sections.includes(key)) {
      setSections([...sections, key]);
      setAddSectionOpen(false);
    }
  };
  // Remove section
  const handleRemoveSection = (key) => {
    if (sections.length > 1) {
      setSections(sections.filter((s, i) => i !== step && s !== key));
      setStep((prev) => Math.max(0, prev - 1));
    }
  };

  // Move section up
  const moveSectionUp = (idx) => {
    if (idx > 0) {
      setSections((prev) => {
        const arr = [...prev];
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
        return arr;
      });
      setStep((s) => (s === idx ? idx - 1 : s === idx - 1 ? idx : s));
    }
  };
  // Move section down
  const moveSectionDown = (idx) => {
    if (idx < sections.length - 1) {
      setSections((prev) => {
        const arr = [...prev];
        [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
        return arr;
      });
      setStep((s) => (s === idx ? idx + 1 : s === idx + 1 ? idx : s));
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  // Handle array field changes (employment, education, etc.)
  const handleArrayChange = (section, idx, field, value) => {
    setForm((prev) => {
      const arr = [...prev[section]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...prev, [section]: arr };
    });
    setSaved(false);
  };

  // Add item to array section
  const handleAddArrayItem = (section) => {
    const empty = section === "employment"
      ? { jobTitle: "", company: "", start: "", end: "", desc: "", lines: [] }
      : section === "education"
      ? { degree: "", school: "", start: "", end: "", lines: [] }
      : section === "projects"
      ? { name: "", desc: "", lines: [] }
      : "";
    setForm((prev) => ({ ...prev, [section]: [...prev[section], empty] }));
  };

  // Remove item from array section
  const handleRemoveArrayItem = (section, idx) => {
    setForm((prev) => {
      const arr = [...prev[section]];
      arr.splice(idx, 1);
      return { ...prev, [section]: arr };
    });
  };

  // Insert line handler
  function insertLine(section, idx) {
    setForm(prev => {
      if (section === 'summary') {
        return { ...prev, summaryLines: [...prev.summaryLines, true] };
      }
      if (section === 'skills') {
        return { ...prev, skillsLines: [...prev.skillsLines, true] };
      }
      if (section === 'certifications') {
        return { ...prev, certificationsLines: [...prev.certificationsLines, true] };
      }
      if (section === 'languages') {
        return { ...prev, languagesLines: [...prev.languagesLines, true] };
      }
      if (section === 'employment') {
        const arr = [...prev.employment];
        arr[idx].lines = [...(arr[idx].lines || []), true];
        return { ...prev, employment: arr };
      }
      if (section === 'education') {
        const arr = [...prev.education];
        arr[idx].lines = [...(arr[idx].lines || []), true];
        return { ...prev, education: arr };
      }
      if (section === 'projects') {
        const arr = [...prev.projects];
        arr[idx].lines = [...(arr[idx].lines || []), true];
        return { ...prev, projects: arr };
      }
      return prev;
    });
  }

  // Section renderers
  const sectionRenderers = {
    personal: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Personal Details</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1.5px solid #E3E8F0', fontSize: 16 }} />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" style={{ flex: 1, padding: '12px 14px', borderRadius: 8, border: '1.5px solid #E3E8F0', fontSize: 16 }} />
        </div>
        <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Tagline (e.g. Email, LinkedIn, or a short phrase)" style={{ width: '100%', marginBottom: 12, padding: '12px 14px', borderRadius: 8, border: '1.5px solid #E3E8F0', fontSize: 16 }} />
      </div>
    ),
    summary: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Summary</div>
        <textarea name="summary" value={form.summary} onChange={handleChange} placeholder="Write a short professional summary..." style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E3E8F0", fontSize: 16, minHeight: 80, background: "#F8FAFF" }} />
        <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('summary')}>
          Insert Line
        </button>
      </div>
    ),
    employment: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Employment History</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => handleAddArrayItem("employment")}>+ Add Job</button>
        </div>
        {form.employment.map((job, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 8, padding: 16, marginBottom: 16, background: '#F8FAFF' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <input name="jobTitle" value={job.jobTitle} onChange={e => handleArrayChange("employment", idx, "jobTitle", e.target.value)} placeholder="Job Title" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
              <input name="company" value={job.company} onChange={e => handleArrayChange("employment", idx, "company", e.target.value)} placeholder="Company" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <input name="start" value={job.start} onChange={e => handleArrayChange("employment", idx, "start", e.target.value)} placeholder="Start Date" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
              <input name="end" value={job.end} onChange={e => handleArrayChange("employment", idx, "end", e.target.value)} placeholder="End Date" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            </div>
            <textarea name="desc" value={job.desc} onChange={e => handleArrayChange("employment", idx, "desc", e.target.value)} placeholder="Description" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15, minHeight: 50 }} />
            {form.employment.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "4px 12px", minWidth: 0, marginTop: 8, background: '#F36' }} onClick={() => handleRemoveArrayItem("employment", idx)}>Remove</button>}
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('employment', idx)}>
              Insert Line
            </button>
          </div>
        ))}
      </div>
    ),
    education: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Education</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => handleAddArrayItem("education")}>+ Add Education</button>
        </div>
        {form.education.map((edu, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 8, padding: 16, marginBottom: 16, background: '#F8FAFF' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <input name="degree" value={edu.degree} onChange={e => handleArrayChange("education", idx, "degree", e.target.value)} placeholder="Degree" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
              <input name="school" value={edu.school} onChange={e => handleArrayChange("education", idx, "school", e.target.value)} placeholder="School" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <input name="start" value={edu.start} onChange={e => handleArrayChange("education", idx, "start", e.target.value)} placeholder="Start Year" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
              <input name="end" value={edu.end} onChange={e => handleArrayChange("education", idx, "end", e.target.value)} placeholder="End Year" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            </div>
            {form.education.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "4px 12px", minWidth: 0, marginTop: 8, background: '#F36' }} onClick={() => handleRemoveArrayItem("education", idx)}>Remove</button>}
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('education', idx)}>
              Insert Line
            </button>
          </div>
        ))}
      </div>
    ),
    skills: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Skills</div>
        <input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. JavaScript, React, Leadership" style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E3E8F0", fontSize: 16, marginBottom: 0, background: "#F8FAFF" }} />
        <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('skills')}>
          Insert Line
        </button>
      </div>
    ),
    certifications: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Certifications</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => handleAddArrayItem("certifications")}>+ Add Certification</button>
        </div>
        {form.certifications.map((cert, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <input name="certification" value={cert} onChange={e => handleArrayChange("certifications", idx, undefined, e.target.value)} placeholder="Certification" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            {form.certifications.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "4px 12px", minWidth: 0, background: '#F36' }} onClick={() => handleRemoveArrayItem("certifications", idx)}>Remove</button>}
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('certifications', idx)}>
              Insert Line
            </button>
          </div>
        ))}
      </div>
    ),
    languages: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Languages</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => handleAddArrayItem("languages")}>+ Add Language</button>
        </div>
        {form.languages.map((lang, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <input name="language" value={lang} onChange={e => handleArrayChange("languages", idx, undefined, e.target.value)} placeholder="Language" style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15 }} />
            {form.languages.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "4px 12px", minWidth: 0, background: '#F36' }} onClick={() => handleRemoveArrayItem("languages", idx)}>Remove</button>}
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('languages', idx)}>
              Insert Line
            </button>
          </div>
        ))}
      </div>
    ),
    projects: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>Projects</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => handleAddArrayItem("projects")}>+ Add Project</button>
        </div>
        {form.projects.map((proj, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 8, padding: 16, marginBottom: 16, background: '#F8FAFF' }}>
            <input name="name" value={proj.name} onChange={e => handleArrayChange("projects", idx, "name", e.target.value)} placeholder="Project Name" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15, marginBottom: 8 }} />
            <textarea name="desc" value={proj.desc} onChange={e => handleArrayChange("projects", idx, "desc", e.target.value)} placeholder="Project Description" style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #E3E8F0', fontSize: 15, minHeight: 50 }} />
            {form.projects.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "4px 12px", minWidth: 0, marginTop: 8, background: '#F36' }} onClick={() => handleRemoveArrayItem("projects", idx)}>Remove</button>}
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => insertLine('projects', idx)}>
              Insert Line
            </button>
          </div>
        ))}
      </div>
    ),
    ...customSections.reduce((acc, cs) => {
      acc[cs.key] = () => (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 8 }}>{cs.label}</div>
          <textarea name={cs.key} value={form[cs.key] || ""} onChange={e => setForm(f => ({ ...f, [cs.key]: e.target.value }))} placeholder={`Enter details for ${cs.label}...`} style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid #E3E8F0", fontSize: 16, minHeight: 80, background: "#F8FAFF" }} />
          <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 8, borderRadius: 8 }} onClick={() => setForm(f => ({ ...f, [cs.key + '_lines']: [...(f[cs.key + '_lines'] || []), true] }))}>
            Insert Line
          </button>
        </div>
      );
      return acc;
    }, {}),
  };

  // Render the current section
  const renderSection = (key) => {
    if (key === REVIEW_TAB_KEY) {
      return (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 26, marginBottom: 18 }}>Review & Edit All</div>
          {sections.map(sec => renderSection(sec))}
        </div>
      );
    }
    return sectionRenderers[key] ? sectionRenderers[key]() : null;
  };

  // Resume preview content (WYSIWYG)
  const previewHtml = `
    <div style="padding: 30px 22px; font-family: 'Calibri', Arial, Helvetica, sans-serif; color: #222; min-height: 1040px; font-size: 11.5px; line-height: 1.3;">
     
      ${form.phone ? `<div style='font-size: 11.5px; margin-bottom: 4px; text-align: left;'>${form.phone}</div>` : ''}
      ${form.address ? `<div style='font-size: 11.5px; margin-bottom: 4px; text-align: left;'>${form.address}</div>` : ''}
      ${(form.city || form.country) ? `<div style='font-size: 11.5px; margin-bottom: 4px; text-align: left;'>${form.city}${form.city && form.country ? ', ' : ''}${form.country}</div>` : ''}
      ${form.jobTitle ? `<div style='font-size: 13px; font-weight: 600; margin-top: 10px; margin-bottom: 8px; text-align: left;'>${form.jobTitle}</div>` : ''}
      ${sections.map(section => {
        if (section === 'personal' && form.firstName) {
          return `<div style='font-size: 22px; font-weight: 800; margin-bottom: 2px; letter-spacing: 0.5px; text-align: left;'>${form.firstName} ${form.lastName}</div><div style='font-size: 11.5px; font-weight: 500; margin-bottom: 6px; color: #444; text-align: left;'>${form.tagline ? form.tagline : ''}</div>`;
        }
        if (section === 'summary' && form.summary) {
          let lines = '';
          if (form.summaryLines) lines = form.summaryLines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Summary</div><div style='font-size: 11.5px; color: #444; margin-bottom: 8px; text-align: left;'>${form.summary}</div>${lines}`;
        }
        if (section === 'employment' && form.employment && form.employment[0].jobTitle) {
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Employment</div>${form.employment.map((job, idx) => {
            let lines = '';
            if (job.lines) lines = job.lines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
            return `<div style='font-size: 11.5px; font-weight: 600; text-align: left;'>${job.jobTitle}${job.jobTitle && job.company ? ', ' : ''}${job.company}</div><div style='font-size: 11.5px; color: #444; margin-bottom: 2px; text-align: left;'>${job.start}${job.start && job.end ? ' - ' : ''}${job.end}</div><div style='font-size: 11.5px; color: #444; margin-bottom: 6px; text-align: left;'>${job.desc}</div>${lines}`;
          }).join('')}`;
        }
        if (section === 'education' && form.education && form.education[0].degree) {
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Education</div>${form.education.map((edu, idx) => {
            let lines = '';
            if (edu.lines) lines = edu.lines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
            return `<div style='font-size: 11.5px; font-weight: 600; text-align: left;'>${edu.degree}${edu.degree && edu.school ? ', ' : ''}${edu.school}</div><div style='font-size: 11.5px; color: #444; margin-bottom: 2px; text-align: left;'>${edu.start}${edu.start && edu.end ? ' - ' : ''}${edu.end}</div>${lines}`;
          }).join('')}`;
        }
        if (section === 'skills' && form.skills) {
          let lines = '';
          if (form.skillsLines) lines = form.skillsLines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Skills</div><ul style='font-size: 11.5px; color: #444; margin: 0 0 6px 18px; padding: 0; text-align: left;'>${form.skills.split(',').map(s => `<li>${s.trim()}</li>`).join('')}</ul>${lines}`;
        }
        if (section === 'certifications' && form.certifications && form.certifications[0]) {
          let lines = '';
          if (form.certificationsLines) lines = form.certificationsLines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Certifications</div>${form.certifications.map(cert => `<div style='font-size: 11.5px; color: #444; margin-bottom: 6px; text-align: left;'>${cert}</div>`).join('')}${lines}`;
        }
        if (section === 'languages' && form.languages && form.languages[0]) {
          let lines = '';
          if (form.languagesLines) lines = form.languagesLines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Languages</div>${form.languages.map(lang => `<div style='font-size: 11.5px; color: #444; margin-bottom: 6px; text-align: left;'>${lang}</div>`).join('')}${lines}`;
        }
        if (section === 'projects' && form.projects && form.projects[0].name) {
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>Projects</div>${form.projects.map((proj, idx) => {
            let lines = '';
            if (proj.lines) lines = proj.lines.map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
            return `<div style='font-size: 11.5px; font-weight: 600; text-align: left;'>${proj.name}</div><div style='font-size: 11.5px; color: #444; margin-bottom: 6px; text-align: left;'>${proj.desc}</div>${lines}`;
          }).join('')}`;
        }
        const custom = customSections.find(cs => cs.key === section);
        if (custom) {
          let lines = '';
          if (form[custom.key + '_lines']) lines = form[custom.key + '_lines'].map(() => `<hr style='border: none; border-top: 1px solid #e3e8f0; margin: 10px 0;' />`).join('');
          return `<div style='font-size: 14px; font-weight: 700; color: #222; margin-top: 12px; margin-bottom: 2px; letter-spacing: 1px; text-transform: uppercase; text-align: left;'>${custom.label}</div><div style='font-size: 11.5px; color: #444; margin-bottom: 8px; text-align: left;'>${form[custom.key] || ''}</div>${lines}`;
        }
        return '';
      }).join('')}
    </div>
  `;

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

  // PDF download handler
  const exportRef = useRef(null);
  function handleDownloadPDF() {
    if (!exportRef.current) {
      console.log('PDF export: exportRef.current is null');
      return;
    }
    console.log('PDF export: handleDownloadPDF called, ref is present');
    // Use a short timeout to ensure DOM is updated
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0,
          filename: 'resume.pdf',
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(exportRef.current)
        .save();
    }, 100);
  }
  // DOCX download handler
  function handleDownloadDOCX() {
    const preview = document.querySelector('#cv-preview-export');
    if (!preview) return;
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'></head><body>${preview.innerHTML}</body></html>`;
    const docxBlob = htmlDocx.asBlob(html, { orientation: 'portrait', margins: { top: 850, right: 600, bottom: 850, left: 600 } });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(docxBlob);
    a.download = 'resume.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <>
      <HeaderOne />
      <div style={{ background: "#F5F7FA", minHeight: "100vh", padding: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ maxWidth: 1800, margin: "0 auto", flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Progress Bar */}
          <div style={{ height: 48, background: "#fff", borderBottom: "1.5px solid #E3E8F0", display: "flex", alignItems: "center", padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ fontWeight: 700, color: "#F36", fontSize: 16, marginRight: 18 }}>{progress}%</div>
            <div style={{ flex: 1, height: 6, background: "#F3E6E6", borderRadius: 4, overflow: "hidden", marginRight: 18 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "#F36", borderRadius: 4, transition: "width 0.3s" }} />
            </div>
            <div style={{ color: "#1BAA6D", fontWeight: 600, fontSize: 15, marginRight: 18 }}>Step {step + 1} of {allSectionsWithReview.length}</div>
            <button className="rts-btn btn-primary" style={{ background: "#EAF1FF", color: "#0963D3", fontWeight: 700, fontSize: 16, border: "none", boxShadow: "none", padding: "10px 22px" }} onClick={() => router.push('/resume-builder')}>Change template</button>
          </div>

          {/* Main Two-Column Layout */}
          <div style={{ flex: 1, display: "flex", gap: 56, alignItems: "flex-start", marginTop: 32, padding: "0 32px", minHeight: 0 }}>
            {/* Left: Form Wizard */}
            <div style={{ flex: 1, maxWidth: 700, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 48, minWidth: 340, minHeight: 900, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0 }}>
              {/* Name & Tagline Inputs */}
              {/* Add Section Button and Section Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>Sections</div>
                <div style={{ position: 'relative' }}>
                  <button type="button" className="rts-btn btn-primary" style={{ fontSize: 15, padding: "8px 22px", minWidth: 0, background: '#EAF1FF', color: '#0963D3', fontWeight: 700, border: 'none', boxShadow: 'none' }} onClick={() => setAddSectionOpen((v) => !v)}>
                    + Add Section
                  </button>
                  {addSectionOpen && (
                    <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #E3E8F0', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 10, minWidth: 180 }}>
                      {SECTION_OPTIONS.filter(opt => !sections.includes(opt.key)).map(opt => (
                        <button key={opt.key} type="button" style={{ width: '100%', padding: '12px 18px', background: 'none', border: 'none', textAlign: 'left', fontSize: 15, color: '#222', cursor: 'pointer' }} onClick={() => handleAddSection(opt.key)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Section Tabs with Reorder Controls */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {sections.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', background: (i === step && step !== allSectionsWithReview.length - 1) ? '#EAF1FF' : '#F8FAFF', borderRadius: 8, padding: '6px 12px', border: (i === step && step !== allSectionsWithReview.length - 1) ? '1.5px solid #0963D3' : '1.5px solid #E3E8F0', fontWeight: (i === step && step !== allSectionsWithReview.length - 1) ? 700 : 500, color: (i === step && step !== allSectionsWithReview.length - 1) ? '#0963D3' : '#222', cursor: 'pointer', minWidth: 80 }} onClick={() => setStep(i)}>
                    {SECTION_OPTIONS.find(opt => opt.key === s)?.label || (customSections.find(cs => cs.key === s)?.label) || s}
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 6 }}>
                      <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#ccc' : '#0963D3', fontSize: 14, lineHeight: 1 }} disabled={i === 0} onClick={e => { e.stopPropagation(); moveSectionUp(i); }}>&uarr;</button>
                      <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: i === sections.length - 1 ? 'not-allowed' : 'pointer', color: i === sections.length - 1 ? '#ccc' : '#0963D3', fontSize: 14, lineHeight: 1 }} disabled={i === sections.length - 1} onClick={e => { e.stopPropagation(); moveSectionDown(i); }}>&darr;</button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Render current section */}
              {renderSection(allSectionsWithReview[step])}
              {/* Remove section button (except if only one left) */}
              {sections.length > 1 && (
                <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 14, padding: "10px 24px", minWidth: 0, background: '#F36', color: '#fff', border: 'none', marginBottom: 16, marginTop: 8, alignSelf: 'flex-start' }} onClick={() => handleRemoveSection(allSectionsWithReview[step])}>
                  Remove This Section
                </button>
              )}
              {/* Add Custom Section Button */}
              <div style={{ marginTop: 16 }}>
                {newCustomSectionName === "" ? (
                  <button type="button" className="rts-btn btn-primary" style={{ fontSize: 15, padding: "8px 22px", minWidth: 0, background: '#EAF1FF', color: '#0963D3', fontWeight: 700, border: 'none', boxShadow: 'none' }} onClick={() => setNewCustomSectionName("new")}>+ Add Custom Section</button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newCustomSectionName === "new" ? "" : newCustomSectionName}
                      autoFocus
                      placeholder="Section Name"
                      onChange={e => setNewCustomSectionName(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 15 }}
                    />
                    <button type="button" className="rts-btn btn-primary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0 }} onClick={() => {
                      if (newCustomSectionName && newCustomSectionName !== "new") {
                        const key = `custom_${Date.now()}`;
                        setCustomSections([...customSections, { key, label: newCustomSectionName }]);
                        setSections([...sections, key]);
                        setNewCustomSectionName("");
                      }
                    }}>Add</button>
                    <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 14, padding: "6px 18px", minWidth: 0, background: '#F36', color: '#fff' }} onClick={() => setNewCustomSectionName("")}>Cancel</button>
                  </div>
                )}
              </div>
              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: 'center', marginTop: 32, gap: 18 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {allSectionsWithReview.map((s, i) => (
                    <span key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i === step ? '#0963D3' : '#E3E8F0', display: 'inline-block' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 18, marginLeft: 32 }}>
                  <button
                    type="button"
                    className="rts-btn btn-primary"
                    style={{ fontSize: 18, padding: "14px 36px", minWidth: 120, borderRadius: 999, boxShadow: '0 2px 8px rgba(9,99,211,0.08)', background: step === 0 ? '#E3E8F0' : undefined, color: step === 0 ? '#aaa' : undefined, cursor: step === 0 ? 'not-allowed' : 'pointer', border: 'none' }}
                    onClick={goBack}
                    disabled={step === 0}
                  >
                    Back
                  </button>
                  {step < allSectionsWithReview.length - 1 ? (
                    <button type="button" className="rts-btn btn-primary" style={{ fontSize: 18, padding: "14px 36px", minWidth: 120, borderRadius: 999, boxShadow: '0 2px 8px rgba(9,99,211,0.08)', border: 'none' }} onClick={goNext}>
                      {step === allSectionsWithReview.length - 2 ? 'Review' : 'Next'}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right: Resume Preview */}
            <div style={{ flex: 1, minWidth: 600, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'flex-start', minHeight: 0 }}>
              <div
                ref={previewWrapperRef}
                style={{
                  width: '100%',
                  height: 'calc(100vh - 140px)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: 'transparent',
                  position: 'relative',
                  minHeight: 0,
                }}
              >
                <div
                  id="cv-preview-export"
                  style={{
                    width: A4_WIDTH,
                    height: A4_HEIGHT,
                    background: "#fff",
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 1.5px 6px rgba(0,0,0,0.08)",
                    border: "1.5px solid #E3E8F0",
                    position: "relative",
                    overflow: "hidden",
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    margin: '0 auto',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      padding: '32px 32px',
                      fontFamily: "'Cabin', Arial, sans-serif",
                      color: "#222",
                      background: '#fff',
                      fontSize: 10,
                      boxSizing: 'border-box',
                    }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              </div>
              {/* Download buttons at the bottom, centered, only on last step */}
              {step === allSectionsWithReview.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 40, marginBottom: 24 }}>
                  <button
                    type="button"
                    className="rts-btn btn-primary"
                    style={{
                      fontSize: 16,
                      padding: '12px 32px',
                      minWidth: 140,
                      borderRadius: 8,
                      background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseOver={handleDownloadBtnMouseOver}
                    onMouseOut={handleDownloadBtnMouseOut}
                    onClick={handleDownloadPDF}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2v10m0 0l-3.5-3.5M9 12l3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="14" width="12" height="2" rx="1" fill="#fff" opacity=".3"/></svg>
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="rts-btn btn-primary"
                    style={{
                      fontSize: 16,
                      padding: '12px 32px',
                      minWidth: 140,
                      borderRadius: 8,
                      background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 100%)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      boxShadow: '0 2px 8px rgba(16,185,129,0.10)',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseOver={handleDownloadBtnMouseOver}
                    onMouseOut={handleDownloadBtnMouseOut}
                    onClick={handleDownloadDOCX}
                  >
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2v10m0 0l-3.5-3.5M9 12l3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="14" width="12" height="2" rx="1" fill="#fff" opacity=".3"/></svg>
                    Download DOCX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <BackToTop />
      <FooterOne />
    </>
  );
} 