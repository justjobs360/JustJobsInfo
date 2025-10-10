"use client"
import React from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactSVG } from 'react-svg';

function Nav() {
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

    // Special handling for Resources dropdown - active if any sub-resource is active
    const isResourcesActive = () => {
        return isActive('/important-links') || 
               isActive('/downloadable-resources') || 
               isActive('/service');
    };

    return (
        <div>
            <div className="nav-area">
                <nav>
                    <ul>
                        <li className="has-dropdown">
                            <Link 
                                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                                href="/"
                                style={isActive('/') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Home
                            </Link>
                        </li>
                        <li className="has-dropdown position-static with-megamenu margin-single-0">
                            <Link 
                                className={`nav-link ${isActive('/resume-audit') ? 'active' : ''}`} 
                                href="/resume-audit"
                                style={isActive('/resume-audit') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Resume Audit
                            </Link>
                        </li>
                        <li className="has-dropdown position-static with-megamenu margin-single-0">
                            <Link 
                                className={`nav-link ${isActive('/resume-builder') ? 'active' : ''}`} 
                                href="/resume-builder"
                                style={isActive('/resume-builder') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Resume Builder
                            </Link>
                        </li>
                        <li className="has-dropdown position-static with-megamenu margin-single-0">
                            <Link 
                                className={`nav-link ${isActive('/job-fit') ? 'active' : ''}`} 
                                href="/job-fit"
                                style={isActive('/job-fit') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Job Fit
                            </Link>
                        </li>
                        <li>
                            <Link 
                                className={`nav-link ${isActive('/job-listing') ? 'active' : ''}`} 
                                href="/job-listing"
                                style={isActive('/job-listing') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Job Listings
                            </Link>
                        </li>
                        <li className="has-dropdown position-static with-megamenu">
                            <Link 
                                className={`nav-link ${isResourcesActive() ? 'active' : ''}`} 
                                href="/service"
                                style={isResourcesActive() ? { color: 'var(--color-primary)' } : {}}
                            >
                                Resources{" "}
                                <i className="fa-duotone fa-regular fa-chevron-down" />
                            </Link>
                            <div className="submenu">
                                <div className="container">
                                    <div className="row align-items-center">
                                        
                                        <div className="col-lg-6">
                                            <ul className="single-menu parent-nav">
                                            <li>
                                                    <Link
                                                        className={`single-service-area-wrapper ${isActive('/important-links') ? 'active' : ''}`}
                                                        href="/important-links"
                                                        style={isActive('/important-links') ? { color: 'var(--color-primary)' } : {}}
                                                    >
                                                        <div className="icon">
                                                            <img
                                                                src="/assets/images/service/icons/23.svg"
                                                                alt="service"
                                                            />
                                                        </div>
                                                        <div className="info">
                                                            <h4 className="title" style={isActive('/important-links') ? { color: 'var(--color-primary)' } : {}}>Important Links</h4>
                                                            <p>Links to help you land your dream Job</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                                
                                            </ul>
                                        </div>
                                        <div className="col-lg-6">
                                            <ul className="single-menu parent-nav">
                                            <li>
                                                    <Link
                                                        className={`single-service-area-wrapper ${isActive('/downloadable-resources') ? 'active' : ''}`}
                                                        href="/downloadable-resources"
                                                        style={isActive('/downloadable-resources') ? { color: 'var(--color-primary)' } : {}}
                                                    >
                                                        <div className="icon">
                                                            <img
                                                                src="/assets/images/service/icons/24.svg"
                                                                alt="service"
                                                            />
                                                        </div>
                                                        <div className="info">
                                                            <h4 className="title" style={isActive('/downloadable-resources') ? { color: 'var(--color-primary)' } : {}}>Downloadable Resources</h4>
                                                            <p>Explore and Download Helpful Resources</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li className="has-dropdown">
                            <Link 
                                className={`nav-link ${isActive('/blogs') ? 'active' : ''}`} 
                                href="/blogs"
                                style={isActive('/blogs') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Blog 
                            </Link>
                        </li>
                        <li>
                            <Link 
                                className={`nav-link ${isActive('/askgenie') ? 'active' : ''}`} 
                                href="/askgenie"
                                style={isActive('/askgenie') ? { color: 'var(--color-primary)' } : {}}
                            >
                                Ask Genie
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    )
}

export default Nav
