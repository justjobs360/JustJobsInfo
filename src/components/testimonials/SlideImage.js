"use client"
import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide, Autoplay } from "swiper/react";
function SlideImage() {
    return (
        <div>
            <div className="swiper-container">
                <Swiper
                    spaceBetween={20} // Space between slides
                    slidesPerView={3} // Number of slides visible at a time
                    loop={true} // Enable looping
                    speed={1000}
                    centeredSlides={true}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    modules={[Autoplay]}
                    breakpoints={{
                        // Responsive breakpoints
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3.4 },
                    }}
                >
                    {/* Swiper slides */}
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/21.webp" alt="Case Study 21" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/22.webp" alt="Case Study 22" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/23.webp" alt="Case Study 23" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/24.webp" alt="Case Study 24" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/21.webp" alt="Case Study 21" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/22.webp" alt="Case Study 22" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/23.webp" alt="Case Study 23" />
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="thumbnail-case">
                            <img src="/assets/images/case-studies/24.webp" alt="Case Study 24" />
                        </div>
                    </SwiperSlide>
                    {/* Add more slides as needed */}
                </Swiper>
            </div>
        </div>
    )
}

export default SlideImage