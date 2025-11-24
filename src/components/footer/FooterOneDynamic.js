"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './FooterOne.module.css';

function FooterOneDynamic() {
    const pathname = usePathname();
    const [footerData, setFooterData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFooterData();
    }, []);

    const loadFooterData = async () => {
        try {
            const response = await fetch('/api/footer');
            const data = await response.json();
            
            if (data.success) {
                setFooterData(data.data);
            } else {
                // Fallback to default data if API fails
                setFooterData(getDefaultFooterData());
            }
        } catch (error) {
            console.error('Error loading footer data:', error);
            // Fallback to default data
            setFooterData(getDefaultFooterData());
        } finally {
            setLoading(false);
        }
    };

    const getDefaultFooterData = () => ({
        description: 'Justjobs Info is a platform for resume building, job search, and career resources, helping professionals advance and stand out.',
        copyright: '© 2025 JustJobs. All rights reserved.',
        developer_credit: 'Developed by <a href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">SillyLittleTools</a>',
        sections: [
            {
                id: 'services',
                title: 'Services',
                links: [
                    { id: 'resume-audit', text: 'Resume Audit', href: '/resume-audit' },
                    { id: 'resume-builder', text: 'Resume Builder', href: '/resume-builder' },
                    { id: 'job-listing', text: 'Job Listings', href: '/job-listing' },
                    { id: 'resources', text: 'Resources', href: '/service' },
                    { id: 'askgenie', text: 'Ask Genie', href: '/askgenie' },
                    { id: 'lms', text: 'LMS (Coming Soon)', href: '/LearningManagementSystem' }
                ]
            },
            {
                id: 'company',
                title: 'Company',
                links: [
                    { id: 'about', text: 'About us', href: '/about' },
                    { id: 'career', text: 'Careers', href: '/career' },
                    { id: 'team', text: 'Our Team', href: '/team' },
                    { id: 'blogs', text: 'Our Blogs', href: '/blogs' },
                    { id: 'testimonials', text: 'Success Stories', href: '/#testimonials' },
                    { id: 'contact', text: 'Contact', href: '/contact' }
                ]
            },
            {
                id: 'industries',
                title: 'Industries',
                links: [
                    { id: 'fintech', text: 'Fintech', href: '/job-listing?industry=fintech' },
                    { id: 'healthcare', text: 'Healthcare', href: '/job-listing?industry=healthcare' },
                    { id: 'finance', text: 'Finance', href: '/job-listing?industry=finance' },
                    { id: 'engineering', text: 'Engineering', href: '/job-listing?industry=engineering' },
                    { id: 'education', text: 'Education', href: '/job-listing?industry=education' },
                    { id: 'construction', text: 'Construction', href: '/job-listing?industry=construction' }
                ]
            },
            {
                id: 'legal',
                title: 'Legal',
                links: [
                    { id: 'terms', text: 'Terms of Use', href: '/terms-of-use' },
                    { id: 'privacy', text: 'Privacy Policy', href: '/privacy-policy' },
                    { id: 'cookies', text: 'Cookie Policy', href: '/cookies-policy' },
                    { id: 'faq', text: 'FAQ', href: '/faq' },
                    { id: 'support', text: 'Help & Support', href: '/contact' },
                    { id: 'contact-us', text: 'Contact Us', href: '/contact' }
                ]
            }
        ],
        social_links: [
            { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook-f', href: 'https://www.facebook.com/justjobsinfos/', aria_label: 'Visit our Facebook page' },
            { id: 'x', name: 'X (Twitter)', icon: 'custom-x', href: 'https://x.com/justjobs_info', aria_label: 'Follow us on X' },
            { id: 'youtube', name: 'YouTube', icon: 'fa-brands fa-youtube', href: '/#', aria_label: 'Subscribe to our YouTube channel' },
            { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', href: 'https://www.linkedin.com/company/justjobsng-com/', aria_label: 'Connect with us on LinkedIn' },
            { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', href: '/#', aria_label: 'Follow us on Instagram' }
        ]
    });

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

    // Render social icon
    const renderSocialIcon = (socialLink) => {
        if (socialLink.icon === 'custom-x') {
            return (
                <Image src="/xlogo.png" alt={socialLink.aria_label} width={40} height={40} />
            );
        }
        return (
            <i className={socialLink.icon} />
        );
    };

    if (loading) {
        return (
            <div className="rts-footer-area rts-section-gapTop pb--80">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
                                Loading footer...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!footerData) {
        return null;
    }

    return (
        <div>
            {/* rts footer area start */}
            <div className="rts-footer-area rts-section-gapTop pb--80">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className="logo-area">
                                <Link href="/#" className="logo">
                                    <img src="/assets/images/logo/justjobslogo.png" className='header-logo' alt="JustJobs logo" />
                                </Link>
                                <p className="disc" dangerouslySetInnerHTML={{ __html: footerData.description }} />
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="row g-5">
                                {footerData.sections?.map((section) => (
                                    <div key={section.id} className="col-lg-3 col-md-6 col-sm-6 col-12">
                                        <div className="single-nav-area-footer">
                                            <p className="parent">{section.title}</p>
                                            <ul>
                                                {section.links?.map((link) => (
                                                    <li key={link.id}>
                                                        <Link 
                                                            href={link.href}
                                                            style={isActive(link.href) ? { color: 'var(--color-primary)' } : {}}
                                                        >
                                                            {link.text}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
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
                                        <p style={{ margin: 0 }}>{footerData.copyright}</p>
                                        <span className={styles.desktopDevLink} style={{ 
                                            fontSize: 'inherit', 
                                            color: 'inherit'
                                        }} dangerouslySetInnerHTML={{ __html: `| ${footerData.developer_credit}` }} />
                                    </div>
                                    <p className={styles.mobileDevLink} style={{ 
                                        margin: 0, 
                                        fontSize: '12px', 
                                        color: '#888'
                                    }} dangerouslySetInnerHTML={{ __html: footerData.developer_credit }} />
                                </div>
                                <div className="social-copyright-area">
                                    <ul>
                                        {footerData.social_links?.map((socialLink) => (
                                            <li key={socialLink.id} aria-label={socialLink.aria_label}>
                                                <Link href={socialLink.href} target="_blank" rel="noopener noreferrer">
                                                    {renderSocialIcon(socialLink)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts copyright area end */}
        </div>
    );
}

export default FooterOneDynamic;
