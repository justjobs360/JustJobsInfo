"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import ResumeTemplateGrid from '@/components/resume/ResumeTemplateGrid';
import ResumeEditor from '@/components/resume/ResumeEditor';
import './resume-builder.css';

export default function ResumeBuilderPage() {
    const { user, isAuthenticated } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All templates');
    const router = useRouter();

    // Template categories for filter bar
    const templateCategories = [
        'All templates',
        'Free',
        'Simple',
        'Premium',

        'Google Docs',
    ];

    // Mock templates data - in production, this would come from your database
    const templates = [
        {
            id: 1,
            title: "Modern Professional",
            category: "free",
            tags: ["modern", "professional", "clean"],
            thumbnail: "/assets/resumes/templateone.webp",
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
        }
    ];

    // Filter logic (for demo, just show all for now)
    const filteredTemplates = activeFilter === 'All templates'
        ? templates
        : templates.filter(t => t.tags.map(tag => tag.toLowerCase()).includes(activeFilter.toLowerCase()));

    // When a template is selected, navigate to the dynamic page
    const handleTemplateSelect = (template) => {
        if (template.category === 'premium' && !isAuthenticated) {
            alert('Please register or login to access premium templates');
            return;
        }
        router.push(`/resume-builder/template/${template.id}`);
    };

    return (
        <>
            <HeaderOne />
            <div className="resume-builder-page rts-section-gap" style={{ background: 'var(--color-white)' }}>
                <div className="container">
                    {/* HERO SECTION */}
                    <div className="text-center mb--50" style={{ marginBottom: '24px' }}>
                        <h1 className="title" style={{ fontSize: 'var(--h1)', color: 'var(--color-heading-1)', fontWeight: 700, marginBottom: '12px' }}>
                            Resume templates
                        </h1>
                        <p className="subtitle" style={{ fontSize: '20px', color: 'var(--color-body)', marginBottom: '24px' }}>
                            Each resume template is designed to follow the exact rules you need to get hired faster.<br />
                            Use our resume templates and get free access to 18 more career tools!
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                            <button className="rts-btn btn-primary" style={{ fontSize: '18px', padding: '14px 36px', marginBottom: 0, minWidth: '220px' }}
                                onClick={() => router.push('/resume-builder/template/1')}
                                // Disabled if no template, but always enabled for now
                            >
                                Create my resume
                            </button>
                            {/* FILTER BAR */}
                            <div className="resume-filter-bar" style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                gap: '12px',
                                margin: '0 auto 24px auto',
                                width: '100%',
                                maxWidth: '700px',
                            }}>
                                {templateCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`filter-btn${activeFilter === cat ? ' active' : ''}`}
                                        style={{
                                            display: 'inline-flex',
                                            width: 'auto',
                                            background: activeFilter === cat ? 'var(--color-primary)' : 'var(--color-white)',
                                            color: activeFilter === cat ? 'var(--color-white)' : 'var(--color-body)',
                                            border: activeFilter === cat ? '1.5px solid var(--color-primary)' : '1.5px solid #B5D2F6',
                                            borderRadius: '24px',
                                            padding: '8px 24px',
                                            fontWeight: 500,
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s, color 0.2s',
                                            boxShadow: activeFilter === cat ? '0 2px 8px rgba(9,99,211,0.08)' : 'none',
                                            outline: 'none',
                                            // Remove minWidth to prevent forced wrapping
                                        }}
                                        onClick={() => setActiveFilter(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Only show the template grid, not the editor */}
                    <ResumeTemplateGrid
                        templates={filteredTemplates}
                        onTemplateSelect={handleTemplateSelect}
                        isAuthenticated={isAuthenticated}
                    />
                </div>
            </div>
            <BackToTop />
            <FooterOne />
        </>
    );
}
