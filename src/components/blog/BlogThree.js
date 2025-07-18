"use client"
import React from 'react'
import Link from 'next/link';
function BlogThree() {
    return (
        <div>

            {/* rts blog area start */}
            <div className="rts-blog-area rts-section-gap section-seperator-top">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-blog-center">
                                <h2 className="title">Blog, news and updates</h2>
                            </div>
                        </div>
                    </div>
                    <div
                        className="row mt--80 g-0 wow fadeInUp"
                    >
                        <div className="col-lg-6">
                            <div className="single-blog-list-area-lef-timage">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img src="assets/images/blog/04.webp" alt="" />
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="single-blog-list-area-right-content">
                                <span className="tag">Cloud Migration</span>
                                <div className="title-area">
                                    <Link href="/blogs/protecting-your-business">
                                        <h3 className="title">Future of cloud computing</h3>
                                        <img src="assets/images/blog/07.webp" alt="" />
                                    </Link>
                                </div>
                                <p className="disc">
                                    How do you create compelling presentations that wow your
                                    colleagues and impress your managers?
                                </p>
                                <div className="bottom-author-area">
                                    <img src="assets/images/testimonials/01.png" alt="author" />
                                    <div className="author-area-info">
                                        <h6 className="title">Marcus Freeman</h6>
                                        <span>24 Sept 2024</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 mt--0">
                        <div
                            className="col-lg-6 col-md-6 wow fadeInUp"
                            data-wow-offset={120}
                            data-wow-delay=".4s"
                        >
                            <div className="single-blog-style-three">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img src="assets/images/blog/05.webp" alt="blog" />
                                </Link>
                                <div className="inner">
                                    <span className="tag">UX Design</span>
                                    <div className="title-wrapper">
                                        <Link href="/blogs/protecting-your-business">
                                            <h3 className="title">UX review presentations</h3>
                                        </Link>
                                        <img src="assets/images/blog/07.webp" alt="blog" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-lg-6 col-md-6 wow fadeInUp"
                            data-wow-offset={120}
                            data-wow-delay=".6s"
                        >
                            <div className="single-blog-style-three">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img src="assets/images/blog/06.webp" alt="blog" />
                                </Link>
                                <div className="inner">
                                    <span className="tag">Cyber Security</span>
                                    <div className="title-wrapper">
                                        <Link href="/blogs/protecting-your-business">
                                            <h3 className="title">Protecting your business</h3>
                                        </Link>
                                        <img src="assets/images/blog/07.webp" alt="blog" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts blog area end */}

        </div>
    )
}

export default BlogThree