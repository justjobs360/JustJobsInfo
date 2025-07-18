"use client";
import BackToTop from "@/components/common/BackToTop";
import React from "react";
import HeaderTwo from "@/components/header/HeaderTwo";
import FooterOne from "@/components/footer/FooterOne";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Posts from '@/data/Posts.json';
import BlogGridMain from './BlogGridTwoMain';
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
                        <div className="row g-5">
                            {Posts.map((blog, index) => {
                                    return (
                                        <div key={index} className="col-lg-6 col-md-6 col-sm-12">
                                            <div className="single-blog-area-start border-none">
                                                {
                                                    <BlogGridMain
                                                        blogCategory={blog.category}
                                                        Slug={blog.slug}
                                                        blogImage={blog.image}
                                                        authorImg={blog.authorImg}
                                                        blogTitle={blog.title}
                                                        blogAuthor={blog.author}
                                                        blogPublishedDate={blog.publishedDate}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    )
                            }).slice(0, 4)}
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