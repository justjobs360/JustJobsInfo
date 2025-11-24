"use client"
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './FooterOneDynamic.module.css';
import BrandLogo from '@/components/common/BrandLogo';

function FooterOneDynamic() {
    const pathname = usePathname();

    // Helper function to check if a link is active
    const isActive = (href) => {
        // Exact match for home page
        if (href === '/') {
            return pathname === '/';
        }
        
        // For other pages, check if pathname starts with href and is followed by '/' or end of string
        // This prevents false positives like '/about' matching '/about-us'
        const normalizedHref = href.endsWith('/') ? href.slice(0, -1) : href;
        const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
        
        return normalizedPathname === normalizedHref || normalizedPathname.startsWith(normalizedHref + '/');
    };

    return (
        <div>

            {/* rts footer area start */}
            <div className="rts-footer-area rts-section-gapTop pb--80">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className="logo-area">
                                <Link href="/#" className="logo">
                                    <BrandLogo />
                                </Link>
                                <p className="disc">
                                Justjobs Info is a platform for resume building, job search, and career resources, helping professionals advance and stand out.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-5">
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                    <div className="single-nav-area-footer">
                                        <p className="parent">Services</p>
                                        <ul>
                                            <li>
                                                <Link 
                                                    href="/resume-audit"
                                                    style={isActive('/resume-audit') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Resume Audit
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/resume-builder"
                                                    style={isActive('/resume-builder') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Resume Builder
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Job Listings
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/service"
                                                    style={isActive('/service') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Resources
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/askgenie"
                                                    style={isActive('/askgenie') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Ask Genie 
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/LearningManagementSystem"
                                                    style={isActive('/LearningManagementSystem') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    LMS (Coming Soon)
                                                </Link>
                                            </li>
                                            
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                    <div className="single-nav-area-footer">
                                        <p className="parent">Company</p>
                                        <ul>
                                            <li>
                                                <Link 
                                                    href="/about"
                                                    style={isActive('/about') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    About us
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/career"
                                                    style={isActive('/career') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Careers
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/team"
                                                    style={isActive('/team') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Our Team
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/blogs"
                                                    style={isActive('/blogs') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Our Blogs
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/#testimonials"
                                                    style={isActive('/') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Success Stories
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/contact"
                                                    style={isActive('/contact') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Contact
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                    <div className="single-nav-area-footer">
                                        <p className="parent">Industries</p>
                                        <ul>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=fintech"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Fintech
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=healthcare"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Healthcare
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=finance"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Finance
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=engineering"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Engineering
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=education"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Education
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/job-listing?industry=construction"
                                                    style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Construction
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                    <div className="single-nav-area-footer">
                                        <p className="parent">Legal</p>
                                        <ul>
                                            <li>
                                                <Link 
                                                    href="/terms-of-use"
                                                    style={isActive('/terms-of-use') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Terms of Use
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/privacy-policy"
                                                    style={isActive('/privacy-policy') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Privacy Policy
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/cookies-policy"
                                                    style={isActive('/cookies-policy') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Cookie Policy
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/faq"
                                                    style={isActive('/faq') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    FAQ
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/contact"
                                                    style={isActive('/contact') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Help & Support
                                                </Link>
                                            </li>
                                            <li>
                                                <Link 
                                                    href="/contact"
                                                    style={isActive('/contact') ? { color: 'var(--color-primary)' } : {}}
                                                >
                                                    Contact Us
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts footer area end */}
            {/* rts copyright area start */}
            <div className="rts-copyright-area-one">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="copyright-wrapper">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                        <p style={{ margin: 0 }}>© 2025 JustJobs. All rights reserved.</p>
                                        <span className={styles.desktopDevLink} style={{ 
                                            fontSize: 'inherit', 
                                            color: 'inherit'
                                        }}>
                                            | Developed by <Link href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>SillyLittleTools</Link>
                                        </span>
                                    </div>
                                    <p className={styles.mobileDevLink} style={{ 
                                        margin: 0, 
                                        fontSize: '12px', 
                                        color: '#888'
                                    }}>
                                        Developed by <Link href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>SillyLittleTools</Link>
                                    </p>
                                </div>
                                <div className="social-copyright-area">
                                    <ul>
                                        <li aria-label="Visit our Facebook page">
                                            <Link href="https://www.facebook.com/justjobsinfos/" target="_blank" rel="noopener noreferrer">
                                                <i className="fa-brands fa-facebook-f" />
                                            </Link>
                                        </li>
                                        <li aria-label="Follow us on X">
                                            <Link href="https://x.com/justjobs_info" target="_blank" rel="noopener noreferrer">
                                                <Image src="/xlogo.png" alt="Follow us on X" width={40} height={40} />
                                            </Link>
                                        </li>
                                        <li aria-label="Subscribe to our YouTube channel">
                                            <Link href="/#">
                                                <i className="fa-brands fa-youtube" />
                                            </Link>
                                        </li>
                                        <li aria-label="Connect with us on LinkedIn">
                                            <Link href="https://www.linkedin.com/company/justjobsng-com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fa-brands fa-linkedin" />
                                            </Link>
                                        </li>
                                        <li aria-label="Follow us on Instagram">
                                            <Link href="/#">
                                                <i className="fa-brands fa-instagram" />
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts copyright area end */}

        </div>
    )
}

export default FooterOneDynamic
