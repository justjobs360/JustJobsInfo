
"use client";
import AboutBanner from "@/components/banner/AboutBanner";
import BackToTop from "@/components/common/BackToTop";
import FooterOneDynamic from "@/components/footer/FooterOneDynamic";
import HeaderOne from "@/components/header/HeaderOne";
import Wedo from "@/components/whatwe-do/Wedo";
import FeatureOne from "@/components/feature/FeatureOne";
import FeatureTwo from "@/components/feature/FeatureTwo";
import ServiceSix from "@/components/services/ServiceSix";
import PricingFour from "@/components/pricing/PricingFour";
import TestimonialsThree from "@/components/testimonials/TestimonialsThree";
import BrandTwo from "@/components/brand/BrandTwo";
import Ctaabout from "@/components/cta/Ctaabout";
import DynamicMetaTags from "@/components/common/DynamicMetaTags";

export default function About() {
    return (
        <DynamicMetaTags pageName="About Us">
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
            <Ctaabout />
            <FooterOneDynamic />
            <BackToTop />
        </div>
        </DynamicMetaTags>
    );
}
