"use client";
import React from 'react';
import BackToTop from "@/components/common/BackToTop";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOne from "@/components/footer/FooterOne";
import './important-links.css';

export default function ImportantLinksPage() {
    const resourceCategories = [
        {
            title: "Resume & Cover Letter Resources",
            description: "Essential tools and guides for creating professional resumes and cover letters",
            links: [
                {
                    name: "Resume Writing Guide",
                    url: "https://enhancv.com/resume-examples/ats/",
                    description: "Comprehensive guide to writing an effective resume"
                },
                {
                    name: "Cover Letter Examples",
                    url: "https://hbr.org/2022/05/how-to-write-a-cover-letter-that-sounds-like-you-and-gets-noticed",
                    description: "practical guidance on how to make your cover letter authentic, targeted, and effective, including tips on research, personalization, and strong openings."
                },
                {
                    name: "Resume Format Guide",
                    url: "https://resumegenius.com/blog/resume-help/resume-format",
                    description: "Guide to choosing the right resume format"
                }
            ]
        },
        {
            title: "Interview Preparation",
            description: "Resources to help you prepare for and excel in job interviews",
            links: [
                {
                    name: "Common Interview Questions",
                    url: "https://www.themuse.com/advice/interview-questions-and-answers",
                    description: "List of common interview questions with sample answers"
                },
                {
                    name: "Behavioral Interview Guide",
                    url: "https://blog.theinterviewguys.com/top-10-behavioral-interview-questions/",
                    description: "Guide to handling behavioral interview questions"
                },
                {
                    name: "Video Interview Tips",
                    url: "https://www.prospects.ac.uk/careers-advice/interview-tips/video-interview-tips",
                    description: "Best practices for video interviews"
                }
            ]
        },
        {
            title: "Job Boards & Search Engines",
            description: "Popular platforms for finding job opportunities",
            links: [
                {
                    name: "LinkedIn Jobs",
                    url: "https://www.linkedin.com/jobs/",
                    description: "Professional networking and job search platform"
                },
                {
                    name: "Indeed",
                    url: "https://www.indeed.com/",
                    description: "World's largest job search engine"
                },
                {
                    name: "JustJobs.info",
                    url: "https://www.justjobs.info/job-listing",
                    description: "Curated job listings and career resources"
                },
                {
                    name: "Remote OK",
                    url: "https://remoteok.com/",
                    description: "Remote job opportunities"
                },
                {
                    name: "Glassdoor",
                    url: "https://www.glassdoor.com/",
                    description: "Job search with company reviews and salary information"
                },
                {
                    name: "Monster",
                    url: " https://www.monster.com/",
                    description: "Global job board connecting candidates with employers"
                }
                
            ]
        },
        {
            title: "Career Development",
            description: "Resources for continuous learning and skill development",
            links: [
                {
                    name: "Coursera",
                    url: "https://www.coursera.org/",
                    description: "Online courses from top universities"
                },
                {
                    name: "edX",
                    url: "https://www.edx.org/",
                    description: "Free online courses from leading institutions"
                },
                {
                    name: "LinkedIn Learning",
                    url: "https://www.linkedin.com/learning/",
                    description: "Professional development courses"
                }
            ]
        },
        {
            title: "Freelancing & Gig Work",
            description: "Platforms and resources for freelance opportunities",
            links: [
                {
                    name: "Upwork",
                    url: "https://www.upwork.com/",
                    description: "Global freelancing platform"
                },
                {
                    name: "Fiverr",
                    url: "https://www.fiverr.com/",
                    description: "Freelance services marketplace"
                },
                {
                    name: "Freelancer",
                    url: "https://www.freelancer.com/",
                    description: "Freelance and crowdsourcing marketplace"
                }
            ]
        },
        {
            title: "Government & Local Employment Services",
            description: "Official resources for job seekers",
            links: [
                {
                    name: "USAJOBS",
                    url: "https://www.usajobs.gov/",
                    description: "Official job site of the US government"
                },
                {
                    name: "CareerOneStop",
                    url: "https://www.careeronestop.org/",
                    description: "Sponsored by the U.S. Department of Labor"
                },
                {
                    name: "UK.GOV FIND A JOB",
                    url: "https://www.gov.uk/find-a-job",
                    description: "Official job site of the UK government"
                }
            ]
        }
    ];

    return (
        <>
            <HeaderOne />
            <div className="important-links-page rts-section-gap">
                <div className="container">
                    <div className="page-header text-center mb--50">
                        <h1 className="title">Important Links</h1>
                        <p className="subtitle">Curated resources to help you succeed in your job search</p>
                    </div>

                    <div className="resource-categories">
                        {resourceCategories.map((category, index) => (
                            <div key={index} className="category-section mb--30">
                                <h2 className="category-title">{category.title}</h2>
                                <p className="category-description">{category.description}</p>
                                
                                <div className="links-grid">
                                    {category.links.map((link, linkIndex) => (
                                        <a 
                                            key={linkIndex}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="resource-link"
                                        >
                                            <h3 className="link-title">{link.name}</h3>
                                            <p className="link-description">{link.description}</p>
                                        </a>
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