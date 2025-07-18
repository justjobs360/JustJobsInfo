
import AboutBanner from "@/components/banner/AboutBanner";
import BackToTop from "@/components/common/BackToTop";
import FooterOne from "@/components/footer/FooterOne";
import HeaderOne from "@/components/header/HeaderOne";
import Wedo from "@/components/whatwe-do/Wedo";
import FeatureOne from "@/components/feature/FeatureOne";
import FeatureTwo from "@/components/feature/FeatureTwo";
import ServiceSix from "@/components/services/ServiceSix";
import PricingFour from "@/components/pricing/PricingFour";
import TestimonialsThree from "@/components/testimonials/TestimonialsThree";
import BrandTwo from "@/components/brand/BrandTwo";
import CtaFour from "@/components/cta/CtaFour";

export default function Home() {
    return (
        <div className='#'>
            <HeaderOne />
            <AboutBanner />
            <Wedo />
            <FeatureOne />
            <FeatureTwo />
            <ServiceSix />
            <PricingFour />
            <BrandTwo />
            <TestimonialsThree />
            <CtaFour />
            <FooterOne />
            <BackToTop />
        </div>
    );
}
