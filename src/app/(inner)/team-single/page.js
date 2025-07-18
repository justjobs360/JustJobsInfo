
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderTwo from "@/components/header/HeaderTwo";
import TestimonialsThree from "@/components/testimonials/TestimonialsThree";
import TeamSingleBanner from "@/components/banner/TeamSingleBanner";
export default function Home() {
    return (
        <div className='#'>
            <HeaderTwo />



      
            <TeamSingleBanner />

            <TestimonialsThree />




        <div className="rts-call-to-action-area rts-section-gapTop">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="cta-two-wrapper">
                            <div className="inner">
                                <h2 className="title">Let’s schedule a Free consultation</h2>
                                <p>Offers a 30-day free trial of Luminous Managed IT Services.</p>
                                <a
                                    href="#"
                                    className="rts-btn btn-primary wow fadeInUp"
                                    data-wow-delay=".5s"
                                    style={{
                                        visibility: "visible",
                                        animationDelay: "0.5s",
                                        animationName: "fadeInUp"
                                    }}
                                >
                                    Schedule Now
                                    <svg
                                        width={32}
                                        height={32}
                                        viewBox="0 0 32 32"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        data-inject-url="http://localhost:3000/assets/images/service/icons/13.svg"
                                        className="injectable"
                                    >
                                        <path
                                            d="M9.3335 22.6667L22.6668 9.33337M22.6668 9.33337H9.3335M22.6668 9.33337V22.6667"
                                            stroke="#999999"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </a>
                            </div>
                            <div className="shape-area">
                                <img
                                    src="assets/images/cta/05.png"
                                    alt="cta"
                                    className="one wow toBottomLeft"
                                    style={{ visibility: "visible", animationName: "toBottomLeft" }}
                                />
                                <img
                                    src="assets/images/cta/06.png"
                                    alt="cta"
                                    className="two wow toTopRight"
                                    style={{ visibility: "visible", animationName: "toTopRight" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            <FooterOne />
            <BackToTop />
        </div>
    );
}
