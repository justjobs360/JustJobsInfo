"use client";
import { useEffect } from "react";
import React from 'react'
import { ReactSVG } from 'react-svg';
import AOS from "aos";
import "aos/dist/aos.css";
function BannerCaseStudies() {
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    return (
        <div>
            {/* rts case studies banner area start */}
            <div className="rts-case-studies-banner-area">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="case-studies-banner-top">
                                <h1 className="title">Case studies</h1>
                                <p>Here are our featured projects that empower businesses.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shape-left-top">
                    <img src="assets/images/case-studies/01.png" alt="case" />
                </div>
            </div>
            {/* rts case studies banner area end */}
            {/* case studies area start */}
            <div className="single-large-case-studies-area">
                <div className="container">
                    <div className="row g-80">
                        <div className="col-lg-12">
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/18.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Rocken SaaS App</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/01.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Rocken SaaS App</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/03.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Ficacu Agency</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/02.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Hubdeck</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/04.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Nexus App</h3>
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
                            className="col-lg-12"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/19.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Rocken SaaS App</h3>
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
                            className="col-lg-6 wow fadeInUp" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/01.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Rocken SaaS App</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/03.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Ficacu Agency</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/02.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Hubdeck</h3>
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
                            className="col-lg-6" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300"
                        >
                            <div className="single-case-studies">
                                <a href="/case-studies-single" className="thumbnail">
                                    <img src="assets/images/case-studies/04.webp" alt="image" />
                                </a>
                                <div className="inner-content">
                                    <span>NodeJS Development, Security</span>
                                    <a href="/case-studies-single">
                                        <h3 className="title animated fadeIn">Nexus App</h3>
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
                </div>
            </div>
            {/* case studies area end */}
        </div>
    )
}

export default BannerCaseStudies