"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
import AOS from "aos";
import { useEffect } from "react";
import "aos/dist/aos.css";
function BannerThree() {
  useEffect(() => {
    AOS.init({
      disableMutationObserver: true,
      once: true,
    });
  }, []);
  return (
    <div>
      {/* banner area start */}
      <div className="rts-banner-three-area rts-section-gap bg-banner-three">
        <div className="container pb--180 pb_sm--0">
          <div className="row">
            <div className="col-lg-6">
              <div className="banner-three-wrapper">
                <span className="pre-title" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000">IT Solutions Experts</span>
                <h1 className="title" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000">Revolutionize Purpose-driven Solutions</h1>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="inner-content-wrapper-three">
                <p data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000">
                  Wer not just IT providers – we your strategic partners in
                  digital transformation. With over a decade of experience and a
                  team of certified experts, we deliver tailored solutions that
                  drive growth, enhance efficiency, and secure your digital assets.
                </p>
                <a
                  href="/free-consultation"
                  className="rts-btn btn-primary" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                >
                  Schedule Now
                  <ReactSVG
                    src="assets/images/service/icons/13.svg"
                    alt="arrow"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="round-shape">
          <img src="assets/images/banner/shape/07.png" alt="banner" />
        </div>
        <div className="right-shape wow move-left">
          <img src="assets/images/banner/04.png" alt="banner" />
        </div>
        <div className="top-shape wow move-right">
          <img src="assets/images/banner/05.png" alt="banner" />
        </div>
      </div>
      {/* banner area end */}
      <div
        className="alrge-video-area rts-section-gapBottom mt-dec-banner-3"
        style={{ zIndex: 2 }}
      >
        <div className="container-large">
          <div className="row">
            <div className="col-lg-12 mt--70">
              <div className="image--large-video jarallax v3">
                <img
                  className="jarallax-img"
                  src="assets/images/banner/03.webp"
                  alt="large"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BannerThree