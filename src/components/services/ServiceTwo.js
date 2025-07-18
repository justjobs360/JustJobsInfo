"use client"
import { ReactSVG } from 'react-svg';
import React, { useEffect } from 'react';
import AOS from "aos";
function ServiceTwo() {
    useEffect(() => {
        AOS.init({
            disableMutationObserver: true,
            once: true,
        });
    }, []);
    return (
        <div>

            {/* solution area start */}
            <div className="rts-solution-area rts-section-gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-center-style-two">
                                <h2 className="title">More solutions..</h2>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 mt--30">
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/07.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                Cloud Migration
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/08.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                Machine Learning
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/09.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                Cyber Security
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/10.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                Digital Transformation
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/11.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                IoT Integration
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div
                            className="col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500"
                        >
                            {/* signle service area start */}
                            <div className="single-service-style-two">
                                <div className="inner">
                                    <div className="icon">
                                        <img src="assets/images/service/icons/12.svg" alt="service" />
                                    </div>
                                    <div className="bottom">
                                        <a href="service-single.html">
                                            <h3 className="title">
                                                Web Development
                                                <img
                                                    className="injectable"
                                                    src="assets/images/service/icons/13.svg"
                                                    alt="service"
                                                />
                                            </h3>
                                            <p className="disc">
                                                Shared team inboxes keep everyone on the same page and in
                                                the loop.
                                            </p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            {/* single service end */}
                        </div>
                        <div className="col-lg-12 d-flex justify-content-center mt--80">
                            <a href="service.html" className="btn-bold rts-btn btn-border ">
                                View all solutions
                                <ReactSVG
                                    src="assets/images/service/icons/13.svg"
                                    alt="arrow"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            {/* solution area end */}


        </div>
    )
}

export default ServiceTwo