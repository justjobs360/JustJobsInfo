
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import FeatureTwo from "@/components/feature/FeatureTwo";
import TestimonialsFive from "@/components/testimonials/TestimonialsFive";
import MoreSolutions from "@/components/service-component/MoreSolution";

export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />
            <div>
                <div className="container-large">
                    {/* service area start */}
                    <div className="service-single-area-banner technology-service bg_image jarallax"></div>
                    {/* service area end */}
                </div>

            </div>
            <div>

                <div className="service-area-details-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="top">
                                        <h1 className="title">Technologies Service</h1>
                                        <p className="disc">
                                            Technologies Service offers innovative solutions, streamlining processes, enhancing efficiency, ensuring growth, and driving digital transformation.
                                        </p>
                                    </div>
                                    <div className="mid-content">
                                        <p className="disc">
                                            Wer your strategic partners in digital transformation. With
                                            over a decade of experience and a team of certified experts, we
                                            deliver tailored solutions that drive growth, enhance
                                            efficiency, and secure your digital assets.
                                        </p>
                                        <p className="disc">
                                            Luminous works with businesses of all sizes, from small startups
                                            to large enterprises. We tailor our solutions to meet the
                                            specific needs and budget of each client offers a wide range of
                                            IT services. As we invest heavily in ongoing training and
                                            professional development for our team. We also participate in
                                            industry conferences, maintain partnerships with leading
                                            technology providers, and conduct internal research and
                                            development projects.
                                        </p>
                                        <p className="disc">
                                            Luminous works with businesses of all sizes, from small startups
                                            to large enterprises. We tailor our solutions to meet the
                                            specific needs and budget of each client offers a wide range of
                                            IT services. As we invest heavily in ongoing training and
                                            professional development for our team. We also participate in
                                            industry conferences, maintain partnerships with leading
                                            technology providers, and conduct internal research and
                                            development projects.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="service-image-mid-iamge-jarallax-area">
                    <div className="container-large">
                        <div className="row g-5">
                            <div className="col-lg-6">
                                <div className="thumbnail-area-large-service-detaile-mid jarallax jara-mask-1">
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/service/07.webp"
                                        alt="service"
                                    />
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="thumbnail-area-large-service-detaile-mid jarallax jara-mask-1">
                                    <img
                                        className="jarallax-img"
                                        src="assets/images/service/08.webp"
                                        alt="service"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="service-area-details-wrapper border-bottom">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="mid-content">
                                        <p className="disc">
                                            We are your strategic partners in digital transformation. With
                                            over a decade of experience and a team of certified experts, we
                                            deliver tailored solutions that drive growth, enhance
                                            efficiency, and secure your digital assets.
                                        </p>
                                        <p className="disc">
                                            Luminous works with businesses of all sizes, from small startups
                                            to large enterprises. We tailor our solutions to meet the
                                            specific needs and budget of each client offers a wide range of
                                            IT services. As we invest heavily in ongoing training and
                                            professional development for our team. We also participate in
                                            industry conferences, maintain partnerships with leading
                                            technology providers, and conduct internal research and
                                            development projects.
                                        </p>
                                        <p className="disc">
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management. See how we help your team
                                            solve today’s biggest challenges.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
            <MoreSolutions />


            <FeatureTwo />
            <TestimonialsFive />
            <>
                {/* rts call to action area start */}
                <div className="rts-call-to-action-area-about rts-section-gapTop">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h2 className="title">Book a Free Consultation</h2>
                                <p className="disc">
                                    Schedule a no-obligation consultation to discuss your unique needs
                                    and how Luminous can elevate your business technology.
                                </p>
                                <a
                                    href="#"
                                    className="rts-btn btn-primary wow fadeInUp"
                                    data-wow-delay=".5s"
                                >
                                    View Solutions
                                    <img
                                        className="injectable"
                                        src="assets/images/service/icons/13.svg"
                                        alt="arrow"
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </>

            <FooterOne />
            <BackToTop />
        </div>
    );
}
