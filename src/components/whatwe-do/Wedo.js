import React from 'react'

function Wedo() {
    return (
        <div>
            {/* what we do area start */}
            <div className="what-we-do-area-start rts-section-gap">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="what-we-do-wrapper-about">
                                <p className="disc">
                                JustJobs.Info provides essential tools and resources to help job seekers succeed in their career journey. We offer professionally curated job postings tailored to match you with the best opportunities.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt--40 g-5">
                        <div
                            className="col-lg-6 col-md-6 col-sm-12 wow fadeInUp"
                            data-wow-offset={120}
                            data-wow-delay=".2s"
                        >
                            <div className="what-we-do-main-wrapper">
                                <h5 className="title">What we do?</h5>
                                <p className="disc">
                                We bring together the necessary tools to help you along your career path
                                </p>
                                <a href="/login" className="rts-btn btn-border btn-bold">
                                    Login
                                    <img src="assets/images/service/icons/13.svg" alt="arrow" />
                                </a>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-6 col-sm-12 wow fadeInUp"
                            data-wow-offset={120}
                            data-wow-delay=".6s"
                        >
                            <div className="what-we-do-main-wrapper">
                                <h5 className="title">Our Career</h5>
                                <p className="disc">
                                We foster a culture where creative thinking and fresh perspectives are encouraged.
                                </p>
                                <a href="/career" className="rts-btn btn-border btn-bold">
                                    Career
                                    <img src="assets/images/service/icons/13.svg" alt="arrow" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* what we do area end */}
        </div>
    )
}

export default Wedo
