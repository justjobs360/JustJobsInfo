"use client";
import React from "react";
import { useEffect } from "react";
import Rellax from "rellax";
function AboutBanner() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            new Rellax(".rellax", { speed: 5 });
        }
    }, []);
    const styling = {
        backgroundImage: `url(assets/images/about/01.webp)`,
    };
    return (
        <div>
            <>
                {/* about-banner area start */}
                <div className="about-banner-area-bg jarallax" style={styling}></div>
                {/* about-banner area end */}
                {/* counter area start */}
                <div className="counter-up-wrapper mt-dec-80">
                    <div className="container">
                        <div className="row g-0">
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-counter-up-one border-top border-left">
                                    <div className="icon-area">
                                        <img src="assets/images/about/icons/01.svg" alt="icon" />
                                    </div>
                                    <p>Accelerate Growth</p>
                                    <h3 className="title">
                                        +<span className="counter">46</span>%
                                    </h3>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-counter-up-one border-top">
                                    <div className="icon-area">
                                        <img src="assets/images/about/icons/02.svg" alt="icon" />
                                    </div>
                                    <p>Community users</p>
                                    <h3 className="title">
                                        <span className="counter">100</span>K
                                    </h3>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-counter-up-one border-top">
                                    <div className="icon-area">
                                        <img src="assets/images/about/icons/03.svg" alt="icon" />
                                    </div>
                                    <p>Enhance Security</p>
                                    <h3 className="title">
                                        <span className="counter">89</span>%
                                    </h3>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6">
                                <div className="single-counter-up-one border-top">
                                    <div className="icon-area">
                                        <img src="assets/images/about/icons/04.svg" alt="icon" />
                                    </div>
                                    <p>Reduce Costs</p>
                                    <h3 className="title">
                                        <span className="counter">720</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>

        </div>
    )
}

export default AboutBanner