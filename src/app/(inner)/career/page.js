"use client"
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderOne from "@/components/header/HeaderOne";
import CtaSeven from "@/components/cta/CtaPartner";
import Accordion from "react-bootstrap/Accordion";
import CtaThree from "@/components/cta/CtaCareer";
export default function Home() {
    const styling = {
        backgroundImage: `url(assets/images/career/03.webp)`,
    };
    return (
        <div className='#'>
            <HeaderOne />

            <>
                {/* rts career banner area start */}
                <div className="rts-career-banner-area rts-section-gap">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="career-banner-wrapper">
                                    <h1 className="title">
                                        Join Our Team of Problem Solvers
                                    </h1>
                                    <p className="disc">
                                    We know our people drive our success. If you’re passionate about making a real impact, contributing your skills, and helping others achieve their career goals, we’d love to hear from you!
                                    </p>
                                    <a href="#currentopeningscareer" className="rts-btn btn-primary btn-bold">
                                        Current Openings
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-6 mt_md--30 mt_sm--30 wow fadeInRight">
                                <div className="thumbnail-top">
                                    <img src="assets/images/career/01.webp" alt="career" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* rts career banner area send */}
                <div className="rts-section-gap-top career-two-section">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="thumbnail-career-two wow fadeInLeft">
                                    <img src="assets/images/career/02.webp" alt="career" />
                                </div>
                            </div>
                            <div className="col-lg-6 pl--50 pl_md--15 pl_sm--10 mt_md--30 pt_sm--30">
                                <div className="career-right-two-wrapper aligncentercareer">
                                    <h2 className="title">Why Work With Us?</h2>
                                    <p>
                                    Your ideas matter. We foster a culture where creative thinking and fresh perspectives are encouraged, giving you the freedom to contribute, collaborate, and see your ideas shape real solutions.
                                    </p>
                                    {/* 
                                    <div className="check-wrapper-main">
                                        <div className="single-wrapper">
                                            <div className="check-wrapper">
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Expertise You Can Trust</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Expertise You Can Trust</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Revolutionizing Customer Service</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Transforming a Healthcare Provider</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Enhancing Data-Driven Decisions</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="single-wrapper">
                                            <div className="check-wrapper">
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Expertise You Can Trust</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Revolutionizing Customer Service</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Transforming a Healthcare Provider</p>
                                                </div>
                                                <div className="single-check">
                                                    <img src="assets/images/service/01.svg" alt="service" />
                                                    <p>Enhancing Data-Driven Decisions</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* career video area start */}
                <div className="career-video-area-large-3 rts-section-gapTop">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div
                                    className="career-video-area-large position-relative bg_image" style={styling}
                                    data-speed=".8"
                                >
                                    <div className="vedio-icone">
                                        <a
                                            className="video-play-button play-video popup-video"
                                            href="https://www.youtube.com/watch?v=vZE0j_WCRvI"
                                        >
                                            <span />
                                        </a>
                                        <div className="video-overlay">
                                            <a className="video-overlay-close">×</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* career video area end */}
                {/* company values area start */}
                <div className="company-values-area rts-section-gap">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="title-between-area-wrapper-main">
                                    <div className="title-left-area">
                                        <h2 className="title">Our Values in Action</h2>
                                    </div>
                                    <p className="disc">
                                    Our values shape who we are and guide everything we do. They help us foster positive interactions, strengthen our resolve, and help us build trust with our community and partners. These principles are at the heart of our success.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="row g-5 mt--30">
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".1s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/01.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title">Integrity</h6>
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".3s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/02.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title">Innovation</h6>
                                       
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".5s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/03.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title">Collaboration</h6>
                                      
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".1s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/04.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title">Excellence</h6>
                                      
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".3s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/05.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title">Growth</h6>
                                       
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 wow fadeInUp" data-wow-delay=".5s">
                                <div className="single-values-in-action">
                                    <div className="icon">
                                        <img src="assets/images/career/06.svg" alt="icon" />
                                    </div>
                                    <div className="information">
                                        <h6 className="title" id="currentopeningscareer">Service</h6>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* company values area end */}
                {/* job opening area start */}
                <div className="job-opening-area rts-section-gapBottom"  >
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="title-center-style-two">
                                    <h2 className="title">Current Openings</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row g-5 mt--30">
                            <div className="col-lg-6 wow fadeInUp" data-wow-delay=".1s">
                                <div className="single-job-opening-card">
                                    <h4 className="title">IT Consultant</h4>
                                    <p>
                                        Responsibilities: Work with clients to assess their IT needs,
                                        develop strategic roadmaps, and implement tailored solutions.
                                    </p>
                                    <p>
                                        Qualifications: Strong analytical skills, excellent communication
                                        abilities, and a background in IT strategy and implementation.
                                    </p>
                                    <div className="tag-wrapper">
                                        <div className="single">
                                            <span>IT Consulting</span>
                                        </div>
                                        <div className="single">
                                            <span>IT Solutions</span>
                                        </div>
                                        <div className="single">
                                            <span>Consulting Services</span>
                                        </div>
                                    </div>
                                    <div className="bottom-area">
                                        <div className="selary-range">
                                            <p>
                                                $1000 - $12000 <span>USD/month</span>
                                            </p>
                                        </div>
                                        <a href="#" className="rts-btn btn-primary btn-bold">
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 wow fadeInUp" data-wow-delay=".3s">
                                <div className="single-job-opening-card">
                                    <h4 className="title">Help Desk Technician</h4>
                                    <p>
                                        <span>Responsibilities:</span> Work with clients to assess their
                                        IT needs, develop strategic roadmaps, and implement tailored
                                        solutions.
                                    </p>
                                    <p>
                                        <span>Qualifications:</span> Strong analytical skills, excellent
                                        communication abilities, and a background in IT strategy and
                                        implementation.
                                    </p>
                                    <div className="tag-wrapper">
                                        <div className="single">
                                            <span>IT Consulting</span>
                                        </div>
                                        <div className="single">
                                            <span>IT Solutions</span>
                                        </div>
                                        <div className="single">
                                            <span>Consulting Services</span>
                                        </div>
                                    </div>
                                    <div className="bottom-area">
                                        <div className="selary-range">
                                            <p>
                                                $1000 - $12000 <span>USD/month</span>
                                            </p>
                                        </div>
                                        <a href="#" className="rts-btn btn-primary btn-bold">
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* job opening area end */}
                {/* why choose us sectiona area start */}
                <div className="faqs-section rts-section-gapBottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-6">
                                <h2 className="title">FAQs</h2>
                            </div>
                            <div className="col-lg-6">
                                <div className="faq-why-choose-left-accordion">
                                <Accordion defaultActiveKey="0">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                        What types of IT consulting services do you offer?
                                        </Accordion.Header>
                                        <Accordion.Body>
                                        Each pricing plan offers a unique combination of services such as web
                                        design, SEO, social media management, content marketing, &amp; more.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="1">
                                        <Accordion.Header>
                                        What types of accounts can I open online?
                                        </Accordion.Header>
                                        <Accordion.Body>
                                        Each pricing plan offers a unique combination of services such as web
                                        design, SEO, social media management, content marketing, &amp; more.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                    <Accordion.Item eventKey="2">
                                        <Accordion.Header>Do I need to make an initial deposit?</Accordion.Header>
                                        <Accordion.Body>
                                        Each pricing plan offers a unique combination of services such as web
                                        design, SEO, social media management, content marketing, &amp; more.
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* why choose us sectiona area end */}
            </>



            <CtaThree />
            <FooterOne />
            <BackToTop />
        </div>
    );
}
