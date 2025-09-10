import React from 'react'

function SolutionCounter() {
    return (
        <div>
            {/* solution by experts area */}
            <div className="solution-exparts-area-service-page">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="exparts-area-main-mt-dec">
                                <div className="title-area-center-inner-with-sub">
                                    <span>Designed for You</span>
                                    <h2 className="title">
                                    Innovative solutions designed to connect talent with opportunity.
                                    </h2>
                                    <a
                                        href="#"
                                        className="rts-btn btn-primary wow fadeInUp"
                                        data-wow-delay=".5s"
                                    >
                                        View Solutions
                                        <img
                                            className="injectable"
                                            src="assets/images/service/icons/13.svg"
                                            alt="arrow"
                                        />
                                    </a>
                                </div>
                                <div className="top-right-shape">
                                    <img
                                        className="wow toBottomLeft"
                                        src="assets/images/banner/shape/02.png"
                                        alt="shape"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* solution by experts end */}
            <div className="counter-up-wrapper">
                <div className="container">
                    <div className="row g-0">
                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                            <div className="single-counter-up-one border-top border-left">
                                <div className="icon-area">
                                    <img src="assets/images/about/icons/01.svg" alt="icon" />
                                </div>
                                <p>CV Enhancement</p>
                                <h3 className="title animated fadeIn">
                                    +<span className="counter animated fadeInDownBig">146</span>%
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                            <div className="single-counter-up-one border-top">
                                <div className="icon-area">
                                    <img src="assets/images/about/icons/02.svg" alt="icon" />
                                </div>
                                <p>Community users</p>
                                <h3 className="title animated fadeIn">
                                    <span className="counter animated fadeInDownBig">100</span>K
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                            <div className="single-counter-up-one border-top">
                                <div className="icon-area">
                                    <img src="assets/images/about/icons/03.svg" alt="icon" />
                                </div>
                                <p>Audit Improvements</p>
                                <h3 className="title animated fadeIn">
                                    <span className="counter animated fadeInDownBig">89</span>%
                                </h3>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                            <div className="single-counter-up-one border-top">
                                <div className="icon-area">
                                    <img src="assets/images/about/icons/04.svg" alt="icon" />
                                </div>
                                <p>Job Openings</p>
                                <h3 className="title animated fadeIn">
                                    <span className="counter animated fadeInDownBig">7200+</span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SolutionCounter