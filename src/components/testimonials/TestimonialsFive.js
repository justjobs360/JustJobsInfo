"use client"
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide, Autoplay } from "swiper/react";
function Testimonials() {
    return (
        <div>
            {/* testimonials area start */}
            <div className="testimonials-area-start testimonials-border position-relative">
                <div className="shape-top-right wow slideInLeft" data-wow-offset={160}>
                    <img
                        loading="lazy"
                        rel="preload"
                        src="assets/images/testimonials/03.png"
                        alt="testimopnials"
                    />
                </div>
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-between-wrapper">
                                <h2 className="title">Testimonials</h2>
                                <p className="disc">
                                At Justjobs Info, we’re proud to help professionals advance their careers and stand out in the job market. Here are some testimonials from users who have benefited from our tools and resources.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt--80">
                        <div className="col-lg-12 ">
                            <div className="swiper mySwiper-Testimonials">

                                <Swiper
                                    slidesPerView={2}
                                    spaceBetween={0}
                                    loop={true}
                                    autoplay={{
                                        delay: 500,
                                        disableOnInteraction: false,
                                    }}
                                    breakpoints={{
                                        // When the viewport is >= 640px
                                        240: {
                                            slidesPerView: 1,
                                            spaceBetween: 0,
                                        },
                                        // When the viewport is >= 768px
                                        768: {
                                            slidesPerView: 1,
                                            spaceBetween: 0,
                                        },
                                        // When the viewport is >= 1024px
                                        1024: {
                                            slidesPerView: 2,
                                            spaceBetween: 0,
                                        },
                                    }}
                                    speed={1000}
                                >
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                "Just Jobs helped me revamp my resume and find a job that perfectly fits my skills. Their career tips boosted my confidence and results"
                                            </p>
                                            <div className="author-wrapper">
                                                <div className="avatar" style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    backgroundColor: "#10365C",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "50%",
                                                    color: "#fff",
                                                    fontSize: "24px",
                                                    fontWeight: "bold"
                                                }}>
                                                    S
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Sarah T.</h6>
                                                    <span className="desig">Marketing Specialist</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                "The job listings on Just Jobs were up-to-date and relevant. The resume builder saved me hours and the AI assistant answered all my questions."
                                            </p>
                                            <div className="author-wrapper">
                                                <div className="avatar" style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    backgroundColor: "#10365C",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "50%",
                                                    color: "#fff",
                                                    fontSize: "24px",
                                                    fontWeight: "bold"
                                                }}>
                                                    D
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">David L.</h6>
                                                    <span className="desig">Software Engineer</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                "The resume audit feature helped me identify key areas for improvement. I landed my dream job within two weeks of using Just Jobs' comprehensive career tools."
                                            </p>
                                            <div className="author-wrapper">
                                                <div className="avatar" style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    backgroundColor: "#10365C",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "50%",
                                                    color: "#fff",
                                                    fontSize: "24px",
                                                    fontWeight: "bold"
                                                }}>
                                                    L
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Lisa M.</h6>
                                                    <span className="desig">Project Manager</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                "Just Jobs' AI-powered career guidance was exactly what I needed. The platform's job matching algorithm connected me with opportunities I never would have found on my own."
                                            </p>
                                            <div className="author-wrapper">
                                                <div className="avatar" style={{
                                                    width: "60px",
                                                    height: "60px",
                                                    backgroundColor: "#10365C",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "50%",
                                                    color: "#fff",
                                                    fontSize: "24px",
                                                    fontWeight: "bold"
                                                }}>
                                                    C
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Chris R.</h6>
                                                    <span className="desig">Data Analyst</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                </Swiper>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* testimonials area end */}
        </div>
    )
}

export default Testimonials