"use client";
import React from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import './downloadable-resources.css';

export default function DownloadableResourcesPage() {
    const resourceCategories = [
        {
            title: "Job Search Planners",
            description: "Track your job search progress and stay organized with these helpful planners",
            resources: [
                {
                    name: "Job Application Tracker (Google Sheets)",
                    description: "Google Sheets template to track applications, interviews, and follow-ups",
                    format: "Sheet",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/brands/google-drive.svg",
                    downloadUrl: "https://docs.google.com/spreadsheets/d/1oXAVQXgV3TIBfLZMcXAMb0glZXzvUdcUyNyRMfHSm-8/export?format=xlsx"
                },
                {
                    name: "Weekly Job Search Planner",
                    description: "Plan your job search activities week by week",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.skillsyouneed.com/downloads/Job-Search-Planner.pdf"
                },
                {
                    name: "Productivity Checklist",
                    description: "Daily and weekly checklists to maximize your job search efficiency",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.vertex42.com/ExcelTemplates/job-search-log.html"
                }
            ]
        },
        {
            title: "Interview Preparation Kits",
            description: "Comprehensive guides and worksheets to help you prepare for interviews",
            resources: [
                {
                    name: "Common Interview Questions Guide",
                    description: "List of frequently asked questions with sample answers",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.sjsu.edu/careercenter/docs/InterviewQuestions.pdf"
                },
                {
                    name: "STAR Method Worksheet",
                    description: "Template for crafting compelling STAR method responses",
                    format: "Word",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/brands/microsoft.svg",
                    downloadUrl: "https://www.mindtools.com/pages/article/newHTE_90.htm"
                },
                {
                    name: "Interview Preparation Checklist",
                    description: "Comprehensive checklist for interview preparation",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.indeed.com/career-advice/interviewing/interview-preparation-checklist"
                }
            ]
        },
        
        {
            title: "Career Planning Resources",
            description: "Set goals, evaluate progress, and plan your career path with these tools",
            resources: [
                {
                    name: "Career Planning Workbook",
                    description: "Guided workbook for setting short and long-term career goals",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.careeronestop.org/TridionMultimedia/PlanningYourCareerWorkbook-508.pdf"
                },
                {
                    name: "Skills Self-Assessment",
                    description: "Identify your strongest skills and areas for improvement",
                    format: "PDF",
                    icon: "https://unpkg.com/@fortawesome/fontawesome-free/svgs/solid/file-pdf.svg",
                    downloadUrl: "https://www.careeronestop.org/Toolkit/Skills/skills-matcher.aspx"
                }
            ]
        }
    ];

    return (
        <>
            <HeaderOne />
            <div className="downloadable-resources-page rts-section-gap">
                <div className="container">
                    <div className="page-header text-center mb--50">
                        <h1 className="title">Downloadable Resources</h1>
                        <p className="subtitle">Access our collection of free resources to help you succeed in your job search</p>
                    </div>

                    <div className="resource-categories">
                        {resourceCategories.map((category, index) => (
                            <div key={index} className="category-section mb--30">
                                <h2 className="category-title">{category.title}</h2>
                                <p className="category-description">{category.description}</p>

                                <div className="resources-grid">
                                    {category.resources.map((resource, resourceIndex) => (
                                        <div key={resourceIndex} className="resource-card">
                                            <div className="resource-icon">
                                                <img src={resource.icon} alt={resource.format} />
                                            </div>
                                            <div className="resource-content">
                                                <h3 className="resource-title">{resource.name}</h3>
                                                <p className="resource-description">{resource.description}</p>
                                                <div className="resource-meta">
                                                    <span className="format-badge">{resource.format}</span>
                                                    <a 
                                                        href={resource.downloadUrl}
                                                        className="download-btn"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Download
                                                        <img 
                                                            src="/assets/images/service/icons/13.svg" 
                                                            alt="download"
                                                            className="injectable"
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <BackToTop />
            <FooterOne />
        </>
    );
}
