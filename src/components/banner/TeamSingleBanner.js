import React from 'react'

function TeamSingleBanner() {
    return (
        <div>
            {/* team single banner area start */}
            <div className="team-single-banner-area rts-section-gap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-5">
                            <div
                                className="banner-thumbnail wow scaleIn"
                                data-wow-delay=".1s"
                                data-wow-duration=".5s"
                            >
                                <img src="assets/images/team/06.webp" alt="" />
                            </div>
                        </div>
                        <div className="col-lg-7 pl--50 pl_md--15 pl_sm--15 mt_md--30 mt_sm--30">
                            <div className="single-team-content">
                                <h1 className="title wow fadeInUp" data-wow-delay=".1s">
                                    Christopher Henry
                                </h1>
                                <p className="wow fadeInUp" data-wow-delay=".3s">
                                    Christopher is a highly skilled Tech Management with a wealth of
                                    experience in cloud computing, cybersecurity. Bringing a passion
                                    for innovation and a commitment to excellence, He plays a pivotal
                                    role in delivering impactful solutions at Digix IT Solution.
                                </p>
                                <div className="counter-main-wrapper">
                                    <div className="single wow fadeInUp" data-wow-delay=".1s">
                                        <h3 className="title">
                                            <span className="counter">251</span>+
                                        </h3>
                                        <div className="title-wrapper">
                                            <span>Successful Delivery</span>
                                        </div>
                                    </div>
                                    <div className="single wow fadeInUp" data-wow-delay=".3s">
                                        <h3 className="title">
                                            <span className="counter">25</span>+
                                        </h3>
                                        <div className="title-wrapper">
                                            <span>Innovation Award</span>
                                        </div>
                                    </div>
                                    <div className="single wow fadeInUp" data-wow-delay=".5s">
                                        <h3 className="title">
                                            <span className="counter">51</span>+
                                        </h3>
                                        <div className="title-wrapper">
                                            <span>Industry Certification</span>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="social-area-wrapper wow fadeInUp"
                                    data-wow-delay=".7s"
                                >
                                    <p>Follow Me:</p>
                                    <div className="social-one-area">
                                        <ul>
                                            <li>
                                                <a href="#">
                                                    <i className="fa-brands fa-facebook-f" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="#">
                                                    <i className="fa-brands fa-twitter" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="#">
                                                    <i className="fa-brands fa-youtube" />
                                                </a>
                                            </li>
                                            <li>
                                                <a href="#">
                                                    <i className="fa-brands fa-linkedin" />
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* team single banner area end */}
        </div>
    )
}

export default TeamSingleBanner