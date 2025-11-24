"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useAOS from '@/hooks/useAOS';
function ServiceSix() {
    useAOS();
    return (
        <>
            {/* service area start */}
            <div className="gap-service-area rts-section-gap bg-light">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="title-area-center-inner-with-sub">
                                <span>Our services</span>
                                <h2 className="title">Key Solutions</h2>
                                <p className="disc">
                                A unified platform to help solve some of today’s career challenges
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row g-5 mt--50">
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/39.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/resume-audit">
                                        <h3 className="title animated fadeIn">Resume Audit</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/40.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/resume-builder">
                                        <h3 className="title animated fadeIn">Resume Builder</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/35.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/job-listing">
                                        <h3 className="title animated fadeIn">Curated Listings</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/36.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/downloadable-resources">
                                        <h3 className="title animated fadeIn">Resources</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="100" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/37.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/askgenie">
                                        <h3 className="title animated fadeIn">Ask Genie</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="300" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/38.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="#">
                                        <h3 className="title animated fadeIn">Learning (Coming Soon)</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="500" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/39.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="/blogs">
                                        <h3 className="title animated fadeIn">Blog</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div
                            className="col-xl-3 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up" data-aos-delay="700" data-aos-duration="1000"
                        >
                            <div className="single-service-area-4 in-about-page">
                                <div className="icon">
                                    <Image src="/assets/images/service/icons/40.svg" alt="service" width={50} height={50} />
                                </div>
                                <div className="title-area">
                                    <Link href="#">
                                        <h3 className="title animated fadeIn">Job Fit (Coming Soon)</h3>
                                        <Image
                                            className="injectable"
                                            src="/assets/images/service/icons/21.svg"
                                            alt="icosn"
                                            width={20}
                                            height={20}
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 d-flex justify-content-center">
                            <Link href="/" className="rts-btn btn-border btn-bold mt--80">
                                View all solutions
                                <Image src="/assets/images/service/icons/13.svg" alt="arrow" width={20} height={20} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* service area end */}
        </>

    )
}

export default ServiceSix
