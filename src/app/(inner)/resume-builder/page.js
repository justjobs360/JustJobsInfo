"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import ResumeTemplateGrid from '@/components/resume/ResumeTemplateGrid';
import ResumeEditor from '@/components/resume/ResumeEditor';
import './resume-builder.css';

export default function ResumeBuilderPage() {
    const { user, isAuthenticated } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('templates');

    // Mock templates data - in production, this would come from your database
    const templates = [
        {
            id: 1,
            title: "Modern Professional",
            category: "free",
            tags: ["modern", "professional", "clean"],
            thumbnail: null,
            editableHtml: `
                <div class="resume-template modern-professional">
                    <header data-section="header" contenteditable="true">
                        <h1 class="name">John Doe</h1>
                        <div class="contact-info">
                            <span class="email">john.doe@email.com</span>
                            <span class="phone">+1 (555) 123-4567</span>
                            <span class="location">New York, NY</span>
                        </div>
                    </header>
                    <section data-section="summary" contenteditable="true">
                        <h2>Professional Summary</h2>
                        <p>Experienced professional with expertise in [your field]. Proven track record of [key achievements].</p>
                    </section>
                    <section data-section="experience" contenteditable="true">
                        <h2>Work Experience</h2>
                        <div class="job">
                            <h3>Job Title</h3>
                            <div class="company-date">Company Name | 2020 - Present</div>
                            <ul>
                                <li>Key achievement or responsibility</li>
                                <li>Another achievement with metrics</li>
                            </ul>
                        </div>
                    </section>
                    <section data-section="education" contenteditable="true">
                        <h2>Education</h2>
                        <div class="education-item">
                            <h3>Degree Name</h3>
                            <div class="school-date">University Name | Year</div>
                        </div>
                    </section>
                    <section data-section="skills" contenteditable="true">
                        <h2>Skills</h2>
                        <ul class="skills-list">
                            <li>Skill 1</li>
                            <li>Skill 2</li>
                            <li>Skill 3</li>
                        </ul>
                    </section>
                </div>
            `
        },
        {
            id: 2,
            title: "Clean Minimal",
            category: "free",
            tags: ["minimal", "clean", "simple"],
            thumbnail: null,
            editableHtml: `
                <div class="resume-template minimal-clean">
                    <header data-section="header" contenteditable="true">
                        <h1 class="name">Emma Wilson</h1>
                        <div class="contact-info">
                            emma.wilson@email.com • +1 (555) 234-5678 • Boston, MA
                        </div>
                    </header>
                    <section data-section="summary" contenteditable="true">
                        <p>Dedicated professional with strong analytical skills and attention to detail. Experienced in project management and team collaboration.</p>
                    </section>
                    <section data-section="experience" contenteditable="true">
                        <h2>Experience</h2>
                        <div class="job">
                            <h3>Project Manager</h3>
                            <div class="company-date">Tech Solutions Inc., 2021-Present</div>
                            <ul>
                                <li>Led cross-functional teams of 10+ members to deliver projects on time</li>
                                <li>Improved project delivery efficiency by 25% through process optimization</li>
                                <li>Managed budgets exceeding $500K with zero cost overruns</li>
                            </ul>
                        </div>
                    </section>
                    <section data-section="education" contenteditable="true">
                        <h2>Education</h2>
                        <div class="education-item">
                            <strong>Master of Business Administration</strong>, Boston University (2020)
                        </div>
                    </section>
                    <section data-section="skills" contenteditable="true">
                        <h2>Skills</h2>
                        <p>Project Management, Team Leadership, Data Analysis, Strategic Planning, Risk Management</p>
                    </section>
                </div>
            `
        },
        {
            id: 3,
            title: "Creative Designer",
            category: "premium",
            tags: ["creative", "designer", "colorful"],
            thumbnail: null,
            editableHtml: `
                <div class="resume-template creative-designer">
                    <div class="sidebar">
                        <header data-section="header" contenteditable="true">
                            <div class="profile-photo"></div>
                            <h1 class="name">Jane Smith</h1>
                            <p class="title">Creative Designer</p>
                        </header>
                        <section data-section="contact" contenteditable="true">
                            <h2>Contact</h2>
                            <div class="contact-item">📧 jane@email.com</div>
                            <div class="contact-item">📱 +1 (555) 987-6543</div>
                            <div class="contact-item">📍 Los Angeles, CA</div>
                        </section>
                        <section data-section="skills" contenteditable="true">
                            <h2>Skills</h2>
                            <div class="skill-item">
                                <span>Adobe Creative Suite</span>
                                <div class="skill-bar"><div class="skill-level" style="width: 90%"></div></div>
                            </div>
                        </section>
                    </div>
                    <div class="main-content">
                        <section data-section="summary" contenteditable="true">
                            <h2>About Me</h2>
                            <p>Creative designer with passion for innovative solutions and user-centered design.</p>
                        </section>
                        <section data-section="experience" contenteditable="true">
                            <h2>Experience</h2>
                            <div class="job">
                                <h3>Senior Designer</h3>
                                <div class="company-date">Design Studio | 2021 - Present</div>
                                <p>Led design projects for major clients, resulting in 40% increase in user engagement.</p>
                            </div>
                        </section>
                    </div>
                </div>
            `
        },
        {
            id: 4,
            title: "Executive Professional",
            category: "premium",
            tags: ["executive", "professional", "elegant"],
            thumbnail: null,
            editableHtml: `
                <div class="resume-template executive-professional">
                    <header data-section="header" contenteditable="true">
                        <h1 class="name">Michael Johnson</h1>
                        <p class="title">Chief Executive Officer</p>
                        <div class="contact-bar">
                            <span>michael.johnson@email.com</span>
                            <span>+1 (555) 456-7890</span>
                            <span>Chicago, IL</span>
                        </div>
                    </header>
                    <section data-section="summary" contenteditable="true">
                        <h2>Executive Summary</h2>
                        <p>Visionary leader with 15+ years of experience driving organizational growth and transformation.</p>
                    </section>
                    <section data-section="experience" contenteditable="true">
                        <h2>Professional Experience</h2>
                        <div class="job">
                            <div class="job-header">
                                <h3>Chief Executive Officer</h3>
                                <span class="date">2018 - Present</span>
                            </div>
                            <div class="company">Fortune 500 Company</div>
                            <ul>
                                <li>Increased company revenue by 150% over 5 years</li>
                                <li>Led digital transformation initiatives</li>
                            </ul>
                        </div>
                    </section>
                </div>
            `
        }
        
    ];

    const handleTemplateSelect = (template) => {
        // Check access permissions
        if (template.category === 'premium' && !isAuthenticated) {
            // Show upgrade prompt or redirect to login
            alert('Please register or login to access premium templates');
            return;
        }
        
        setSelectedTemplate(template);
        setIsEditing(true);
        setActiveTab('editor');
    };

    const handleBackToTemplates = () => {
        setIsEditing(false);
        setSelectedTemplate(null);
        setActiveTab('templates');
    };

    return (
        <>
            <HeaderOne />
            <div className="resume-builder-page rts-section-gap">
                <div className="container">
                    <div className="page-header text-center mb--50">
                        <h1 className="title">Resume Builder</h1>
                        <p className="subtitle">Create professional resumes with our easy-to-use templates</p>
                        
                        <div className="tab-navigation">
                            <button 
                                className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                                onClick={() => setActiveTab('templates')}
                            >
                                Choose Template
                            </button>
                            {selectedTemplate && (
                                <button 
                                    className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('editor')}
                                >
                                    Edit Resume
                                </button>
                            )}
                        </div>
                    </div>

                    {activeTab === 'templates' && (
                        <ResumeTemplateGrid 
                            templates={templates}
                            onTemplateSelect={handleTemplateSelect}
                            isAuthenticated={isAuthenticated}
                        />
                    )}

                    {activeTab === 'editor' && selectedTemplate && (
                        <ResumeEditor 
                            template={selectedTemplate}
                            onBack={handleBackToTemplates}
                            isAuthenticated={isAuthenticated}
                        />
                    )}
                </div>
            </div>
            <BackToTop />
            <FooterOne />
        </>
    );
}
