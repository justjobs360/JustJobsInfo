"use client"
import React from 'react'
import Link from 'next/link';
import { ReactSVG } from 'react-svg';
function FooterTwo() {
    return (
        <div>
            {/* rts call to action area start */}
            <div className="rts-call-to-action-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="cta-two-wrapper">
                                <div className="inner">
                                    <h2 className="title">Ready to Find Your Dream Job?</h2>
                                    <p>
                                        Join thousands of job seekers who have found success with JustJobs. Start your journey today with our free tools and resources.
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="rts-btn btn-primary wow fadeInUp"
                                        data-wow-delay=".5s"
                                    >
                                        Schedule Now
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </Link>
                                </div>
                                <div className="shape-area">
                                    <img
                                        src="assets/images/cta/05.png"
                                        alt="cta"
                                        className="one wow toBottomLeft"
                                    />
                                    <img
                                        src="assets/images/cta/06.png"
                                        alt="cta"
                                        className="two wow toTopRight"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts call to action area end */}
            {/* rts footer area start */}
            <div className="rts-footer-area rts-section-gapTop pb--80">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 col-md-12">
                            <div className="logo-area">
                                <Link href="#" className="logo">
                                    <img src="/assets/images/logo/justjobslogo.png" className='header-logo' alt="JustJobs logo" />
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
                                                <Link href="/technologies-service">Technologies</Link>
                                            </li>
                                            <li>
                                                <Link href="/ai-learning-service">Ai Learning</Link>
                                            </li>
                                            <li>
                                                <Link href="/it-strategies">IT Strategies</Link>
                                            </li>
                                            <li>
                                                <Link href="/it-consulting-service">It Consulting</Link>
                                            </li>
                                            <li>
                                                <Link href="/management-service">Management</Link>
                                            </li>
                                            <li>
                                                <Link href="/service-single">Cloud Migration</Link>
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
                                                <Link href="/partner">Partner</Link>
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
                                        <li aria-label="Visit our X page">
                                            <Link href="https://x.com/justjobs_info" target="_blank" rel="noopener noreferrer">
                                                <i className="fa-brands fa-x-twitter" />
                                            </Link>
                                        </li>
                                        <li aria-label="Visit our Youtube page">
                                            <Link href="/#">
                                                <i className="fa-brands fa-youtube" />
                                            </Link>
                                        </li>
                                        <li aria-label="Visit our Linkedin page">
                                            <Link href="https://www.linkedin.com/company/justjobsng-com/" target="_blank" rel="noopener noreferrer">
                                                <i className="fa-brands fa-linkedin" />
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

export default FooterTwo