"use client"
import React, { useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
function ServiceSix() {
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    return (
        <>
            {/* service area start */}
            <div className="gap-service-area rts-section-gap bg-light">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-area-center-inner-with-sub">
                                <span>Our services</span>
                                <h2 className="title">Cutting-edge IT Solutions</h2>
                                <p className="disc">
                                    Offers a unified platform that fosters innovation while providing
                                    end-to-end data management. See how we help your team solve
                                    today’s biggest challenges.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 mt--50">
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/39.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">IT Strategies</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/40.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Cloud Migration</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/35.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Cyber Security</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/36.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Development</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/37.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">It Service</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/38.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Design Service</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/39.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Writing</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <img src="assets/images/service/icons/40.svg" alt="service" />
                                </div>
                                <div className="title-area">
                                    <a href="/service-single">
                                        <h3 className="title animated fadeIn">Cloud Migratio</h3>
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/21.svg"
                                            alt="icosn"
                                        />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 d-flex justify-content-center">
                            <a href="service.html" className="rts-btn btn-border btn-bold mt--80">
                                View all solutions
                                <img src="assets/images/service/icons/13.svg" alt="arrow" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* service area end */}
        </>

    )
}

export default ServiceSix