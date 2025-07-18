"use client"; // Add if you're using Next.js App Router

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Corrected import path
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TestimonialsThree() {
  const testimonials = [
    {
      text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste.",
      image: "/assets/images/testimonials/01.png",
      name: "Michael Chen",
      position: "CTO of SwiftPay Financial",
    },
    {
      text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste.",
      image: "/assets/images/testimonials/02.png",
      name: "Kolic Chen",
      position: "CTO of SwiftPay Financial",
    },
    {
      text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste.",
      image: "/assets/images/testimonials/02.png",
      name: "John Lee",
      position: "CTO of SwiftPay Financial",
    },
    {
      text: "Luminous transformed our agricultural business with their custom software solution. Their team developed an intuitive crop management system that has increased our yield by 30% and significantly reduced water waste.",
      image: "/assets/images/testimonials/07.png",
      name: "Michael Chen",
      position: "CTO of SwiftPay Financial",
    },
  ];

  return (
    <div className="rts-testimonials-area-about rts-section-gap bg-dark-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="testimonails-title-wrapper-between"> 
              <h2 className="title">What they said about us</h2>
              <div className="swiper-btn">
                <div className="swiper-button-next">
                  <i className="fa-regular fa-arrow-right"></i>
                </div>
                <div className="swiper-button-prev">
                  <i className="fa-regular fa-arrow-left"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12 mt--55">
            <div className="swiper-area-main-wrapper mySwiper-testimonials-5  position-relative">
              <Swiper
                 modules={[Navigation, Pagination, Autoplay]}
                slidesPerView={3}
                spaceBetween={18}
                loop={true}
                eed={700}
                centeredSlides={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                navigation={{
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }}
                pagination={{
                  el: ".swiper-pagination",
                  clickable: true,
                }}
                className="mySwiper-testimonials-5"
                breakpoints={{
                  320: { slidesPerView: 1, spaceBetween: 25 },
                  768: { slidesPerView: 2, spaceBetween: 25 },
                  980: { slidesPerView: 2, spaceBetween: 25 },
                  1280: { slidesPerView: 3, spaceBetween: 25 },
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <SwiperSlide key={index}>
                    <div className="single-testimonials-about">
                      <p className="disc">{testimonial.text}</p>
                      <div className="author-area">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="testimonial-image"
                        />
                        <div className="information">
                          <h5 className="title">{testimonial.name}</h5>
                          <p>{testimonial.position}</p>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="swiper-pagination"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
