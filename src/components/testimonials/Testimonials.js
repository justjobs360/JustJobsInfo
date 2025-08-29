"use client"
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide, Autoplay } from "swiper/react";
function Testimonials() {
    return (
        <div>
            {/* testimonials area start */}
            <div className="testimonials-area-start rts-section-gapTop bg-primary position-relative">
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
                                <h2 className="title">Client Testimonials</h2>
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
                                                &quot;As a dedicated software engineer, I value precision highly. This AI resume auditor impressed me with its grasp of the technical subtleties of my profession. It helped me refine the way I present my skills, making it an invaluable asset for anyone in the tech industry.&quot;
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
                                                    A
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Anonymous</h6>
                                                    <span className="desig">Technology Professional</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                &quot;Effective project management hinges on clear communication, and that&apos;s where the AI resume auditor shines. Its personalized feedback was instrumental in helping me articulate my project leadership skills. Highly recommended for project management professionals.&quot;
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
                                                    A
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Anonymous</h6>
                                                    <span className="desig">Technology Professional</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                &quot;In the fast-paced world of HR, creating the right impression is crucial. This tool has revolutionized our resume screening process with its personalized recommendations, highlighting each candidate&apos;s unique strengths. It&apos;s a game-changer for recruitment experts.&quot;
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
                                                    A
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Anonymous</h6>
                                                    <span className="desig">Technology Professional</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one">
                                            <p className="disc">
                                                &quot;As a dedicated software engineer, I value precision highly. This AI resume auditor impressed me with its grasp of the technical subtleties of my profession. It helped me refine the way I present my skills, making it an invaluable asset for anyone in the tech industry.&quot;
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
                                                    A
                                                </div>
                                                <div className="information">
                                                    <h6 className="title">Anonymous</h6>
                                                    <span className="desig">Technology Professional</span>
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