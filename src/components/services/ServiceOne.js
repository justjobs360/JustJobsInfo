"use client"
import React from 'react'
import Link from 'next/link'
import { ReactSVG } from 'react-svg';
import './ServiceOne.css';

function ServiceOne() {
    return (
        <div>
            {/* solution expertiece */}
            <div className="solution-expertice-area rts-section-gap bg-solution">
                <div className="top-left wow slideInLeft">
                    <img
                        loading="lazy"
                        rel="preload"
                        src="assets/images/service/icons/02.png"
                        alt="service"
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-center-2">
                                <h2 className="title">Why Our Platform Works for Job Seekers!</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row g-0 mt--70">
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one border-left">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">CV Audit & Enhancement</h4>
                                <p className="disc">
                                Upload your CV and get instant analysis on grammar, structure, and content. Receive a CV score and suggestions for improvement.
                                </p>
                                <Link href="/resume-audit" className="btn-arrow" aria-label="Learn more about CV Audit and Enhancement">
                                    Learn More About CV Audit
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/02.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">Tailored Job Listings</h4>
                                <p className="disc">
                                Find the best jobs filtered by type, location, industry, and salary. Apply externally or bookmark jobs to revisit later.
                                </p>
                                <Link href="/job-listing" className="btn-arrow" aria-label="Learn more about Tailored Job Listings">
                                    Learn More About Job Listings
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/03.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">Job Alerts</h4>
                                <p className="disc">
                                Stay ahead with email notifications for job openings that match your liking and preferences all year around.
                                </p>
                                <Link href="/job-alerts" className="btn-arrow" aria-label="Learn more about Job Alerts">
                                    Learn More About Job Alerts
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one border-left border-bottom-1">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/04.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">Smart Resume Templates</h4>
                                <p className="disc">
                                Enter your info once, choose from sleek templates, and download a polished resume instantly.
                                </p>
                                <Link href="/resume-builder" className="btn-arrow" aria-label="Learn more about Smart Resume Templates">
                                    Learn More About Resume Builder
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one border-bottom-1">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/05.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">Free Resources</h4>
                                <p className="disc">
                                Access downloadable guides, templates, and tips to help you land your dream job.
                                </p>
                                <Link href="/downloadable-resources" className="btn-arrow" aria-label="Learn more about Free Resources">
                                    Learn More About Free Resources
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-12 col-12">
                            <div className="single-solution-style-one border-bottom-1">
                                <div className="right-draw">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/01.png"
                                        alt="icons"
                                    />
                                </div>
                                <div className="icon">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/service/icons/06.svg"
                                        alt="service"
                                    />
                                </div>
                                <h4 className="title">Career Blog</h4>
                                <p className="disc">
                                Stay informed with updates, job market trends, and application strategies from hiring experts.
                                </p>
                                <Link href="/blogs" className="btn-arrow" aria-label="Learn more about our Career Blog">
                                    Learn More About Our Blog
                                    <img
                                        className="injectable"
                                        src="assets/images/icons/arrow-right.svg"
                                        alt="arrow"
                                    />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* solution expertiece end */}
        </div>
    )
}

export default ServiceOne
