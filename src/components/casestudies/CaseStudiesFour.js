"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
function CaseStudiesFour() {
    return (
        <div>

            {/* case studies start */}
            <div className="case-studies-area rts-section-gap position-relative">
                <div className="shape-left-top">
                    <img
                        className="wow move-right"
                        src="assets/images/video/shape/03.png"
                        alt="shape"
                    />
                </div>
                <div className="shape-bottom">
                    <img
                        src="assets/images/video/shape/02.png"
                        alt=""
                        className="wow move-left"
                        data-wow-offset={120}
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="text-center-title-bg-white">
                                <h2 className="title">Case studies</h2>
                                <p>Here are our featured projects that empower businesses.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-0 g-80">
                        <div
                            className="col-lg-6 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/01.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title">Rocken SaaS App</h3>
                                    </a>
                                    <a href="/case-studies-single" className="rts-btn btn-border">
                                        View case study
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-6 col-sm-12 pt--80 pt_md--0 pt_sm--0" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/02.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>Cloud Migration, Web Design</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title">Hubdeck</h3>
                                    </a>
                                    <a href="/case-studies-single" className="rts-btn btn-border">
                                        View case study
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/03.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>Cloud Migration, Web Design</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title">Ficacu Agency</h3>
                                    </a>
                                    <a href="/case-studies-single" className="rts-btn btn-border">
                                        View case study
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-6 col-sm-12 pt--80 pt_md--0 pt_sm--0" data-aos="fade-up" data-aos-delay="700" data-aos-duration="1000"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/04.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title">Nexus App</h3>
                                    </a>
                                    <a href="/case-studies-single" className="rts-btn btn-border">
                                        View case study
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt--60">
                        <div className="col-lg-12">
                            <a
                                href="/case-studies"
                                className="rts-btn btn-border more-project-btn"
                            >
                                More projects
                                <img src="assets/images/service/icons/13.svg" alt="arrow" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* case studies end */}

        </div>
    )
}

export default CaseStudiesFour