"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
import { useEffect } from "react";
function CaseFive() {
  return (
    <div>

        {/* case studies start */}
        <div className="case-studies-area rts-section-gap position-relative">
            <div className="container">
            <div className="row">
                <div className="col-lg-12">
                <div className="title-style-4-center">
                    <h2 className="title">Featured case studies</h2>
                </div>
                </div>
            </div>
            <div className="row mt-0 g-80">
                <div
                className="col-lg-6 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                >
                <div className="single-case-studies">
                    <a href="/case-studies-single" className="thumbnail">
                    <img src="assets/images/case-studies/11.webp" alt="image" />
                    </a>
                    <div className="inner-content">
                    <span>NodeJS Development, Security</span>
                    <a href="/case-studies-single">
                        <h3 className="title">Evolus</h3>
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
                className="col-lg-6 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                >
                <div className="single-case-studies">
                    <a href="/case-studies-single" className="thumbnail">
                    <img src="assets/images/case-studies/12.webp" alt="image" />
                    </a>
                    <div className="inner-content">
                    <span>Cloud Migration, Web Design</span>
                    <a href="/case-studies-single">
                        <h3 className="title">Nextpart</h3>
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
                className="col-lg-6 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                >
                <div className="single-case-studies">
                    <a href="/case-studies-single" className="thumbnail">
                    <img src="assets/images/case-studies/13.webp" alt="image" />
                    </a>
                    <div className="inner-content">
                    <span>Cloud Migration, Web Design</span>
                    <a href="/case-studies-single">
                        <h3 className="title">Runtime</h3>
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
                className="col-lg-6 col-md-6 col-sm-6" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                >
                <div className="single-case-studies">
                    <a href="/case-studies-single" className="thumbnail">
                    <img src="assets/images/case-studies/14.webp" alt="image" />
                    </a>
                    <div className="inner-content">
                    <span>NodeJS Development, Security</span>
                    <a href="/case-studies-single">
                        <h3 className="title">Waveflow</h3>
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

export default CaseFive