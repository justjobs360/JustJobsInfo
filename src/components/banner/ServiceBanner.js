import React from 'react'

function ServiceBanner() {
    return (
        <div>
            {/* rts service banner area start */}
            <div className="rts-service-banner-area ptb--80 position-relative">
                <div className="container">
                    <div className="row d-flex align-items-center">
                        <div className="col-lg-7 mb_md--30 mb_sm--30">
                            <div className="service-banner-content-wrapper">
                                <div
                                    className="bread-plug wow fadeInUp"
                                    data-wow-offset={120}
                                    data-wow-delay=".2s"
                                >
                                    <a href="#">Home</a>
                                    <i className="fa-regular fa-chevron-right" />
                                    <a className="current" href="#">
                                        Services
                                    </a>
                                </div>
                                <h1
                                    className="title wow fadeInUp"
                                    data-wow-offset={120}
                                    data-wow-delay=".4s"
                                >
                                    See how we help your team solve today’s biggest challenges
                                </h1>
                                <p
                                    className="disc wow fadeInUp"
                                    data-wow-offset={120}
                                    data-wow-delay=".6s"
                                >
                                    Offers a unified platform that fosters innovation while providing
                                    end-to-end data management.
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="thumbnail-bannr-service-right jarallax">
                                <img
                                    className="jarallax-img"
                                    src="assets/images/service/04.webp"
                                    alt="serivce-area"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shape-area-start">
                    <img
                        src="assets/images/banner/06.png"
                        alt="service-banner-shape"
                        className="one wow move-right"
                    />
                    <img
                        src="assets/images/banner/07.png"
                        alt="service-banner-shape"
                        className="two wow move-left"
                    />
                </div>
            </div>
            {/* rts service banner area end */}
        </div>
    )
}

export default ServiceBanner