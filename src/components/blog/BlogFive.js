"use client"
import React from 'react'
import Link from 'next/link';
function BlogFive() {
    return (
        <div>
            <>
                {/* rts-blog area start */}
                <div className="rts-section-gap rts-blog-area-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12 mb--25">
                                <div className="blog-title-two-center text-center">
                                    <h2 className="title">Insights</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row g-5">
                            <div
                                className="col-lg-4 col-md-6 col-sm-12 col-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                            >
                                <div className="single-blog-area-five">
                                    <span className="badge-1">Cloud Migration</span>
                                    <Link href="/blogs/protecting-your-business" className="thumbnail">
                                        <img src="assets/images/blog/08.webp" alt="blog" />
                                    </Link>
                                    <div className="inner-content">
                                        <Link href="/blogs/protecting-your-business" className="title-area">
                                            <h5 className="title">Future of cloud computing</h5>
                                            <img src="assets/images/service/icons/13.svg" alt="" />
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-4 col-md-6 col-sm-12 col-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                            >
                                <div className="single-blog-area-five">
                                    <span className="badge-1">UX Design</span>
                                    <Link href="/blogs/protecting-your-business" className="thumbnail">
                                        <img src="assets/images/blog/09.webp" alt="blog" />
                                    </Link>
                                    <div className="inner-content">
                                        <Link href="/blogs/protecting-your-business" className="title-area">
                                            <h5 className="title">Protecting your business</h5>
                                            <img src="assets/images/service/icons/13.svg" alt="" />
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-4 col-md-6 col-sm-12 col-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                            >
                                <div className="single-blog-area-five">
                                    <span className="badge-1">Cyber Security</span>
                                    <Link href="/blogs/protecting-your-business" className="thumbnail">
                                        <img src="assets/images/blog/10.webp" alt="blog" />
                                    </Link>
                                    <div className="inner-content">
                                        <Link href="/blogs/protecting-your-business" className="title-area">
                                            <h5 className="title">UX review presentations</h5>
                                            <img src="assets/images/service/icons/13.svg" alt="" />
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12 text-center d-flex justify-content-center mt--80">
                                <Link href="#" className="rts-btn btn-border btn-bold">
                                    More articles
                                    <img src="assets/images/service/icons/13.svg" alt="arrow" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts-blog area end */}
            </>

        </div>
    )
}

export default BlogFive
