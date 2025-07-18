"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
function CtaTwo() {
    return (
        <div>
            {/* rts cta area start */}
            <div className="rts-cta-area-two rts-section-gap position-relative bg_cta-one bg_iamge">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="main-area-wrapper-cta">
                                <span className="pre-title">Need a hand ?</span>
                                <h2 className="title">
                                    Encourages scheduling a no-obligation consultation
                                </h2>
                                <p>Offers a 30-day free trial of Luminous Managed IT Services.</p>
                                <a href="contact.html" className="rts-btn btn-bold btn-border">
                                    Begin Free Trials
                                    <ReactSVG
                                        src="assets/images/service/icons/13.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shape-iamge">
                    <img
                        src="assets/images/cta/03.png"
                        alt="cta"
                        className="one wow toBottomLeft"
                        data-wow-offset={150}
                    />
                    <img
                        src="assets/images/cta/04.png"
                        alt="cta"
                        className="two wow toTopRight"
                        data-wow-offset={150}
                    />
                </div>
                <div className="bg-cta-area-two">
                    <img src="assets/images/cta/01.webp" alt="cta background"></img>
                </div>
            </div>
            {/* rts cta area s */}

        </div>
    )
}

export default CtaTwo