"use client"
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules"; // Import modules
import "swiper/css/navigation";
function Testimonials() {
    return (
        <div>
            <div className="rts-testimonials-area rts-section-gap bg-solution">
                <div className="container-full">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="swiper-testimonials-wrapper-full-center">
                                <div className="swiper mySwiper-testimonials-4">


                                    <Swiper
                                        slidesPerView={2.4}
                                        spaceBetween={150}
                                        loop={true}
                                        centeredSlides={true}
                                        modules={[Navigation, Autoplay]}
                                        autoplay={{
                                            delay: 3500,
                                            disableOnInteraction: false,
                                        }}
                                        speed={1000}
                                        navigation={{
                                            nextEl: ".swiper-button-next",
                                            prevEl: ".swiper-button-prev",
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
                                                spaceBetween: 150,
                                            },
                                        }}
                                    >
                                        <SwiperSlide>
                                            <div className="single-testimonials-4">
                                                <p className="disc">
                                                    “The data analytics solution provided by Luminous has
                                                    revolutionized our research capabilities. Their team
                                                    expertise in handling large datasets and creating
                                                    insightful visualizations has accelerated our drug
                                                    discovery process.”
                                                </p>
                                                <div className="user-area">
                                                    <img
                                                        src="assets/images/testimonials/09.png"
                                                        alt="testimonials"
                                                    />
                                                    <div className="info-area">
                                                        <h6 className="title">Deon Kar</h6>
                                                        <span>Operations Manager at CloudNine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="single-testimonials-4">
                                                <p className="disc">
                                                    “The data analytics solution provided by Luminous has
                                                    revolutionized our research capabilities. Their team
                                                    expertise in handling large datasets and creating
                                                    insightful visualizations has accelerated our drug
                                                    discovery process.”
                                                </p>
                                                <div className="user-area">
                                                    <img
                                                        src="assets/images/testimonials/08.png"
                                                        alt="testimonials"
                                                    />
                                                    <div className="info-area">
                                                        <h6 className="title">Marry Knowles</h6>
                                                        <span>Operations Manager at CloudNine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="single-testimonials-4">
                                                <p className="disc">
                                                    “The data analytics solution provided by Luminous has
                                                    revolutionized our research capabilities. Their team
                                                    expertise in handling large datasets and creating
                                                    insightful visualizations has accelerated our drug
                                                    discovery process.”
                                                </p>
                                                <div className="user-area">
                                                    <img
                                                        src="assets/images/testimonials/07.png"
                                                        alt="testimonials"
                                                    />
                                                    <div className="info-area">
                                                        <h6 className="title">Mark Joe</h6>
                                                        <span>Operations Manager at CloudNine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="single-testimonials-4">
                                                <p className="disc">
                                                    “The data analytics solution provided by Luminous has
                                                    revolutionized our research capabilities. Their team
                                                    expertise in handling large datasets and creating
                                                    insightful visualizations has accelerated our drug
                                                    discovery process.”
                                                </p>
                                                <div className="user-area">
                                                    <img
                                                        src="assets/images/testimonials/01.png"
                                                        alt="testimonials"
                                                    />
                                                    <div className="info-area">
                                                        <h6 className="title">Jarry Kew</h6>
                                                        <span>Operations Manager at CloudNine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="single-testimonials-4">
                                                <p className="disc">
                                                    “The data analytics solution provided by Luminous has
                                                    revolutionized our research capabilities. Their team
                                                    expertise in handling large datasets and creating
                                                    insightful visualizations has accelerated our drug
                                                    discovery process.”
                                                </p>
                                                <div className="user-area">
                                                    <img
                                                        src="assets/images/testimonials/02.png"
                                                        alt="testimonials"
                                                    />
                                                    <div className="info-area">
                                                        <h6 className="title">Krunal Panday</h6>
                                                        <span>Operations Manager at CloudNine</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>


                                    </Swiper>
                                    <div className="swiper-button-next" />
                                    <div className="swiper-button-prev" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>



    )
}

export default Testimonials