"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import HeaderOne from "@/components/header/HeaderOne";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import ResumeTemplateGrid from '@/components/resume/ResumeTemplateGrid';
import ResumeEditor from '@/components/resume/ResumeEditor';
import './resume-builder.css';

export default function ResumeBuilderPage() {
    const { user, isAuthenticated } = useAuth();
    const [activeFilter, setActiveFilter] = useState('All templates');
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Template categories for filter bar - will be populated from API
    const templateCategories = ['All templates', ...categories.map(cat => cat.name)];

    const [templates, setTemplates] = useState([
        {
            id: 1,
            title: "Harvard Professional",
            category: "free",
            filterCategories: ["free", "simple"],
            tags: ["modern", "professional", "clean", "harvard", "simple"],
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
        },
        {
            id: 2,
            title: "Modern Creative",
            category: "free",
            filterCategories: ["free", "simple"],
            tags: ["modern", "creative", "design", "simple"],
            thumbnail: "/assets/resumes/templatetwo.png",
            editableHtml: `
                <div class="resume-template modern-creative">
                    <header data-section="header" contenteditable="true">
                        <h1 class="name">Jane Smith</h1>
                        <div class="contact-info">
                            <span class="email">jane.smith@email.com</span>
                            <span class="phone">+1 (555) 987-6543</span>
                            <span class="location">San Francisco, CA</span>
                        </div>
                    </header>
                    <section data-section="summary" contenteditable="true">
                        <h2>Professional Summary</h2>
                        <p>Creative professional with a passion for innovation and design thinking.</p>
                    </section>
                    <section data-section="experience" contenteditable="true">
                        <h2>Work Experience</h2>
                        <div class="job">
                            <h3>Creative Director</h3>
                            <div class="company-date">Design Studio | 2019 - Present</div>
                            <ul>
                                <li>Led creative direction for major brands</li>
                                <li>Managed team of 15 designers</li>
                            </ul>
                        </div>
                    </section>
                    <section data-section="education" contenteditable="true">
                        <h2>Education</h2>
                        <div class="education-item">
                            <h3>Bachelor of Design</h3>
                            <div class="school-date">Design Institute | 2019</div>
                        </div>
                    </section>
                    <section data-section="skills" contenteditable="true">
                        <h2>Skills</h2>
                        <ul class="skills-list">
                            <li>Adobe Creative Suite</li>
                            <li>UI/UX Design</li>
                            <li>Brand Strategy</li>
                        </ul>
                    </section>
                </div>
            `
        },
        {
            id: 3,
            title: "Modern Two-Column",
            category: "free",
            filterCategories: ["free", "modern"],
            tags: ["modern", "two-column", "professional", "sidebar", "clean"],
            thumbnail: "/assets/resumes/templatethree.png",
            editableHtml: `
                <div class="resume-template modern-two-column">
                    <div class="left-sidebar">
                        <div class="profile-section">
                            <div class="profile-image">[Profile Image]</div>
                            <h1 class="name">Sophie Walton</h1>
                            <p class="tagline">Professional Tagline</p>
                        </div>
                        <div class="contact-details">
                            <h3>Details</h3>
                            <p>Address, City, State</p>
                            <p>Country</p>
                            <p>Phone Number</p>
                            <p>Email Address</p>
                            <p>LinkedIn Profile</p>
                        </div>
                        <div class="skills-section">
                            <h3>Skills</h3>
                            <div class="skill-item">
                                <span class="skill-name">Skill 1</span>
                                <div class="skill-bar">
                                    <div class="skill-level" style="width: 70%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="right-content">
                        <section class="summary-section">
                            <h2>Profile</h2>
                            <p>Professional summary and career objectives.</p>
                        </section>
                        <section class="experience-section">
                            <h2>Employment History</h2>
                            <div class="job-item">
                                <h3>Job Title, Company</h3>
                                <p class="job-date">Start Date - End Date</p>
                                <p class="job-location">Location</p>
                                <ul>
                                    <li>Key achievement or responsibility</li>
                                    <li>Another achievement with metrics</li>
                                </ul>
                            </div>
                        </section>
                        <section class="education-section">
                            <h2>Education</h2>
                            <div class="education-item">
                                <h3>Degree Name, School</h3>
                                <p class="education-date">Start Date - End Date</p>
                                <p class="education-location">Location</p>
                            </div>
                        </section>
                    </div>
                </div>
            `
        },
        {
            id: 4,
            title: "Modern Blue Professional",
            category: "free",
            filterCategories: ["free", "modern", "simple"],
            tags: ["modern", "professional", "blue", "clean", "tech", "business"],
            thumbnail: "/assets/resumes/templatefour.png",
            editableHtml: `
                <div class="resume-template modern-blue-professional" style="font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.4;">
                    <header data-section="header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid #4A90E2; padding-bottom: 16px;">
                        <div style="flex: 1;">
                            <h1 class="name" style="font-size: 28px; font-weight: bold; color: #4A90E2; margin-bottom: 6px;">Taylor Greene</h1>
                            <p class="tagline" style="font-size: 14px; color: #666; margin: 0;">Chief Technology Officer</p>
                        </div>
                        <div class="contact-info" style="text-align: right; font-size: 11px; color: #4A90E2; line-height: 1.5;">
                            <div>taylor.greene@example.com</div>
                            <div>(555) 456-7890</div>
                            <div>Oklahoma City, OK, United States</div>
                        </div>
                    </header>
                    <section data-section="summary" style="margin-bottom: 20px;">
                        <h2 style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 8px;">Summary</h2>
                        <p style="font-size: 11px; color: #333; margin: 0;">Experienced and forward-thinking Chief Technology Officer (CTO) with 20+ years of extensive experience leading cross-functional teams and driving technological advancement in various industries.</p>
                    </section>
                    <section data-section="experience" style="margin-bottom: 20px;">
                        <h2 style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px;">Professional Experience</h2>
                        <div class="job" style="margin-bottom: 16px;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                <h3 style="font-size: 12px; font-weight: bold; color: #333; margin: 0;">BlueTech Solutions</h3>
                                <span style="font-size: 11px; color: #4A90E2; font-weight: 500;">January 2013 – Present</span>
                            </div>
                            <p style="font-size: 11px; color: #666; font-style: italic; margin: 0 0 6px 0;">Chief Technology Officer (CTO)</p>
                            <ul style="font-size: 11px; color: #333; margin: 0; padding-left: 16px;">
                                <li style="margin-bottom: 4px;">Steered the technological vision of the company while fostering innovation and collaboration across teams.</li>
                                <li style="margin-bottom: 4px;">Led the successful integration of AI technologies, enhancing product capabilities and opening new revenue streams.</li>
                            </ul>
                        </div>
                    </section>
                    <section data-section="education" style="margin-bottom: 20px;">
                        <h2 style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px;">Education</h2>
                        <div class="education-item" style="margin-bottom: 12px;">
                            <h3 style="font-size: 12px; font-weight: bold; color: #333; margin: 0 0 2px 0;">Master of Science in Computer Science</h3>
                            <p style="font-size: 11px; color: #333; margin: 0;">Georgetown University, Washington, D.C.</p>
                        </div>
                    </section>
                    <section data-section="skills" style="margin-bottom: 20px;">
                        <h2 style="font-size: 16px; font-weight: bold; color: #4A90E2; margin-bottom: 12px;">Areas of Expertise</h2>
                        <div style="display: flex; gap: 24px;">
                            <div style="flex: 1;">
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Technology Vision & Strategy</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Cloud Computing</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Data Analytics</div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Executive Leadership</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• OS & Infrastructure</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Project Management</div>
                            </div>
                            <div style="flex: 1;">
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Database Management</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Coding Languages</div>
                                <div style="font-size: 11px; margin-bottom: 4px; color: #333;">• Budgeting & Financial Management</div>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        {
            id: 5,
            title: "Professional Two-Column",
            category: "free",
            filterCategories: ["free", "modern", "professional"],
            tags: ["modern", "professional", "two-column", "sidebar", "business", "clean"],
            thumbnail: "/assets/resumes/templatefive.png",
            editableHtml: `
                <div class="resume-template professional-two-column" style="display: flex; font-family: Arial, Helvetica, sans-serif; color: #333; line-height: 1.4;">
                    <div class="left-sidebar" style="width: 35%; background: #F5F5F5; padding: 32px 24px;">
                        <div class="profile-section" style="margin-bottom: 32px;">
                            <h1 style="font-size: 20px; font-weight: bold; color: #5A7BA8; margin: 0 0 6px 0;">Alice Hart</h1>
                            <div style="font-size: 13px; color: #333; margin: 0 0 16px 0;">Math Teacher</div>
                        </div>
                        <div class="profile-summary" style="margin-bottom: 32px;">
                            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 12px 0; text-transform: uppercase;">Profile</h3>
                            <p style="font-size: 11px; color: #333; margin: 0; line-height: 1.5;">Dedicated and enthusiastic math teacher with over 8 years of experience fostering a nurturing and collaborative learning environment.</p>
                        </div>
                        <div class="contact-details" style="margin-bottom: 24px;">
                            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase;">Address</h3>
                            <div style="font-size: 11px; color: #333; line-height: 1.4;">
                                <div>779 West Turkleton Way</div>
                                <div>Tuscaloosa, AL 35401</div>
                            </div>
                        </div>
                        <div class="email-section" style="margin-bottom: 24px;">
                            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase;">Email</h3>
                            <div style="font-size: 11px; color: #333;">a.hart@email.com</div>
                        </div>
                        <div class="phone-section" style="margin-bottom: 24px;">
                            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 8px 0; text-transform: uppercase;">Phone</h3>
                            <div style="font-size: 11px; color: #333;">(773) 489-2264</div>
                        </div>
                        <div class="skills-section">
                            <h3 style="font-size: 13px; font-weight: bold; color: #5A7BA8; margin: 0 0 12px 0; text-transform: uppercase;">Skills</h3>
                            <div style="font-size: 11px; color: #333; line-height: 1.6;">
                                <div style="margin-bottom: 4px;">Curriculum and Instruction</div>
                                <div style="margin-bottom: 4px;">Differentiated Instruction</div>
                                <div style="margin-bottom: 4px;">Educational Philosophy</div>
                                <div style="margin-bottom: 4px;">Student Assessment</div>
                            </div>
                        </div>
                    </div>
                    <div class="main-content" style="width: 65%; padding: 32px 32px; background: #fff;">
                        <section class="employment-section" style="margin-bottom: 32px;">
                            <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase;">Employment History</h2>
                            <div class="job-item" style="margin-bottom: 20px;">
                                <div style="margin-bottom: 8px;">
                                    <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0;">Math Teacher at Tuscaloosa County High School</h3>
                                    <div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">September 2017 – Present</div>
                                </div>
                                <div style="font-size: 11px; color: #333; line-height: 1.5;">
                                    <div style="margin-bottom: 4px;">• Provide engaging instruction to high school students</div>
                                    <div style="margin-bottom: 4px;">• Interface with faculty and staff to plan and schedule courses</div>
                                </div>
                            </div>
                        </section>
                        <section class="education-section" style="margin-bottom: 32px;">
                            <h2 style="font-size: 15px; font-weight: bold; color: #5A7BA8; margin: 0 0 16px 0; text-transform: uppercase;">Education</h2>
                            <div class="education-item" style="margin-bottom: 20px;">
                                <div style="margin-bottom: 8px;">
                                    <h3 style="font-size: 13px; font-weight: bold; color: #333; margin: 0;">University of Alabama at Tuscaloosa, AL</h3>
                                    <div style="font-size: 11px; color: #666; margin: 2px 0 0 0;">August 2013 – June 2017</div>
                                </div>
                                <div style="font-size: 11px; color: #333; font-style: italic;">Master of Education – Curriculum and Instruction</div>
                            </div>
                        </section>
                    </div>
                </div>
            `
        },
        {
            id: 6,
            title: "Modern Green Professional",
            category: "free",
            filterCategories: ["free", "modern", "professional"],
            tags: ["modern", "professional", "green", "clean", "business", "sans-serif"],
            thumbnail: "/assets/resumes/templatesix.png",
            editableHtml: `
                <div class="resume-template modern-green-professional" style="font-family: 'Arial', 'Helvetica', sans-serif; color: #333; min-height: 1040px; font-size: 12px; line-height: 1.4;">
                    <!-- Header Section - Light Green Band -->
                    <div style="background: #D9EAD3; padding: 30px 40px; margin-bottom: 30px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-size: 36px; font-weight: bold; color: #333;">Kane Jones</div>
                            <div style="text-align: right; font-size: 12px; color: #333;">
                                <div style="margin-bottom: 4px;">kjn_77es14@yahoo.com • (512)701-9215</div>
                                <div>88 Lorenzo Road, Austin, United States, TX 73301</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Content Area -->
                    <div style="padding: 0 40px;">
                        <div style="margin-bottom: 30px;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Construction Manager</div>
                            <div style="font-size: 12px; line-height: 1.5; color: #333;">Experienced construction manager with over 15 years of expertise in managing budgets, coordinating teams, ensuring safety, and delivering projects on time and under budget.</div>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Career Experience</div>
                            <div style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                    <div style="font-size: 14px; font-weight: bold; color: #333;">Senior Construction Manager at Turner Construction Company</div>
                                    <div style="font-size: 14px; color: #333;">Mar 2017 – Present</div>
                                </div>
                                <div style="font-size: 12px; margin-left: 20px; margin-top: 8px;">
                                    <div style="margin-bottom: 6px;">• Oversaw large-scale commercial projects ($50M+)</div>
                                    <div style="margin-bottom: 6px;">• Directed a team of 45 engineers, supervisors, and subcontractors</div>
                                    <div style="margin-bottom: 6px;">• Negotiated vendor contracts, reducing costs by 12%</div>
                                </div>
                            </div>
                            <div style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                                    <div style="font-size: 14px; font-weight: bold; color: #333;">Project Manager at Skanska USA Building Inc.</div>
                                    <div style="font-size: 14px; color: #333;">Jan 2012 – Feb 2017</div>
                                </div>
                                <div style="font-size: 12px; margin-left: 20px; margin-top: 8px;">
                                    <div style="margin-bottom: 6px;">• Managed construction timelines for mixed-use developments</div>
                                    <div style="margin-bottom: 6px;">• Coordinated with architects, engineers, and local authorities</div>
                                    <div style="margin-bottom: 6px;">• Implemented Lean Construction techniques, cutting delays by 18%</div>
                                </div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Education</div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 14px; color: #333; margin-bottom: 4px;">Bachelor of Civil Engineering, 2003 – 2007</div>
                                <div style="font-size: 12px; color: #333;">University of Texas, Austin</div>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 30px;">
                            <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #6AA84F;">Skills</div>
                            <div style="display: flex; margin-top: 10px;">
                                <div style="flex: 1; margin-right: 20px;">
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Project Management</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Budget Management</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Team Leadership</div>
                                </div>
                                <div style="flex: 1; margin-right: 20px;">
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Procore</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Primavera</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Lean Construction</div>
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Safety Management</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Contract Negotiation</div>
                                    <div style="font-size: 12px; margin-bottom: 6px; color: #333;">• Quality Control</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Page Number -->
                    <div style="position: absolute; bottom: 20px; left: 40px; font-size: 10px; color: #333;">Page 1</div>
                </div>
            `
        },
        {
            id: 7,
            title: "Modern Professional",
            category: "free",
            filterCategories: ["free", "modern", "professional"],
            tags: ["modern", "professional", "clean", "photo", "business", "contemporary"],
            thumbnail: "/assets/resumes/templateseven.png",
            editableHtml: `
                <div class="resume-template modern-professional-7" style="font-family: 'Segoe UI', 'Arial', sans-serif; color: #2c3e50; min-height: 1040px; background: #fff;">
                    <!-- Header Section -->
                    <div style="background: #2c3e50; padding: 0; margin: 0; height: 3px;"></div>
                    <div style="padding: 40px 50px 30px 50px;">
                        <div style="display: flex; align-items: flex-start; margin-bottom: 40px; border-bottom: 1px solid #e1e8ed; padding-bottom: 30px;">
                            <!-- Profile Photo -->
                            <div style="width: 100px; height: 100px; border-radius: 12px; background: #2c3e50; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 600; margin-right: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 3px solid #fff;">
                                JS
                            </div>
                            <!-- Name and Contact Section -->
                            <div style="flex: 1;">
                                <!-- Name and Title -->
                                <div style="margin-bottom: 20px;">
                                    <h1 style="font-size: 32px; font-weight: 700; color: #2c3e50; margin: 0 0 8px 0; line-height: 1.2;">John Smith</h1>
                                    <div style="font-size: 16px; color: #5a6c7d; font-weight: 500; margin-bottom: 0;">Senior Software Developer</div>
                                </div>
                                <!-- Contact Information -->
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 12px; color: #5a6c7d;">
                                    <div>john.smith@email.com</div>
                                    <div>(555) 123-4567</div>
                                    <div>New York, NY</div>
                                    <div>linkedin.com/in/johnsmith</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Professional Summary -->
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 12px 0; position: relative; padding-left: 20px;">
                                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 3px; background: #2c3e50; border-radius: 2px;"></div>
                                Professional Summary
                            </h2>
                            <p style="font-size: 13px; line-height: 1.6; color: #34495e; margin: 0; text-align: justify;">Experienced software developer with 8+ years of expertise in full-stack development, team leadership, and agile methodologies. Proven track record of delivering scalable solutions and driving technical innovation.</p>
                        </div>
                        
                        <!-- Skills Section -->
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 15px 0; position: relative; padding-left: 20px;">
                                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 3px; background: #2c3e50; border-radius: 2px;"></div>
                                Skills
                            </h2>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 13px; color: #34495e;">
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">JavaScript</div>
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">React</div>
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">Node.js</div>
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">Python</div>
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">SQL</div>
                                <div style="padding: 6px 0; border-bottom: 1px solid #e1e8ed;">AWS</div>
                            </div>
                        </div>
                        
                        <!-- Professional Experience -->
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 18px 0; position: relative; padding-left: 20px;">
                                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 3px; background: #2c3e50; border-radius: 2px;"></div>
                                Professional Experience
                            </h2>
                            <div style="margin-bottom: 18px; padding: 16px; border: 1px solid #e1e8ed; border-radius: 8px; background: #f8f9fa;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <h3 style="font-size: 16px; font-weight: 600; color: #2c3e50; margin: 0 0 4px 0;">Senior Software Developer</h3>
                                        <div style="font-size: 14px; color: #5a6c7d; font-weight: 500;">Tech Solutions Inc. • San Francisco, CA</div>
                                    </div>
                                    <div style="background: #2c3e50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 500;">
                                        2020 - Present
                                    </div>
                                </div>
                                <div style="margin-top: 12px;">
                                    <div style="font-size: 13px; color: #34495e; margin-bottom: 6px; padding-left: 15px; position: relative;">
                                        <div style="position: absolute; left: 0; top: 8px; width: 4px; height: 4px; background: #2c3e50; border-radius: 50%;"></div>
                                        Led development of microservices architecture serving 1M+ users
                                    </div>
                                    <div style="font-size: 13px; color: #34495e; margin-bottom: 6px; padding-left: 15px; position: relative;">
                                        <div style="position: absolute; left: 0; top: 8px; width: 4px; height: 4px; background: #2c3e50; border-radius: 50%;"></div>
                                        Mentored team of 5 junior developers and improved code quality by 40%
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Education -->
                        <div style="margin-bottom: 25px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 20px 0; position: relative; padding-left: 20px;">
                                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 3px; background: #2c3e50; border-radius: 2px;"></div>
                                Education
                            </h2>
                            <div style="margin-bottom: 20px; padding: 18px; border-left: 4px solid #2c3e50; background: #f8f9fa; border-radius: 0 8px 8px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                    <div>
                                        <h3 style="font-size: 15px; font-weight: 600; color: #2c3e50; margin: 0 0 4px 0;">Bachelor of Computer Science</h3>
                                        <div style="font-size: 13px; color: #5a6c7d; font-weight: 500;">Stanford University</div>
                                    </div>
                                    <div style="background: #2c3e50; color: white; padding: 3px 10px; border-radius: 10px; font-size: 10px; font-weight: 500;">
                                        2012 - 2016
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- References -->
                        <div style="margin-bottom: 20px;">
                            <h2 style="font-size: 18px; font-weight: 600; color: #2c3e50; margin: 0 0 15px 0; position: relative; padding-left: 20px;">
                                <div style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 12px; height: 3px; background: #2c3e50; border-radius: 2px;"></div>
                                References
                            </h2>
                            <p style="font-size: 13px; color: #5a6c7d; margin: 0; font-style: italic;">References available upon request</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            id: 8,
            title: "Executive Sidebar Modern",
            category: "free",
            filterCategories: ["free", "professional", "modern"],
            tags: ["sidebar", "two-column", "blue-accents", "professional", "executive", "clean", "arial"],
            thumbnail: "/assets/resumes/templateeight.png",
            editableHtml: `<div class="resume-template executive-sidebar-modern">Executive Sidebar Modern Template</div>`
        },
        {
            id: 9,
            title: "Clean ATS Minimal",
            category: "free",
            filterCategories: ["free", "simple", "professional"],
            tags: ["ats-friendly", "minimal", "centered", "clean", "professional", "standard"],
            thumbnail: "/assets/resumes/templatenine.png",
            editableHtml: `<div class="resume-template clean-ats-minimal">Clean ATS Minimal Template</div>`
        },
        {
            id: 10,
            title: "Elegant Designer Two-Column",
            category: "free",
            filterCategories: ["free", "modern", "creative"],
            tags: ["designer", "modern", "inter-font", "two-column", "navy", "beige", "circular-photo"],
            thumbnail: "/assets/resumes/templateten.png",
            editableHtml: `<div class="resume-template elegant-designer-two-column">Elegant Designer Two-Column Template</div>`
        },
        {
            id: 11,
            title: "Bold Impact Yellow",
            category: "free",
            filterCategories: ["free", "modern", "creative"],
            tags: ["bold", "brutalist", "yellow", "high-contrast", "creative", "impactful"],
            thumbnail: "/assets/resumes/templateeleven.png",
            editableHtml: `<div class="resume-template bold-impact-yellow">Bold Impact Yellow Template</div>`
        },
        {
            id: 12,
            title: "Classic Serif Executive",
            category: "free",
            filterCategories: ["free", "professional", "simple"],
            tags: ["serif", "classic", "executive", "professional", "playfair-display", "traditional"],
            thumbnail: "/assets/resumes/templatetwelve.png",
            editableHtml: `<div class="resume-template classic-serif-executive">Classic Serif Executive Template</div>`
        },
        {
            id: 13,
            title: "Luxury Dark Professional",
            category: "free",
            filterCategories: ["free", "modern", "professional"],
            tags: ["luxury", "dark-header", "premium", "professional", "centered", "elegant"],
            thumbnail: "/assets/resumes/templatethirteen.png",
            editableHtml: `<div class="resume-template luxury-dark-professional">Luxury Dark Professional Template</div>`
        },
        {
            id: 14,
            title: "Cyber Modern Dark",
            category: "free",
            filterCategories: ["free", "modern", "creative"],
            tags: ["dark-mode", "modern", "cyan", "creative", "tech", "georgia-serif"],
            thumbnail: "/assets/resumes/templatefourteen.png",
            editableHtml: `<div class="resume-template cyber-modern-dark">Cyber Modern Dark Template</div>`
        },
        {
            id: 15,
            title: "Creative Forest Minimal",
            category: "free",
            filterCategories: ["free", "modern", "creative"],
            tags: ["forest-green", "creative", "minimal", "sidebar-accent", "modern", "professional"],
            thumbnail: "/assets/resumes/templatefifteen.png",
            editableHtml: `<div class="resume-template creative-forest-minimal">Creative Forest Minimal Template</div>`
        }
    ]);

    // Load categories from API
    useEffect(() => {
        let isMounted = true;
        async function loadCategories() {
            try {
                const res = await fetch('/api/admin/resume-template-categories');
                const json = await res.json();
                if (json?.success && Array.isArray(json.data) && isMounted) {
                    // Only show active categories
                    const activeCategories = json.data.filter(cat => cat.status === 'active');
                    setCategories(activeCategories);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
                // Fallback to default categories if API fails
                if (isMounted) {
                    setCategories([
                        { name: 'Free', id: 'free' },
                        { name: 'Simple', id: 'simple' },
                        { name: 'Modern', id: 'modern' },
                        { name: 'Premium', id: 'premium' }
                    ]);
                }
            } finally {
                if (isMounted) {
                    setCategoriesLoading(false);
                }
            }
        }
        loadCategories();
        return () => { isMounted = false; };
    }, []);

    // Load templates from admin API and filter by active
    useEffect(() => {
        let isMounted = true;
        async function loadTemplates() {
            try {
                const res = await fetch('/api/admin/resume-templates');
                const json = await res.json();
                if (json?.success && Array.isArray(json.data)) {
                    const activeTemplates = json.data
                        .filter(t => t.status === 'active')
                        .map(t => ({
                            id: t.id,
                            title: t.name,
                            category: t.category || '', // Keep original case to match category names
                            filterCategories: (t.tags || []).map(x => String(x).toLowerCase()),
                            tags: t.tags || [],
                            thumbnail: t.imageUrl,
                        }));
                    if (isMounted && activeTemplates.length > 0) {
                        setTemplates(activeTemplates);
                    }
                }
            } catch (_) {
                // silently fall back to built-in list
            }
        }
        loadTemplates();
        return () => { isMounted = false; };
    }, []);

    // Filter logic - show templates based on selected category
    const filteredTemplates = activeFilter === 'All templates'
        ? templates
        : templates.filter(t => {
            // Match by category name (exact match, case-sensitive to match API category names)
            return (t.category || '') === activeFilter;
        });

    // When a template is selected, navigate to the dynamic page
    const handleTemplateSelect = (template) => {
        if (!isAuthenticated) {
            router.push('/register');
            return;
        }
        router.push(`/resume-builder/template/${template.id}`);
    };

    return (
        <>
            <HeaderOne />
            <Breadcrumb />
            <div className="resume-builder-page rts-section-gap" style={{ background: 'var(--color-white)' }}>
                <div className="container">
                    {/* HERO SECTION */}
                    <div className="text-center mb--50" style={{ marginBottom: '24px' }}>
                        <h1 className="title" style={{ fontSize: 'var(--h1)', color: 'var(--color-heading-1)', fontWeight: 700, marginBottom: '12px' }}>
                            Resume templates
                        </h1>
                        <p className="subtitle" style={{ fontSize: '20px', color: 'var(--color-body)', marginBottom: '24px' }}>
                            No-nonsense resume templates. Cut the fluff and get real results.
                            <br />
                            Skip the guesswork. Use proven templates that speak for you and help you stand out.

                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                            <button className="rts-btn btn-primary" style={{ fontSize: '18px', padding: '14px 36px', marginBottom: 0, minWidth: '220px' }}
                                onClick={() => isAuthenticated ? router.push('/resume-builder/template/1') : router.push('/register')}
                            >
                                {isAuthenticated ? 'Create my resume' : 'Register to Use'}
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
                                {categoriesLoading ? (
                                    <div style={{ padding: '8px 24px', color: 'var(--color-body)' }}>Loading categories...</div>
                                ) : (
                                    templateCategories.map((cat) => (
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
                                            }}
                                            onClick={() => setActiveFilter(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))
                                )}
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
            <FooterOneDynamic />
        </>
    );
}
