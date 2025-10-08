"use client"
import React from 'react'
import { ReactSVG } from 'react-svg';
import Link from 'next/link';
function BlogOne() {
    return (
        <div>
            {/* rts blog area strart */}
            <div className="rts-blog-area rts-section-gap position-relative">
                <div className="shape-bottom">
                    <img
                        loading="lazy"
                        rel="preload"
                        src="assets/images/video/shape/02.png"
                        alt=""
                        className="wow move-left"
                        data-wow-offset={120}
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="text-center-title-bg-white">
                                <h2 className="title" style={{ fontSize: 64 }}>
                                    Latest insights
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mt--50">
                    <div className="row g-0 wow fadeInUp" data-wow-offset={120}>
                        <div className="col-lg-4">
                            <div className="single-blog-area-start border-left">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/blog/01.webp"
                                        alt="blog_iamge"
                                    />
                                </Link>
                                <div className="inner-content-area">
                                    <div className="top-area">
                                        <span>Cloud Migration</span>
                                        <Link href="/blogs/protecting-your-business">
                                            <h3 className="title">Future of cloud computing</h3>
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                        <div className="bottom-author-area">
                                            <img
                                                loading="lazy"
                                                rel="preload"
                                                src="assets/images/testimonials/01.png"
                                                alt="author"
                                            />
                                            <div className="author-area-info">
                                                <h6 className="title">Lage Freeman</h6>
                                                <span>24 Sept 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="single-blog-area-start">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/blog/02.webp"
                                        alt="blog_iamge"
                                    />
                                </Link>
                                <div className="inner-content-area">
                                    <div className="top-area">
                                        <span>UX Design</span>
                                        <Link href="/blogs/protecting-your-business">
                                            <h3 className="title">UX review presentations</h3>
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                        <div className="bottom-author-area">
                                            <img
                                                loading="lazy"
                                                rel="preload"
                                                src="assets/images/testimonials/02.png"
                                                alt="author"
                                            />
                                            <div className="author-area-info">
                                                <h6 className="title">Rock Freeman</h6>
                                                <span>24 Sept 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="single-blog-area-start">
                                <Link href="/blogs/protecting-your-business" className="thumbnail">
                                    <img
                                        loading="lazy"
                                        rel="preload"
                                        src="assets/images/blog/03.webp"
                                        alt="blog_iamge"
                                    />
                                </Link>
                                <div className="inner-content-area">
                                    <div className="top-area">
                                        <span>Cyber Security</span>
                                        <Link href="/blogs/protecting-your-business">
                                            <h3 className="title">Protecting your business</h3>
                                        </Link>
                                        <p className="disc">
                                            How do you create compelling presentations that wow your
                                            colleagues and impress your managers?
                                        </p>
                                        <div className="bottom-author-area">
                                            <img
                                                loading="lazy"
                                                rel="preload"
                                                src="assets/images/testimonials/07.png"
                                                alt="author"
                                            />
                                            <div className="author-area-info">
                                                <h6 className="title">Marcus Freeman</h6>
                                                <span>24 Sept 2024</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <Link href="/blogs" className="rts-btn btn-border">
                                View More Blog
                                <ReactSVG
                                    className="injectable"
                                    src="assets/images/service/icons/13.svg"
                                    alt="arrow"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts blog area end */}
        </div>
    )
}

export default BlogOne
