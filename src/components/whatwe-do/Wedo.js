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
                                    Luminous is a leading IT solutions company that provides
                                    innovative technology services to businesses of all sizes. We
                                    specialize in cloud computing, cybersecurity, data analytics, and
                                    custom software development.
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
                                    We bring together all the necessary technology and services to
                                    help our clients solve their business problems.
                                </p>
                                <a href="#" className="rts-btn btn-border btn-bold">
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
                                    We bring together all the necessary technology and services to
                                    help our clients solve their business problems.
                                </p>
                                <a href="#" className="rts-btn btn-border btn-bold">
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