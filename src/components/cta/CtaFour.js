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
                <h2 className="title" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="100">Book a Free Consultation</h2>
                <p className="disc" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="300">
                  Schedule a no-obligation consultation to discuss your unique needs
                  and how Luminous can elevate your business technology.
                </p>
                <a
                  href="#"
                  className="rts-btn btn-primary" data-aos="fade-up" data-aos-duration="1000" data-aos-delay="500"
                >
                  View Solutions
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