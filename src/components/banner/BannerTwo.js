"use client"
import React, { useEffect } from 'react';
// import { jarallax } from "jarallax";
import { ReactSVG } from 'react-svg';
import AOS from "aos";
import "aos/dist/aos.css";
function BannerTwo() {
    // useEffect(() => {
    //     // Initialize Jarallax when the component mounts
    //     jarallax(document.querySelectorAll(".jarallax"), {
    //         speed: 0.5,
    //     });
    // }, []);
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    return (
        <div>
            {/* rts banner area start */}
            <div className="rts-banner-area-style-narrow rts-section-gapTop position-relative">
                <div className="shape-top-right">
                    <img
                        className="wow toBottomLeft"
                        src="assets/images/banner/shape/02.png"
                        alt=""
                    />
                </div>
                <div className="shape-bottom-left">
                    <img
                        className="wow toTopRight"
                        src="assets/images/banner/shape/04.png"
                        alt=""
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            {/* banner area start */}
                            <div className="rts-banner-area-two">
                                <span data-aos-delay="100" data-aos="fade-up" data-aos-duration="1000">
                                    IT Solutions Experts
                                </span>
                                <h1 className="title" data-aos-delay="200" data-aos="fade-up" data-aos-duration="1000">
                                    Unified platform that fosters innovation
                                </h1>
                                <div className="button-wrapper" data-aos-delay="400" data-aos="fade-up" data-aos-duration="1000">
                                    <a
                                        href="service.html"
                                        className="rts-btn btn-primary wow fadeInUp"
                                        data-wow-delay=".3s"
                                    >
                                        View Solutions
                                        <ReactSVG
                                            src="assets/images/banner/01.svg"
                                            alt="icons"
                                        />
                                    </a>
                                    <a
                                        href="contact.html"
                                        className="rts-btn btn-border wow fadeInUp"
                                        data-wow-delay=".5s"
                                    >
                                        Login
                                        <ReactSVG
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                            </div>
                            {/* banner area end */}
                        </div>
                    </div>
                </div>
                <div className="container-large mt--80">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="image-banner-cottom-wrapper">
                                <div className="single-leftt-large-iamge jarallax jara-mask-1">
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/banner/01.webp"
                                        alt="banner"
                                    />
                                </div>
                                <div className="single-right-large-iamge jarallax jara-mask-1">
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/banner/02.webp"
                                        alt="banner"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts banner area end */}
            
        </div>
    )
}

export default BannerTwo