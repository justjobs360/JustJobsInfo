
"use client";
import AboutBanner from "@/components/banner/AboutBanner";
import BackToTop from "@/components/common/BackToTop";
import Breadcrumb from "@/components/common/Breadcrumb";
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
import StructuredData from "@/components/common/StructuredData";

export default function About() {
    return (
        <DynamicMetaTags pageName="About Us">
            <StructuredData 
                type="page"
                pageData={{
                    title: 'About JustJobsInfo - Our Story and Mission',
                    description: 'Learn about JustJobsInfo and our mission to help professionals succeed in their careers through expert resume services.',
                    image: 'https://justjobs.info/assets/images/og-images/og-about.webp'
                }}
            />
            <div className='#'>
            <HeaderOne />
            <Breadcrumb />
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
