"use client"
import React from 'react'
import { useEffect } from "react";
import AOS from "aos";
import { ReactSVG } from 'react-svg';
import "aos/dist/aos.css";
function BannerFive() {
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    return (
        <div>

            {/* rts banner area start */}
            <div className="rts-banner-area-five rts-section-gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="banner-inner-wrapper-five">
                                <h1
                                    className="title" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                                >
                                    Cloud computing for your <span>business</span>
                                </h1>
                                <p
                                    className="disc" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                                >
                                    Learn best practices, avoid common pitfalls, and discover how to
                                    maximize the benefits of cloud computing for your business.
                                </p>
                                <a
                                    href="#"
                                    className="rts-btn btn-primary btn-bold" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                                >
                                    Start Your Transformation
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="round-shape-one">
                    <img src="assets/images/banner/02.svg" alt="banner" />
                </div>
            </div>
            {/* rts banner area end */}

        </div>
    )
}

export default BannerFive