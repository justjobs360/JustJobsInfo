"use client"
import React from 'react';
import Image from 'next/image';
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import CtaOne from "@/components/cta/CtaOne";
import FaqOne from "@/components/faq/FaqOne";
import Testimonials from "@/components/testimonials/Testimonials";
import CtaSix from '@/components/cta/CtaTeam';
import useAOS from '@/hooks/useAOS';
export default function Home() {
    useAOS();
    return (
        <div className='#'>
            <HeaderOne />
            <Breadcrumb />



            <>
                <div className="rts-career-banner-area rts-section-gap">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-5">
                                <div className="career-banner-wrapper">
                                    <h1 className="title">Meet Our CreativeTeam Members</h1>
                                    <p className="disc">
                                    Just a group of passionate, dedicated individuals bringing creativity and commitment to every project. We believe great work starts with collaboration.
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-7 mt_md--30 mt_sm--30">
                                <div
                                    className="thumbnail-top wow scaleIn"
                                    data-wow-delay=".1s"
                                    data-wow-duration=".5s"
                                >
                                    <Image
                                        src="/assets/images/team/01.webp"
                                        alt="career"
                                        width={1480}
                                        height={720}
                                        priority
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 700px"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts team area start */}
                <div className="rts-team-area rts-section-gapBottom">
                    <div className="container mb--50">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="title-team-left">
                                    <h2 className="title">Team Members</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row g-5">
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/1sttm.png"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Casey Jordan</h3>
                                        </a>
                                        <span className="deg">Content Writer</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/2ndtm.jpg"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Emmanuel Sanni</h3>
                                        </a>
                                        <span className="deg">Freelance Contributor</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/3rdtm.jpeg"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a  href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer">
                                            <h3 className="title">Saoud Ahmed</h3>
                                        </a>
                                        <span className="deg">IT Specialist</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/4thtm.png"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="https://sillylittletools.com" target="_blank" rel="noopener noreferrer">
                                            <h3 className="title">SillyLittleTools</h3>
                                        </a>
                                        <span className="deg">Technical Consultant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts team area end */}
                {/* rts team area start */}
                {/* 
                <div className="rts-team-area rts-section-gapBottom">
                    <div className="container mb--50">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="title-team-left">
                                    <h2 className="title">Luminos Team Member</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="row g-5">
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100"
                            >
                                <div className="single-team-style-one" >
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/02.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Daniel Brown</h3>
                                        </a>
                                        <span className="deg">Chief Executive Officer</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/03.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Christopher Henry</h3>
                                        </a>
                                        <span className="deg">Marketing Director</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/04.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">John Smith</h3>
                                        </a>
                                        <span className="deg">Senior Developer</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/05.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Gabriel Benjamin</h3>
                                        </a>
                                        <span className="deg">IT Specialist</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/04.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">John Smith</h3>
                                        </a>
                                        <span className="deg">Senior Developer</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="col-lg-3 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500"
                            >
                                <div className="single-team-style-one">
                                    <a href="#" className="thumbnail">
                                        <Image
                                            src="/assets/images/team/05.webp"
                                            alt="team"
                                            width={900}
                                            height={990}
                                            loading="lazy"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                                        />
                                    </a>
                                    <div className="inner-content">
                                        <a href="#">
                                            <h3 className="title">Gabriel Benjamin</h3>
                                        </a>
                                        <span className="deg">IT Specialist</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                 {/* */}
                {/* rts team area end */}
                <Testimonials />
                <FaqOne />
            </>




            <CtaSix />
            <FooterOneDynamic />
            <BackToTop />
        </div>
    );
}
