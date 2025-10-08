"use client";
import React from 'react'
import { useEffect } from "react";
import AOS from "aos";
import { ReactSVG } from 'react-svg';
import "aos/dist/aos.css";
function CtaFour() {
  useEffect(() => {
    AOS.init({
        disableMutationObserver: true,
        once: true,
    });
}, []);
  return (
    <div>
      <>
        {/* rts call to action area start */}
        <div className="rts-call-to-action-area-about rts-section-gapTop">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <h2 className="title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">Want to Get in Touch with Us?</h2>
                <p className="disc" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                Drop us a message to discuss your unique needs
                </p>
                <a
                  href="/contact"
                  className="rts-btn btn-primary" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500"
                >
                  Contact Us
                  <ReactSVG src="assets/images/service/icons/13.svg" alt="arrow" />
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* rts call to action area end */}
      </>

    </div>
  )
}

export default CtaFour
