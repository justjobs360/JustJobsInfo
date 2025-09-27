"use client"
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide, Autoplay } from "swiper/react";
function Testimonials() {
    return (
        <div>
            {/* testimonials area start */}
            <div id="testimonials" className="testimonials-area-start rts-section-gapTop bg-primary position-relative" style={{
                minHeight: '500px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="shape-top-right wow slideInLeft" data-wow-offset={160}>
                    <img
                        loading="lazy"
                        rel="preload"
                        src="assets/images/testimonials/03.png"
                        alt="testimopnials"
                    />
                </div>
                <div className="container" style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                }}>
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
                    <div className="row mt--80" style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'stretch'
                    }}>
                        <div className="col-lg-12 ">
                            <div className="swiper mySwiper-Testimonials" style={{
                                height: '100%',
                                minHeight: '400px'
                            }}>

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
                                    style={{
                                        height: '100%',
                                        minHeight: '400px'
                                    }}
                                >
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one" style={{
                                            height: '100%',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
                                            <p className="disc">
                                                &quot;Justjobs.info transformed my job search! Their resume audit pinpointed exactly what needed improvement. I landed multiple interviews within weeks. Highly recommend it to anyone looking to stand out.&quot;
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
                                                    <h6 className="title">Linda M.</h6>
                                                    <span className="desig">Software Developer</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one" style={{
                                            height: '100%',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
                                            <p className="disc">
                                                &quot;I love how simple and effective the platform is. The AI-powered tools gave me real-time insights into my resume’s performance. It boosted my confidence and helped me secure my dream role..&quot;
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
                                                    <h6 className="title">Priya P.</h6>
                                                    <span className="desig">Project Manager</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one" style={{
                                            height: '100%',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
                                            <p className="disc">
                                                &quot;The personalized feedback from Justjobs.info helped me tailor my resume perfectly for my industry. The job listings are comprehensive and easy to navigate. This platform made my career jump seamless.&quot;
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
                                                    <h6 className="title">Alex T.</h6>
                                                    <span className="desig">HR Manager</span>
                                                </div>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                    <SwiperSlide>
                                        <div className="single-testimonials-area-one" style={{
                                            height: '100%',
                                            minHeight: '400px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}>
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