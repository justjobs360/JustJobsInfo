"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
import { useEffect } from "react";
function ServiceFour() {
  return (
    <div>

        {/* service area startt */}
        <div className="service-area-start mt-dec-service-3">
            <div className="container">
            <div className="row g-5">
                <div
                className="col-lg-4 col-md-6 col-sm-6 col-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000">
                <div className="single-service-area-4">
                    <div className="icon">
                    <img src="assets/images/service/icons/18.svg" alt="service" />
                    </div>
                    <div className="title-area">
                    <a href="/service-single">
                        <h3 className="title">Machine Learning</h3>
                        <ReactSVG
                        src="assets/images/service/icons/21.svg"
                        alt="icosn"
                        />
                    </a>
                    </div>
                </div>
                </div>
                <div
                className="col-lg-4 col-md-6 col-sm-6 col-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                >
                <div className="single-service-area-4">
                    <div className="icon">
                    <img src="assets/images/service/icons/19.svg" alt="service" />
                    </div>
                    <div className="title-area">
                    <a href="/service-single">
                        <h3 className="title">Cloud Migration</h3>
                        <ReactSVG
                        src="assets/images/service/icons/21.svg"
                        alt="icosn"
                        />
                    </a>
                    </div>
                </div>
                </div>
                <div
                className="col-lg-4 col-md-6 col-sm-6 col-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                >
                <div className="single-service-area-4">
                    <div className="icon">
                    <img src="assets/images/service/icons/20.svg" alt="service" />
                    </div>
                    <div className="title-area">
                    <a href="/service-single">
                        <h3 className="title">Cyber Security</h3>
                        <ReactSVG
                        src="assets/images/service/icons/21.svg"
                        alt="icosn"
                        />
                    </a>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        {/* service area end */}

    </div>
  )
}

export default ServiceFour