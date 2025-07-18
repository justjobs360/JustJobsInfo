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
      <div className="row g-5">
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">Cloud Migration</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/08.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">Future of cloud computing</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
            </div>
          </div>
        </div>
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">UX Design</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/09.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">Protecting your business</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
            </div>
          </div>
        </div>
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">Cyber Security</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/10.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">UX review presentations</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
            </div>
          </div>
        </div>
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">Cloud Migration</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/11.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">Best practice of UI/UX</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
            </div>
          </div>
        </div>
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">UX Design</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/12.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">Safe your business</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
            </div>
          </div>
        </div>
        <div
          className="col-lg-4 col-md-6 col-sm-12 col-12"
        >
          <div className="single-blog-area-five">
            <span className="badge-1">Cyber Security</span>
            <Link href="/blog-grid/protecting-your-business" className="thumbnail">
              <img src="assets/images/blog/13.webp" alt="blog" />
            </Link>
            <div className="inner-content">
              <Link href="/blog-grid/protecting-your-business" className="title-area">
                <h5 className="title">Advantages of SEO</h5>
                <img src="assets/images/service/icons/13.svg" alt="" />
              </Link>
              <p className="disc">
                How do you create compelling presentations that wow your
                colleagues and impress your managers?
              </p>
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