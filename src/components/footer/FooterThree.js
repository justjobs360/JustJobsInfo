"use client"
import React from 'react'
import Link from 'next/link';
import Image from 'next/image';
function FooterThree() {
  return (
    <div>

        <div className="gradient-footer-wrapper">
            {/* rts footer area start */}
            <div className="rts-footer-area rts-section-gapTop pb--80">
            <div className="container">
                <div className="row">
                <div className="col-lg-5">
                    <div className="logo-area">
                    <Link href="#" className="logo">
                        <Image
                            src="/assets/images/logo/justjobslogo.png"
                            className="header-logo"
                            alt="JustJobs logo"
                            width={160}
                            height={50}
                        />
                    </Link>
                    <p className="disc">
                        JustJobs is a leading career platform that helps job seekers find their dream jobs 
                        and provides innovative tools for resume building, career guidance, and professional growth.
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
                            <Link href="/resume-builder">Resume Builder</Link>
                            </li>
                            <li>
                            <Link href="/job-listing">Job Listings</Link>
                            </li>
                            <li>
                            <Link href="/career-guidance">Career Guidance</Link>
                            </li>
                            <li>
                            <Link href="/resume-audit">Resume Audit</Link>
                            </li>
                            <li>
                            <Link href="/interview-prep">Interview Prep</Link>
                            </li>
                            <li>
                            <Link href="/downloadable-resources">Resources</Link>
                            </li>
                        </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                        <div className="single-nav-area-footer">
                        <p className="parent">Company</p>
                        <ul>
                            <li>
                            <Link href="/about">About us</Link>
                            </li>
                            <li>
                            <Link href="/career">Careers</Link>
                            </li>
                            <li>
                            <Link href="/team">Our Team</Link>
                            </li>
                            <li>
                            <Link href="/blogs">News & Blog</Link>
                            </li>
                            <li>
                            <Link href="/success-stories">Success Stories</Link>
                            </li>
                            <li>
                            <Link href="/contact">Contact</Link>
                            </li>
                        </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                        <div className="single-nav-area-footer">
                        <p className="parent">Job Categories</p>
                        <ul>
                            <li>
                            <Link href="/jobs/technology">Technology</Link>
                            </li>
                            <li>
                            <Link href="/jobs/healthcare">Healthcare</Link>
                            </li>
                            <li>
                            <Link href="/jobs/finance">Finance</Link>
                            </li>
                            <li>
                            <Link href="/jobs/marketing">Marketing</Link>
                            </li>
                            <li>
                            <Link href="/jobs/education">Education</Link>
                            </li>
                            <li>
                            <Link href="/jobs/remote">Remote Jobs</Link>
                            </li>
                        </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                        <div className="single-nav-area-footer">
                        <p className="parent">Legal</p>
                        <ul>
                            <li>
                            <Link href="/terms-of-use">Terms of Use</Link>
                            </li>
                            <li>
                            <Link href="/privacy-policy">Privacy Policy</Link>
                            </li>
                            <li>
                            <Link href="/cookies-policy">Cookie Policy</Link>
                            </li>
                            <li>
                            <Link href="/faq">FAQ</Link>
                            </li>
                            <li>
                            <Link href="/support">Help & Support</Link>
                            </li>
                            <li>
                            <Link href="/contact">Contact Us</Link>
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
                    <p>© 2025 JustJobs. All rights reserved.</p>
                    <div className="social-copyright-area">
                        <ul>
                        <li aria-label="Visit our Facebook page">
                            <Link href="https://www.facebook.com/justjobsinfos/" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-facebook-f" />
                            </Link>
                        </li>
                        <li aria-label="Follow us on X">
                            <Link href="https://x.com/justjobs_info" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-x-twitter" />
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
        {/* pre loader area start */}

    </div>
  )
}

export default FooterThree
