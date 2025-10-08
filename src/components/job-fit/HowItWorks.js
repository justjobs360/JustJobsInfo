import React from 'react';

export default function HowItWorks() {
    return (
        <div className="solution-expertice-area rts-section-gap bg-how-it-works">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="title-center-2">
                            <h2 className="title">How It Works</h2>
                            <p className="subtitle">Get Your Job Fit Analysis in 3 Simple Steps</p>
                        </div>
                    </div>
                </div>
                <div className="row g-0 mt--70" style={{ display: 'flex' }}>
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12" style={{ display: 'flex' }}>
                        <div className="single-solution-style-one border-left border-bottom-1" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className="right-draw">
                                <img
                                    loading="lazy"
                                    rel="preload"
                                    src="assets/images/service/icons/01.png"
                                    alt="icons"
                                />
                            </div>
                            <div className="icon">
                                <div className="step-number-icon">1</div>
                            </div>
                            <h4 className="title">Submit Job Details</h4>
                            <p className="disc">
                                Paste the complete job description including requirements, responsibilities, and qualifications you want to analyze.
                            </p>
                            <a href="#" className="btn-arrow">
                                Learn More
                                <img
                                    className="injectable"
                                    src="assets/images/icons/arrow-right.svg"
                                    alt="arrow"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12" style={{ display: 'flex' }}>
                        <div className="single-solution-style-one border-bottom-1" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className="right-draw">
                                <img
                                    loading="lazy"
                                    rel="preload"
                                    src="assets/images/service/icons/01.png"
                                    alt="icons"
                                />
                            </div>
                            <div className="icon">
                                <div className="step-number-icon">2</div>
                            </div>
                            <h4 className="title">Add Your Resume</h4>
                            <p className="disc">
                                Upload your resume file including experience, skills, education, and achievements for comprehensive comparison.
                            </p>
                            <a href="#" className="btn-arrow">
                                Learn More
                                <img
                                    className="injectable"
                                    src="assets/images/icons/arrow-right.svg"
                                    alt="arrow"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-4 col-md-6 col-sm-12 col-12" style={{ display: 'flex' }}>
                        <div className="single-solution-style-one border-bottom-1" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <div className="right-draw">
                                <img
                                    loading="lazy"
                                    rel="preload"
                                    src="assets/images/service/icons/01.png"
                                    alt="icons"
                                />
                            </div>
                            <div className="icon">
                                <div className="step-number-icon">3</div>
                            </div>
                            <h4 className="title">Get Objective Analysis</h4>
                            <p className="disc">
                                Receive honest feedback on your fit score, strengths, gaps, and actionable recommendations to improve your candidacy.
                            </p>
                            <a href="#" className="btn-arrow">
                                Learn More
                                <img
                                    className="injectable"
                                    src="assets/images/icons/arrow-right.svg"
                                    alt="arrow"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
