"use client"; // Add if you're using Next.js App Router

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Corrected import path
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function TestimonialsThree() {
  const testimonials = [
    {
      text: "As a dedicated software engineer, I value precision highly. This AI resume auditor impressed me with its grasp of the technical subtleties of my profession. It helped me refine the way I present my skills, making it an invaluable asset for anyone in the tech industry.",
      name: "Anna Z.",
      position: "Senior Software Engineer",
    },
    {
      text: "In the fast-paced world of HR, creating the right impression is crucial. This tool has revolutionized our resume screening process with its personalized recommendations, highlighting each candidate's unique strengths. It's a game-changer for recruitment experts.",
      name: "Rachel B.",
      position: "HR Director",
    },
    {
      text: "Effective project management hinges on clear communication, and that's where the AI resume auditor shines. Its personalized feedback was instrumental in helping me articulate my project leadership skills. Highly recommended for project management professionals.",
      name: "Liam J.",
      position: "Project Management Consultant",
    },
    {
      text: "A resume for a creative professional should be a reflection of their artistic flair. The AI resume auditor understood the nuances of my design experience, offering constructive feedback that elevated my resume's visual impact. It's a vital tool for creatives.",
      name: "Kevin L.",
      position: "Senior Graphic Designer",
    },
  ];

  return (
    <div className="rts-testimonials-area-about rts-section-gap bg-dark-1">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="testimonails-title-wrapper-between"> 
              <h2 className="title" style={{
                fontSize: "48px",
                fontWeight: "700",
                lineHeight: "1.2",
                marginBottom: "0"
              }}>What they said about us</h2>
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
                    <div className="single-testimonials-about" style={{
                      height: "380px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}>
                      <p className="disc" style={{
                        flex: "1",
                        display: "flex",
                        alignItems: "center",
                        lineHeight: "1.6",
                        fontSize: "16px"
                      }}>{testimonial.text}</p>
                      <div className="author-area">
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
                          {testimonial.name.charAt(0)}
                        </div>
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
