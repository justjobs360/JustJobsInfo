"use client";
import BackToTop from "@/components/common/BackToTop";
import React from "react";
import HeaderTwo from "@/components/header/HeaderTwo";
import FooterOne from "@/components/footer/FooterOne";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import AOS from "aos";
import "aos/dist/aos.css";
import Link from 'next/link';
function page() {
    return (
        <>
            <HeaderTwo />
            <>
                <div className="career-single-banner-area ptb--70 blog-page">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="career-page-single-banner blog-page">
                                    <h1 className="title">Our Latest News</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rts-blog-area rts-section-gapTop position-relative">
                    <div className="container">
                        <div className="row g-0">
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
                            <div className="col-lg-6">
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
                            <div className="col-lg-6">
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
                        <div className="row mt--50">
                            <div className="col-lg-12">
                                <div className="pagination-one">
                                    <ul className="justify-content-center">
                                        <li>
                                            <button className="active">01</button>
                                        </li>
                                        <li>
                                            <button>02</button>
                                        </li>
                                        <li>
                                            <button>03</button>
                                        </li>
                                        <li>
                                            <button>04</button>
                                        </li>
                                        <li>
                                            <button className="next-page">
                                                <i className="fa-solid fa-chevrons-right" />
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>




            <BackToTop />
            <FooterOne />
        </>

    )
}

export default page