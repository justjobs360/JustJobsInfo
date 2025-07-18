"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";

const TestimonialsTwo = () => {
    const testimonials = [
        {
            text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste. Their ongoing support has been invaluable.",
            imgSrc: "assets/images/testimonials/01.png",
            name: "Marcus Freeman",
            designation: "CTO of SwiftPay Financial",
        },
        {
            text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste. Their ongoing support has been invaluable.",
            imgSrc: "assets/images/testimonials/02.png",
            name: "John Freeman",
            designation: "CTO of SwiftPay Financial",
        },
        {
            text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste. Their ongoing support has been invaluable.",
            imgSrc: "assets/images/testimonials/01.png",
            name: "Marcus Freeman",
            designation: "CTO of SwiftPay Financial",
        },
        {
            text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste. Their ongoing support has been invaluable.",
            imgSrc: "assets/images/testimonials/02.png",
            name: "John Freeman",
            designation: "CTO of SwiftPay Financial",
        },
    ];

    return (
        <div className="rts-testimonials-area-two rts-section-gap bg-solution">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12 text-center testimonials-title-two-center">
                        <h2 className="title">What clients said</h2>
                    </div>
                    <div className="col-lg-12 mt--70 mt_sm--40">
                        <div className="float-right-style">
                            <div className="swiper-area-main-wrapper">
                                <Swiper
                                    spaceBetween={0}
                                    slidesPerView={2}
                                    loop={true}
                                    autoplay={{ delay: 3000, disableOnInteraction: false }}
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
                                            spaceBetween: 0,
                                        },
                                    }}
                                    className="mySwiper-testimonials-150"
                                    modules={[Navigation, Autoplay]}
                                >
                                    {testimonials.map((testimonial, index) => (
                                        <SwiperSlide key={index}>
                                            <div className="single-testimonials-two">
                                                <p className="disc">{testimonial.text}</p>
                                                <div className="inner-author">
                                                    <img
                                                        src={testimonial.imgSrc}
                                                        alt="testimonial"
                                                        className="author-image"
                                                    />
                                                    <div className="info">
                                                        <h6 className="title">{testimonial.name}</h6>
                                                        <span className="date">{testimonial.designation}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>
                    </div>
                    {/* Navigation Buttons */}
                    <div className="col-lg-12 position-relative-testimonials-two">
                        <div className="swiper-button-prev">
                            <i className="fa-regular fa-chevron-left"></i>
                        </div>
                        <div className="swiper-button-next">
                            <i className="fa-regular fa-chevron-right"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialsTwo;
