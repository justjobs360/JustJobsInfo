"use client";
import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  employment: [{ jobTitle: "", company: "", start: "", end: "", location: "", desc: "" }],
  education: [{ degree: "", school: "", start: "", end: "", location: "", desc: "" }],
  skills: [{ name: "", level: "Intermediate" }],
  certifications: [""],
  languages: [""],
  projects: [{ name: "", date: "", desc: "" }],
  profileImage: null, // Add profile image field
};

const DEFAULT_SECTIONS = ["personal", "summary", "employment", "education", "skills"];

export default function ResumeBuilderForm({ onFormChange, onProgressChange, onSectionsChange, onCustomSectionsChange, onStepChange, initialFormData = {}, onDownloadDOCX }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...initialForm, ...initialFormData });
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(true);
  const [sections, setSections] = useState([...DEFAULT_SECTIONS]);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [customSections, setCustomSections] = useState([]);
  const [newCustomSectionName, setNewCustomSectionName] = useState("");

  // Progress calculation
  const REVIEW_TAB_KEY = "review";
  const allSectionsWithReview = [...sections, REVIEW_TAB_KEY];
  const progress = allSectionsWithReview.length === 1 ? 100 : Math.round((step / (allSectionsWithReview.length - 1)) * 100);

  // Notify parent component of form changes
  useEffect(() => {
    if (onFormChange) {
      onFormChange(form);
    }
  }, [form, onFormChange]);

  // Notify parent component of progress changes
  useEffect(() => {
    if (onProgressChange) {
      onProgressChange(progress);
    }
  }, [progress, onProgressChange]);

  // Notify parent component of sections changes
  useEffect(() => {
    if (onSectionsChange) {
      onSectionsChange(sections);
    }
  }, [sections, onSectionsChange]);

  // Notify parent component of custom sections changes
  useEffect(() => {
    if (onCustomSectionsChange) {
      onCustomSectionsChange(customSections);
    }
  }, [customSections, onCustomSectionsChange]);

  // Notify parent component of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm({ ...form, profileImage: event.target.result });
        setSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setForm({ ...form, profileImage: null });
    setSaved(false);
  };

  // Handle array field changes (employment, education, etc.)
  const handleArrayChange = (section, idx, field, value) => {
    setForm((prev) => {
      const arr = [...prev[section]];
      if (field === undefined) {
        // For simple string arrays like skills, certifications, languages
        arr[idx] = value;
      } else {
        // For object arrays like employment, education, projects
        arr[idx] = { ...arr[idx], [field]: value };
      }
      return { ...prev, [section]: arr };
    });
    setSaved(false);
  };

  // Add item to array section
  const handleAddArrayItem = (section) => {
    const empty = section === "employment"
      ? { jobTitle: "", company: "", start: "", end: "", location: "", desc: "", lines: [] }
      : section === "education"
      ? { degree: "", school: "", start: "", end: "", location: "", desc: "", lines: [] }
      : section === "projects"
      ? { name: "", date: "", desc: "", lines: [] }
      : section === "skills"
      ? { name: "", level: "Intermediate" }
      : customSections.find(cs => cs.key === section)
      ? { title: "", date: "", subtitle: "", location: "", description: "" }
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
      // Ensure the section exists and has the required structure
      if (!prev[section]) {
        return prev;
      }

      if (section === 'summary') {
        // For summary, add a new bullet point to the existing text
        const currentSummary = prev.summary || '';
        const newSummary = currentSummary + (currentSummary ? '\n• ' : '• ');
        return { ...prev, summary: newSummary };
      }
      
      if (section === 'skills') {
        // For skills, add a new empty skill with default level
        const currentSkills = Array.isArray(prev.skills) ? prev.skills : [{ name: '', level: 'Intermediate' }];
        return { ...prev, skills: [...currentSkills, { name: '', level: 'Intermediate' }] };
      }
      
      if (section === 'certifications') {
        // For certifications, add a new empty certification
        const currentCerts = Array.isArray(prev.certifications) ? prev.certifications : [''];
        return { ...prev, certifications: [...currentCerts, ''] };
      }
      
      if (section === 'languages') {
        // For languages, add a new empty language
        const currentLangs = Array.isArray(prev.languages) ? prev.languages : [''];
        return { ...prev, languages: [...currentLangs, ''] };
      }
      
      if (section === 'employment') {
        // For employment, add a bullet point to the description
        const arr = [...prev.employment];
        if (arr[idx] && typeof arr[idx] === 'object') {
          const currentDesc = arr[idx].desc || '';
          arr[idx] = { ...arr[idx], desc: currentDesc + (currentDesc ? '\n• ' : '• ') };
          return { ...prev, employment: arr };
        }
        return prev;
      }
      
      if (section === 'education') {
        // For education, add a bullet point to the description
        const arr = [...prev.education];
        if (arr[idx] && typeof arr[idx] === 'object') {
          const currentDesc = arr[idx].desc || '';
          arr[idx] = { ...arr[idx], desc: currentDesc + (currentDesc ? '\n• ' : '• ') };
          return { ...prev, education: arr };
        }
        return prev;
      }
      
      if (section === 'projects') {
        // For projects, add a bullet point to the description
        const arr = [...prev.projects];
        if (arr[idx] && typeof arr[idx] === 'object') {
          const currentDesc = arr[idx].desc || '';
          arr[idx] = { ...arr[idx], desc: currentDesc + (currentDesc ? '\n• ' : '• ') };
          return { ...prev, projects: arr };
        }
        return prev;
      }
      
      // Handle custom sections
      const customSection = customSections.find(cs => cs.key === section);
      if (customSection) {
        const arr = [...prev[section]];
        if (arr[idx] && typeof arr[idx] === 'object') {
          const currentDesc = arr[idx].description || '';
          arr[idx] = { ...arr[idx], description: currentDesc + (currentDesc ? '\n• ' : '• ') };
          return { ...prev, [section]: arr };
        }
        return prev;
      }
      
      return prev;
    });
    
    // Focus the textarea after adding bullet point
    setTimeout(() => {
      const textarea = document.querySelector(`textarea[data-section="${section}"][data-index="${idx}"]`);
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 100);
  }

  // Section renderers
  const sectionRenderers = {
    personal: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Personal Details</div>
        <div className="rb-row" style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
        </div>
        <input name="tagline" value={form.tagline} onChange={handleChange} placeholder="Tagline (e.g. Professional Title or Brief Description)" style={{ width: '100%', marginBottom: 10, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
        <div className="rb-row" style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email Address" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
        </div>
        <div className="rb-row" style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
          <input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="LinkedIn URL" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
        </div>
        <input name="country" value={form.country} onChange={handleChange} placeholder="Country" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #E3E8F0', fontSize: 14 }} />
        
        {/* Profile Image Upload */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#222' }}>Profile Image (Optional)</div>
          {form.profileImage ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img 
                src={form.profileImage} 
                alt="Profile" 
                style={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  border: '2px solid #E3E8F0'
                }} 
              />
              <button 
                type="button" 
                className="rts-btn btn-secondary" 
                style={{ 
                  fontSize: 12, 
                  padding: "6px 12px", 
                  background: '#F36', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 6 
                }} 
                onClick={handleRemoveImage}
              >
                Remove
              </button>
            </div>
          ) : (
            <div style={{
              border: '2px dashed #E3E8F0',
              borderRadius: 8,
              padding: '20px',
              textAlign: 'center',
              background: '#F8FAFF',
              cursor: 'pointer',
              transition: 'border-color 0.2s'
            }} onClick={() => document.getElementById('profile-image-input').click()}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" style={{ marginBottom: 8, opacity: 0.6 }}>
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
              </svg>
              <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Click to upload profile image</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>JPG, PNG up to 2MB</div>
            </div>
          )}
          <input 
            id="profile-image-input"
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            style={{ display: 'none' }}
          />
        </div>
      </div>
    ),
    summary: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Summary</div>
        <textarea name="summary" value={form.summary} onChange={handleChange} placeholder="Write a short professional summary..." style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1.5px solid #E3E8F0", fontSize: 14, minHeight: 60, background: "#F8FAFF" }} />
        <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 12, padding: "4px 14px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', marginTop: 6, borderRadius: 6 }} onClick={() => insertLine('summary', 0)}>
          + Add Bullet Point
        </button>
      </div>
    ),
    employment: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Employment History</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("employment")}>+ Add Job</button>
        </div>
        {form.employment.map((job, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 6, padding: 12, marginBottom: 12, background: '#F8FAFF' }}>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="jobTitle" value={job.jobTitle} onChange={e => handleArrayChange("employment", idx, "jobTitle", e.target.value)} placeholder="Job Title" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
              <input name="company" value={job.company} onChange={e => handleArrayChange("employment", idx, "company", e.target.value)} placeholder="Company" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="start" value={job.start} onChange={e => handleArrayChange("employment", idx, "start", e.target.value)} placeholder="Start Date" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
              <input name="end" value={job.end} onChange={e => handleArrayChange("employment", idx, "end", e.target.value)} placeholder="End Date" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="location" value={job.location || ''} onChange={e => handleArrayChange("employment", idx, "location", e.target.value)} placeholder="Location (e.g. Charleston, SC)" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <textarea 
              name="desc" 
              value={job.desc} 
              onChange={e => handleArrayChange("employment", idx, "desc", e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const currentValue = e.target.value;
                  const cursorPosition = e.target.selectionStart;
                  const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
                  handleArrayChange("employment", idx, "desc", newValue);
                  setTimeout(() => {
                    e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                  }, 0);
                }
              }}
              placeholder="Description (Enter for new line)" 
              style={{ 
                width: '100%', 
                padding: '6px 10px', 
                borderRadius: 4, 
                border: '1px solid #E3E8F0', 
                fontSize: 13, 
                minHeight: 40, 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                resize: 'vertical'
              }}
              data-section="employment"
              data-index={idx}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 11, padding: "4px 12px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', borderRadius: 4, height: "28px" }} onClick={() => insertLine('employment', idx)}>
                + Add Bullet Point
              </button>
              {form.employment.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("employment", idx)}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
    ),
    education: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Education</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("education")}>+ Add Education</button>
        </div>
        {form.education.map((edu, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 6, padding: 12, marginBottom: 12, background: '#F8FAFF' }}>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="degree" value={edu.degree} onChange={e => handleArrayChange("education", idx, "degree", e.target.value)} placeholder="Degree" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
              <input name="school" value={edu.school} onChange={e => handleArrayChange("education", idx, "school", e.target.value)} placeholder="School" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="start" value={edu.start} onChange={e => handleArrayChange("education", idx, "start", e.target.value)} placeholder="Start Year" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
              <input name="end" value={edu.end} onChange={e => handleArrayChange("education", idx, "end", e.target.value)} placeholder="End Year" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <div className="rb-row" style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="location" value={edu.location || ''} onChange={e => handleArrayChange("education", idx, "location", e.target.value)} placeholder="Location (e.g. Charleston, SC)" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <textarea 
              name="desc" 
              value={edu.desc || ''} 
              onChange={e => handleArrayChange("education", idx, "desc", e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const currentValue = e.target.value;
                  const cursorPosition = e.target.selectionStart;
                  const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
                  handleArrayChange("education", idx, "desc", newValue);
                  setTimeout(() => {
                    e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                  }, 0);
                }
              }}
              placeholder="Additional details (e.g. GPA, activities, honors) (Enter to add bullet point)" 
              style={{ 
                width: '100%', 
                padding: '6px 10px', 
                borderRadius: 4, 
                border: '1px solid #E3E8F0', 
                fontSize: 13, 
                minHeight: 40, 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                resize: 'vertical'
              }}
              data-section="education"
              data-index={idx}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 11, padding: "4px 12px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', borderRadius: 4, height: "28px" }} onClick={() => insertLine('education', idx)}>
                + Add Bullet Point
              </button>
              {form.education.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("education", idx)}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
    ),
    skills: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Skills</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("skills")}>+ Add Skill</button>
        </div>
        {Array.isArray(form.skills) ? (
          form.skills.map((skill, idx) => (
            <div key={idx} className="rb-skills-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <input 
                name="skill" 
                value={typeof skill === 'object' ? skill.name || '' : skill || ''} 
                onChange={e => {
                  if (typeof skill === 'object') {
                    handleArrayChange("skills", idx, "name", e.target.value);
                  } else {
                    // Convert simple string to object format
                    const newSkill = { name: e.target.value, level: 'Intermediate' };
                    handleArrayChange("skills", idx, undefined, newSkill);
                  }
                }} 
                placeholder="Skill" 
                style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} 
              />
              <select
                value={typeof skill === 'object' ? skill.level || 'Intermediate' : 'Intermediate'}
                onChange={e => {
                  if (typeof skill === 'object') {
                    handleArrayChange("skills", idx, "level", e.target.value);
                  } else {
                    // Convert simple string to object format
                    const newSkill = { name: skill || '', level: e.target.value };
                    handleArrayChange("skills", idx, undefined, newSkill);
                  }
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 4,
                  border: '1px solid #E3E8F0',
                  fontSize: 13,
                  background: '#fff',
                  width: 100,
                  cursor: 'pointer',
                  color: '#222',
                  fontFamily: 'inherit'
                }}
              >
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
              {form.skills.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("skills", idx)}>Remove</button>}
            </div>
          ))
        ) : (
          <div className="rb-skills-row" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input 
              name="skills" 
              value={typeof form.skills === 'object' ? form.skills.name || '' : form.skills || ''} 
              onChange={e => {
                if (typeof form.skills === 'object') {
                  handleChange({ target: { name: 'skills', value: { ...form.skills, name: e.target.value } } });
                } else {
                  handleChange({ target: { name: 'skills', value: { name: e.target.value, level: 'Intermediate' } } });
                }
              }} 
              placeholder="e.g. JavaScript, React, Leadership" 
              style={{ flex: 1, padding: "8px 12px", borderRadius: 6, border: "1.5px solid #E3E8F0", fontSize: 14, marginBottom: 0, background: "#F8FAFF" }} 
            />
            <select
              value={typeof form.skills === 'object' ? form.skills.level || 'Intermediate' : 'Intermediate'}
              onChange={e => {
                if (typeof form.skills === 'object') {
                  handleChange({ target: { name: 'skills', value: { ...form.skills, level: e.target.value } } });
                } else {
                  handleChange({ target: { name: 'skills', value: { name: form.skills || '', level: e.target.value } } });
                }
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1.5px solid #E3E8F0',
                fontSize: 14,
                background: '#fff',
                width: 100,
                cursor: 'pointer',
                color: '#222',
                fontFamily: 'inherit'
              }}
            >
              <option value="Basic">Basic</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        )}
      </div>
    ),
    certifications: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Certifications</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("certifications")}>+ Add Certification</button>
        </div>
        {form.certifications.map((cert, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <input name="certification" value={cert} onChange={e => handleArrayChange("certifications", idx, undefined, e.target.value)} placeholder="Certification" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            {form.certifications.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("certifications", idx)}>Remove</button>}

          </div>
        ))}
      </div>
    ),
    languages: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Languages</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("languages")}>+ Add Language</button>
        </div>
        {form.languages.map((lang, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <input name="language" value={lang} onChange={e => handleArrayChange("languages", idx, undefined, e.target.value)} placeholder="Language" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            {form.languages.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("languages", idx)}>Remove</button>}

          </div>
        ))}
      </div>
    ),
    projects: () => (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Projects</div>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem("projects")}>+ Add Project</button>
        </div>
        {form.projects.map((proj, idx) => (
          <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 6, padding: 12, marginBottom: 12, background: '#F8FAFF' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <input name="name" value={proj.name} onChange={e => handleArrayChange("projects", idx, "name", e.target.value)} placeholder="Project Name" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
              <input name="date" value={proj.date || ''} onChange={e => handleArrayChange("projects", idx, "date", e.target.value)} placeholder="Date (e.g. May 2024)" style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} />
            </div>
            <textarea 
              name="desc" 
              value={proj.desc} 
              onChange={e => handleArrayChange("projects", idx, "desc", e.target.value)} 
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const currentValue = e.target.value;
                  const cursorPosition = e.target.selectionStart;
                  const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
                  handleArrayChange("projects", idx, "desc", newValue);
                  setTimeout(() => {
                    e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                  }, 0);
                }
              }}
              placeholder="Project Description (Enter for new line)" 
              style={{ 
                width: '100%', 
                padding: '6px 10px', 
                borderRadius: 4, 
                border: '1px solid #E3E8F0', 
                fontSize: 13, 
                minHeight: 40, 
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                resize: 'vertical'
              }}
              data-section="projects"
              data-index={idx}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 11, padding: "4px 12px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', borderRadius: 4, height: "28px" }} onClick={() => insertLine('projects', idx)}>
                + Add Bullet Point
              </button>
              {form.projects.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem("projects", idx)}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
    ),
    ...customSections.reduce((acc, cs) => {
      acc[cs.key] = () => {
        const handleCustomSectionChange = (e) => {
          setForm(f => ({ ...f, [cs.key]: e.target.value }));
        };
        
        const handleCustomSectionLine = () => {
          setForm(f => ({ ...f, [cs.key + '_lines']: [...(f[cs.key + '_lines'] || []), true] }));
        };

        // Check if custom section has structured data
        const customData = form[cs.key];
        const isStructured = customData && typeof customData === 'object' && Array.isArray(customData) && customData.length > 0;
        
        if (isStructured) {
          // Structured format with multiple entries
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{cs.label}</div>
                <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "6px 20px", minWidth: 0, height: "32px" }} onClick={() => handleAddArrayItem(cs.key)}>+ Add Entry</button>
              </div>
              {customData.map((entry, idx) => (
                <div key={idx} style={{ border: '1px solid #E3E8F0', borderRadius: 6, padding: 12, marginBottom: 12, background: '#F8FAFF' }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                    <input 
                      name="title" 
                      value={entry.title || entry.name || ''} 
                      onChange={e => handleArrayChange(cs.key, idx, "title", e.target.value)} 
                      placeholder="Title/Name" 
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} 
                    />
                    <input 
                      name="date" 
                      value={entry.date || entry.start || ''} 
                      onChange={e => handleArrayChange(cs.key, idx, "date", e.target.value)} 
                      placeholder="Date" 
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                    <input 
                      name="subtitle" 
                      value={entry.subtitle || entry.company || entry.institution || ''} 
                      onChange={e => handleArrayChange(cs.key, idx, "subtitle", e.target.value)} 
                      placeholder="Subtitle/Company/Institution" 
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} 
                    />
                    <input 
                      name="location" 
                      value={entry.location || ''} 
                      onChange={e => handleArrayChange(cs.key, idx, "location", e.target.value)} 
                      placeholder="Location" 
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 4, border: '1px solid #E3E8F0', fontSize: 13 }} 
                    />
                  </div>
                  <textarea 
                    name="description" 
                    value={entry.description || ''} 
                    onChange={e => handleArrayChange(cs.key, idx, "description", e.target.value)} 
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const currentValue = e.target.value;
                        const cursorPosition = e.target.selectionStart;
                        const newValue = currentValue.slice(0, cursorPosition) + '\n' + currentValue.slice(cursorPosition);
                        handleArrayChange(cs.key, idx, "description", newValue);
                        setTimeout(() => {
                          e.target.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
                        }, 0);
                      }
                    }}
                    placeholder="Description (Enter to add bullet point)" 
                    style={{ 
                      width: '100%', 
                      padding: '6px 10px', 
                      borderRadius: 4, 
                      border: '1px solid #E3E8F0', 
                      fontSize: 13, 
                      minHeight: 40, 
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      resize: 'vertical'
                    }}
                    data-section={cs.key}
                    data-index={idx}
                  />
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 11, padding: "4px 12px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', borderRadius: 4, height: "28px" }} onClick={() => insertLine(cs.key, idx)}>
                      + Add Bullet Point
                    </button>
                    {customData.length > 1 && <button type="button" className="rts-btn btn-primary" style={{ fontSize: 11, padding: "3px 10px", minWidth: 0, background: '#F36', height: "28px" }} onClick={() => handleRemoveArrayItem(cs.key, idx)}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>
          );
        } else {
          // Simple text format
          return (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 6 }}>{cs.label}</div>
              <textarea 
                name={cs.key} 
                value={form[cs.key] || ""} 
                onChange={handleCustomSectionChange} 
                placeholder={`Enter details for ${cs.label}...`} 
                style={{ 
                  width: "100%", 
                  padding: "8px 12px", 
                  borderRadius: 6, 
                  border: "1.5px solid #E3E8F0", 
                  fontSize: 14, 
                  minHeight: 60, 
                  background: "#F8FAFF",
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  resize: 'vertical'
                }} 
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 12, padding: "4px 14px", minWidth: 0, background: '#e3e8f0', color: '#222', border: 'none', borderRadius: 6 }} onClick={handleCustomSectionLine}>
                  Insert Line
                </button>
                <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "4px 14px", minWidth: 0, background: '#0963D3', color: '#fff', border: 'none', borderRadius: 6 }} onClick={() => {
                  // Convert to structured format
                  const currentText = form[cs.key] || '';
                  setForm(f => ({ 
                    ...f, 
                    [cs.key]: [{ 
                      title: '', 
                      date: '', 
                      subtitle: '', 
                      location: '', 
                      description: currentText 
                    }] 
                  }));
                }}>
                  Convert to Structured Format
                </button>
              </div>
            </div>
          );
        }
      };
      return acc;
    }, {}),
  };

  // Render the current section
  const renderSection = (key) => {
    if (key === REVIEW_TAB_KEY) {
      return (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 14 }}>Review & Edit All</div>
          {sections.map(sec => (
            <div key={sec}>
              {renderSection(sec)}
            </div>
          ))}
          
          {/* Download Section - Always visible in form */}
          <div className="rb-download-section" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: 20, 
            marginTop: 40, 
            marginBottom: 24,
            padding: '24px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '16px',
            border: '2px solid #0ea5e9',
            boxShadow: '0 4px 20px rgba(14, 165, 233, 0.15)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0c4a6e',
                marginBottom: '8px'
              }}>
                🎉 Your Resume is Ready!
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5'
              }}>
                Download your professionally formatted resume
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 16,
              flexWrap: 'wrap'
            }}>
                                  <button
                      type="button"
                      className="rts-btn btn-primary"
                      style={{
                        fontSize: 18,
                        padding: "14px 36px",
                        minWidth: 120,
                        borderRadius: 999,
                        boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        transition: 'all 0.3s ease',
                      }}
                      onClick={() => {
                        // Trigger download from parent component
                        if (onDownloadDOCX) {
                          onDownloadDOCX();
                        } else {
                          // Fallback: show message to user
                          alert('Please use the download button in the preview area to download your resume.');
                        }
                      }}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 18 18"><path d="M9 2v10m0 0l-3.5-3.5M9 12l3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="14" width="12" height="2" rx="1" fill="#fff" opacity=".3"/></svg>
                      Download DOCX
                    </button>
            </div>
          </div>
        </div>
      );
    }
    return sectionRenderers[key] ? sectionRenderers[key]() : null;
  };

  return (
    <div className="rb-form" style={{ flex: 1, width: '100%', background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', minHeight: 0 }}>
      <style>{`
        /* Responsive form container */
        @media (max-width: 1200px) {
          .rb-form { 
            padding: 40px !important; 
            max-width: 100% !important; 
          }
        }
        
        @media (max-width: 1024px) {
          .rb-form { 
            padding: 32px !important; 
            width: 100% !important; 
            max-width: 100% !important; 
          }
        }
        
        @media (max-width: 768px) {
          .rb-form { 
            padding: 24px !important; 
            border-radius: 12px !important; 
          }
          .rb-form input, .rb-form textarea, .rb-form button { 
            font-size: 14px !important; 
          }
          .rb-form .rts-btn { 
            padding: 10px 18px !important; 
          }
        }
        
        @media (max-width: 640px) {
          .rb-form { 
            padding: 20px !important; 
            margin: 0 8px !important; 
          }
          .rb-row { 
            flex-direction: column !important; 
            gap: 12px !important; 
          }
          .rb-form input, .rb-form textarea, .rb-form select { 
            width: 100% !important; 
            max-width: 100% !important; 
            min-width: 0 !important; 
          }
        }
        
                @media (max-width: 480px) {
          .rb-form { 
            padding: 16px !important; 
            border-radius: 12px !important; 
            margin: 0 4px !important; 
            box-shadow: 0 1px 8px rgba(0,0,0,0.05) !important; 
          }
          .rb-row { 
            gap: 8px !important; 
          }
          .rb-form input, .rb-form textarea, .rb-form select { 
            font-size: 13px !important; 
            padding: 10px 12px !important; 
          }
          .rb-form .rts-btn { 
            font-size: 13px !important; 
            padding: 10px 14px !important; 
            min-width: 0 !important; 
          }
          .rb-tabs { 
            gap: 6px !important; 
          }
          .rb-tabs > div { 
            min-width: auto !important; 
            padding: 6px 10px !important; 
            font-size: 11px !important; 
          }
          .rb-card { 
            padding: 10px !important; 
          }
          .rb-sections-bar { 
            flex-direction: column !important; 
            align-items: stretch !important; 
            gap: 10px !important; 
          }
          .rb-add-menu { 
            left: 0 !important; 
            right: 0 !important; 
            min-width: 100% !important; 
          }
          .rb-form-nav { 
            flex-direction: column !important; 
            gap: 12px !important; 
            }
          .rb-form-nav .rts-btn { 
            width: 100% !important; 
            border-radius: 10px !important; 
          }
        }
        
        /* Skills section responsiveness */
        @media (max-width: 640px) {
          .rb-form .rb-skills-row { 
            flex-direction: column !important; 
            gap: 8px !important; 
          }
          .rb-form .rb-skills-row select { 
            min-width: 100% !important; 
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
        
        /* Navigation responsiveness */
        @media (max-width: 768px) {
          .rb-form-nav { 
            flex-direction: column !important; 
            gap: 12px !important; 
            margin-left: 0 !important;
          }
          .rb-form-nav .rts-btn { 
            width: 100% !important; 
            border-radius: 10px !important; 
            font-size: 16px !important;
            padding: 12px 24px !important;
            min-width: 100px !important;
          }
        }
        
        @media (max-width: 480px) {
          .rb-form-nav .rts-btn { 
            font-size: 14px !important;
            padding: 10px 20px !important;
          }
        }
      `}</style>
      {/* Add Section Button and Section Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 18 }}>Sections</div>
        <div style={{ position: 'relative' }}>
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#EAF1FF', color: '#0963D3', fontWeight: 700, border: 'none', boxShadow: 'none' }} onClick={() => setAddSectionOpen((v) => !v)}>
            + Add Section
          </button>
          {addSectionOpen && (
            <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #E3E8F0', borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', zIndex: 10, minWidth: 180 }}>
              {SECTION_OPTIONS.filter(opt => !sections.includes(opt.key)).map(opt => (
                <button key={opt.key} type="button" style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, color: '#222', cursor: 'pointer' }} onClick={() => handleAddSection(opt.key)}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section Tabs with Reorder Controls */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {sections.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', background: (i === step && step !== allSectionsWithReview.length - 1) ? '#EAF1FF' : '#F8FAFF', borderRadius: 6, padding: '4px 10px', border: (i === step && step !== allSectionsWithReview.length - 1) ? '1.5px solid #0963D3' : '1.5px solid #E3E8F0', fontWeight: (i === step && step !== allSectionsWithReview.length - 1) ? 700 : 500, color: (i === step && step !== allSectionsWithReview.length - 1) ? '#0963D3' : '#222', cursor: 'pointer', minWidth: 70, fontSize: 12 }} onClick={() => setStep(i)}>
            {SECTION_OPTIONS.find(opt => opt.key === s)?.label || (customSections.find(cs => cs.key === s)?.label) || s}
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 4 }}>
              <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? '#ccc' : '#0963D3', fontSize: 12, lineHeight: 1 }} disabled={i === 0} onClick={e => { e.stopPropagation(); moveSectionUp(i); }}>&uarr;</button>
              <button type="button" style={{ background: 'none', border: 'none', padding: 0, cursor: i === sections.length - 1 ? 'not-allowed' : 'pointer', color: i === sections.length - 1 ? '#ccc' : '#0963D3', fontSize: 12, lineHeight: 1 }} disabled={i === sections.length - 1} onClick={e => { e.stopPropagation(); moveSectionDown(i); }}>&darr;</button>
            </div>
          </div>
        ))}
      </div>

      {/* Render current section */}
      {renderSection(allSectionsWithReview[step])}

      {/* Remove section button (except if only one left) */}
      {sections.length > 1 && (
        <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 12, padding: "8px 20px", minWidth: 0, background: '#F36', color: '#fff', border: 'none', marginBottom: 12, marginTop: 6, alignSelf: 'flex-start' }} onClick={() => handleRemoveSection(allSectionsWithReview[step])}>
          Remove This Section
        </button>
      )}

      {/* Add Custom Section Button */}
      <div style={{ marginTop: 12 }}>
        {newCustomSectionName === "" ? (
          <button type="button" className="rts-btn btn-primary" style={{ fontSize: 13, padding: "6px 18px", minWidth: 0, background: '#EAF1FF', color: '#0963D3', fontWeight: 700, border: 'none', boxShadow: 'none' }} onClick={() => setNewCustomSectionName("new")}>+ Add Custom Section</button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              type="text"
              value={newCustomSectionName === "new" ? "" : newCustomSectionName}
              autoFocus
              placeholder="Section Name"
              onChange={e => setNewCustomSectionName(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 4, border: '1.5px solid #E3E8F0', fontSize: 13 }}
            />
            <button type="button" className="rts-btn btn-primary" style={{ fontSize: 12, padding: "4px 14px", minWidth: 0 }} onClick={() => {
              if (newCustomSectionName && newCustomSectionName !== "new") {
                const key = `custom_${Date.now()}`;
                setCustomSections([...customSections, { key, label: newCustomSectionName }]);
                setSections([...sections, key]);
                setNewCustomSectionName("");
              }
            }}>Add</button>
            <button type="button" className="rts-btn btn-secondary" style={{ fontSize: 12, padding: "4px 14px", minWidth: 0, background: '#F36', color: '#fff' }} onClick={() => setNewCustomSectionName("")}>Cancel</button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="rb-form-nav" style={{ display: "flex", justifyContent: "center", alignItems: 'center', marginTop: 32, gap: 18 }}>
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
          
          {/* Review Button - Only show when not on review step and not on second-to-last step */}
          {step < allSectionsWithReview.length - 2 && (
            <button
              type="button"
              className="rts-btn btn-primary"
              style={{ 
                fontSize: 18, 
                padding: "14px 36px", 
                minWidth: 120, 
                borderRadius: 999, 
                boxShadow: '0 2px 8px rgba(16,185,129,0.08)', 
                background: '#10b981', 
                color: '#fff', 
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setStep(allSectionsWithReview.length - 1)}
            >
              Review
            </button>
          )}
          
          {step < allSectionsWithReview.length - 1 ? (
            <button type="button" className="rts-btn btn-primary" style={{ fontSize: 18, padding: "14px 36px", minWidth: 120, borderRadius: 999, boxShadow: '0 2px 8px rgba(9,99,211,0.08)', border: 'none' }} onClick={goNext}>
              {step === allSectionsWithReview.length - 2 ? 'Review' : 'Next'}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
} 