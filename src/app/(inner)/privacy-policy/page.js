
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import FeatureTwo from "@/components/feature/FeatureTwo";
import ServiceSingle from "@/components/banner-service/ServiceSingle";
import TestimonialsFive from "@/components/testimonials/TestimonialsFive";
import CtaFour from "@/components/cta/CtaFour";
import MoreSolutions from "@/components/service-component/MoreSolution";
import HeaderOne from "@/components/header/HeaderOne";

export default function Home() {
    return (
        <div className='#'>
            <HeaderOne />
            <ServiceSingle />
            <div>

                <div className="service-area-details-wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="inner-content">
                                    <div className="top">
                                        <h1 className="title">Privacy Policy</h1>
                                        <p className="disc">
                                            Offers a unified platform that fosters innovation while
                                            providing end-to-end data management.
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

            <CtaFour />
            <FooterOne />
            <BackToTop />
        </div>
    );
}
